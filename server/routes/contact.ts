import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../db/mongodb";

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

interface ContactSubmission extends ContactFormData {
  _id?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  status: "new" | "replied" | "closed";
  ipAddress?: string;
  userAgent?: string;
}

// POST /api/contact - Submit a contact form
export const submitContactForm: RequestHandler = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body as ContactFormData;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, email, subject, message",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address format",
      });
    }

    // Validate phone number if provided (optional field)
    if (phone && phone.trim()) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
      if (!phoneRegex.test(phone.trim())) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number format",
        });
      }
    }

    // Validate name (no empty or only whitespace)
    if (!name.trim() || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters long",
      });
    }

    // Validate name contains only letters and spaces
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(name.trim())) {
      return res.status(400).json({
        success: false,
        message: "Name can only contain letters and spaces",
      });
    }

    // Validate subject length
    if (!subject.trim() || subject.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Subject must be at least 5 characters long",
      });
    }

    if (subject.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: "Subject must be less than 100 characters",
      });
    }

    // Validate message length
    if (!message.trim() || message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Message must be at least 10 characters long",
      });
    }

    if (message.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Message must be less than 1000 characters",
      });
    }

    // Get database connection
    const db = getDatabase();
    const contactCollection = db.collection("contact_submissions");

    // Check for spam (rate limiting by IP - max 5 submissions per hour)
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const recentSubmissions = await contactCollection.countDocuments({
      ipAddress: ipAddress,
      createdAt: { $gte: oneHourAgo }
    });

    if (recentSubmissions >= 5) {
      return res.status(429).json({
        success: false,
        message: "Too many submissions. Please try again in an hour.",
      });
    }

    // Check for duplicate submission in last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const duplicateSubmission = await contactCollection.findOne({
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      createdAt: { $gte: tenMinutesAgo }
    });

    if (duplicateSubmission) {
      return res.status(409).json({
        success: false,
        message: "Duplicate submission detected. Please wait before submitting again.",
      });
    }

    // Create contact submission document
    const contactSubmission: ContactSubmission = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || undefined,
      subject: subject.trim(),
      message: message.trim(),
      status: "new",
      ipAddress: ipAddress,
      userAgent: req.get('User-Agent'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert the submission
    const result = await contactCollection.insertOne(contactSubmission);

    if (!result.insertedId) {
      throw new Error("Failed to insert contact submission");
    }

    // Log the submission for monitoring
    console.log(`📧 New contact submission from ${email}: ${subject}`);

    // Return success response
    res.status(201).json({
      success: true,
      message: "Contact form submitted successfully. We'll get back to you within 24 hours.",
      data: {
        id: result.insertedId.toString(),
        submittedAt: contactSubmission.createdAt,
      },
    });

  } catch (error: any) {
    console.error("Error submitting contact form:", error);
    
    res.status(500).json({
      success: false,
      message: "Failed to submit contact form. Please try again later.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// GET /api/admin/contact - Get all contact submissions (admin only)
export const getContactSubmissions: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const contactCollection = db.collection("contact_submissions");

    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const search = req.query.search as string;

    // Build filter
    const filter: any = {};
    
    if (status && ["new", "replied", "closed"].includes(status)) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    // Get total count
    const total = await contactCollection.countDocuments(filter);

    // Get submissions with pagination
    const submissions = await contactCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Get statistics
    const stats = await contactCollection.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const statusCounts = {
      new: 0,
      replied: 0,
      closed: 0,
      total: total
    };

    stats.forEach(stat => {
      if (stat._id in statusCounts) {
        statusCounts[stat._id as keyof typeof statusCounts] = stat.count;
      }
    });

    res.json({
      success: true,
      data: {
        submissions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        stats: statusCounts,
      },
    });

  } catch (error: any) {
    console.error("Error fetching contact submissions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contact submissions",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// PUT /api/admin/contact/:id/status - Update contact submission status (admin only)
export const updateContactStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid submission ID format",
      });
    }

    // Validate status
    if (!["new", "replied", "closed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'new', 'replied', or 'closed'",
      });
    }

    const db = getDatabase();
    const contactCollection = db.collection("contact_submissions");

    // Update the submission
    const result = await contactCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Contact submission not found",
      });
    }

    console.log(`📧 Contact submission ${id} status updated to: ${status}`);

    res.json({
      success: true,
      message: "Contact submission status updated successfully",
    });

  } catch (error: any) {
    console.error("Error updating contact submission status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update contact submission status",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// GET /api/admin/contact/stats - Get contact submission statistics (admin only)
export const getContactStats: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const contactCollection = db.collection("contact_submissions");

    // Get stats for different time periods
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalSubmissions, todaySubmissions, weekSubmissions, monthSubmissions, statusBreakdown] = await Promise.all([
      contactCollection.countDocuments(),
      contactCollection.countDocuments({ createdAt: { $gte: todayStart } }),
      contactCollection.countDocuments({ createdAt: { $gte: weekStart } }),
      contactCollection.countDocuments({ createdAt: { $gte: monthStart } }),
      contactCollection.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]).toArray()
    ]);

    const stats = {
      total: totalSubmissions,
      today: todaySubmissions,
      thisWeek: weekSubmissions,
      thisMonth: monthSubmissions,
      byStatus: {
        new: 0,
        replied: 0,
        closed: 0
      }
    };

    statusBreakdown.forEach(item => {
      if (item._id in stats.byStatus) {
        stats.byStatus[item._id as keyof typeof stats.byStatus] = item.count;
      }
    });

    res.json({
      success: true,
      data: stats,
    });

  } catch (error: any) {
    console.error("Error fetching contact stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contact statistics",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
