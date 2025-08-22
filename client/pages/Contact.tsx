import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Alert, AlertDescription } from "../components/ui/alert";
import OLXStyleHeader from "../components/OLXStyleHeader";
import StaticFooter from "../components/StaticFooter";

// Form validation schema
const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  phone: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone) return true; // Optional field
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
      return phoneRegex.test(phone);
    }, "Please enter a valid phone number"),
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(100, "Subject must be less than 100 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be less than 1000 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const { toast } = useToast();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  useEffect(() => {
    // Set page title and meta tags for SEO
    document.title =
      "Contact Us - Aashish Properties | Get In Touch With Our Property Experts";

    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Contact Aashish Properties for all your real estate needs in Rohtak. Get expert advice, property consultations, and personalized service. Call +91 9876543210",
      );
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content =
        "Contact Aashish Properties for all your real estate needs in Rohtak. Get expert advice, property consultations, and personalized service. Call +91 9876543210";
      document.head.appendChild(meta);
    }

    // Set canonical URL
    const canonical =
      document.querySelector('link[rel="canonical"]') ||
      document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    canonical.setAttribute("href", `${window.location.origin}/contact`);
    if (!document.querySelector('link[rel="canonical"]')) {
      document.head.appendChild(canonical);
    }

    // Add JSON-LD structured data for business contact info
    const businessJsonLd = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: "Aashish Properties",
      description: "Trusted real estate services in Rohtak, Haryana",
      telephone: "+91-9876543210",
      email: "info@aashishproperty.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Model Town",
        addressLocality: "Rohtak",
        addressRegion: "Haryana",
        postalCode: "124001",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: "28.8955",
        longitude: "76.6066",
      },
      openingHours: ["Mo-Sa 09:00-18:00", "Su 10:00-17:00"],
      priceRange: "$$",
    };

    // Add breadcrumb structured data
    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: window.location.origin,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Contact Us",
          item: `${window.location.origin}/contact`,
        },
      ],
    };

    const businessScript = document.createElement("script");
    businessScript.type = "application/ld+json";
    businessScript.textContent = JSON.stringify(businessJsonLd);
    document.head.appendChild(businessScript);

    const breadcrumbScript = document.createElement("script");
    breadcrumbScript.type = "application/ld+json";
    breadcrumbScript.textContent = JSON.stringify(breadcrumbJsonLd);
    document.head.appendChild(breadcrumbScript);

    // Analytics event
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "page_view",
        path: "/contact",
        page_title: "Contact Us",
      });
    }

    // Cleanup function
    return () => {
      const scriptTags = document.querySelectorAll(
        'script[type="application/ld+json"]',
      );
      scriptTags.forEach((script) => {
        if (
          script.textContent?.includes("Contact Us") ||
          script.textContent?.includes("Aashish Properties")
        ) {
          script.remove();
        }
      });
    };
  }, []);

  const handleFooterLinkClick = (label: string) => {
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "footer_link_click",
        label: label,
      });
    }
  };

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setSubmitMessage("");

    try {
      // Analytics event for form submission attempt
      if (typeof window !== "undefined" && window.dataLayer) {
        window.dataLayer.push({
          event: "contact_form_submit",
          form_data: {
            has_phone: !!data.phone,
            subject_length: data.subject.length,
            message_length: data.message.length,
          },
        });
      }

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setSubmitStatus("success");
        setSubmitMessage(
          "Thank you for your message! We'll get back to you within 24 hours.",
        );

        // Show success toast
        toast({
          title: "Message Sent Successfully!",
          description: "We'll contact you soon.",
          duration: 5000,
        });

        // Reset form
        form.reset();

        // Analytics success event
        if (typeof window !== "undefined" && window.dataLayer) {
          window.dataLayer.push({
            event: "contact_form_success",
            form_id: result.id || "unknown",
          });
        }
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
    } catch (error: any) {
      console.error("Contact form submission error:", error);
      setSubmitStatus("error");
      setSubmitMessage(
        error.message.includes("fetch")
          ? "Unable to send message. Please check your internet connection and try again."
          : `Failed to send message: ${error.message}`,
      );

      // Show error toast
      toast({
        title: "Failed to Send Message",
        description: "Please try again or contact us directly.",
        variant: "destructive",
        duration: 5000,
      });

      // Analytics error event
      if (typeof window !== "undefined" && window.dataLayer) {
        window.dataLayer.push({
          event: "contact_form_error",
          error_message: error.message,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone Number",
      value: "+91 9876543210",
      description: "Mon-Sat 9AM-6PM, Sun 10AM-5PM",
      href: "tel:+919876543210",
    },
    {
      icon: Mail,
      title: "Email Address",
      value: "info@aashishproperty.com",
      description: "We'll respond within 24 hours",
      href: "mailto:info@aashishproperty.com",
    },
    {
      icon: MapPin,
      title: "Office Address",
      value: "Model Town, Rohtak",
      description: "Haryana 124001, India",
      href: "https://maps.google.com/?q=Model+Town+Rohtak+Haryana",
    },
    {
      icon: Clock,
      title: "Business Hours",
      value: "Mon-Sat: 9AM-6PM",
      description: "Sunday: 10AM-5PM",
      href: null,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <OLXStyleHeader />

      {/* Breadcrumb Navigation */}
      <nav
        className="bg-white border-b border-gray-200"
        aria-label="Breadcrumb"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-[#C70000] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium" aria-current="page">
              Contact Us
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            asChild
            className="text-gray-600 hover:text-[#C70000]"
          >
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Header Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Contact <span className="text-[#C70000]">Aashish Properties</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Ready to find your dream property or need expert real estate advice?
            Get in touch with our experienced team today.
          </p>
        </section>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900">
                  Send us a Message
                </CardTitle>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you within 24
                  hours.
                </p>
              </CardHeader>
              <CardContent>
                {/* Status Messages */}
                {submitStatus === "success" && (
                  <Alert className="mb-6 border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      {submitMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {submitStatus === "error" && (
                  <Alert
                    className="mb-6 border-red-200 bg-red-50"
                    variant="destructive"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{submitMessage}</AlertDescription>
                  </Alert>
                )}

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Name Field */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your full name"
                                {...field}
                                disabled={isSubmitting}
                                className="focus:ring-[#C70000] focus:border-[#C70000]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Email Field */}
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="your.email@example.com"
                                {...field}
                                disabled={isSubmitting}
                                className="focus:ring-[#C70000] focus:border-[#C70000]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Phone Field */}
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="+91 98765 43210"
                                {...field}
                                disabled={isSubmitting}
                                className="focus:ring-[#C70000] focus:border-[#C70000]"
                              />
                            </FormControl>
                            <FormDescription>
                              Optional - for faster response
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Subject Field */}
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Property inquiry, investment advice..."
                                {...field}
                                disabled={isSubmitting}
                                className="focus:ring-[#C70000] focus:border-[#C70000]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Message Field */}
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about your property requirements, budget, preferred location, or any specific questions you have..."
                              className="min-h-[120px] focus:ring-[#C70000] focus:border-[#C70000]"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormDescription>
                            Be as detailed as possible to help us serve you
                            better
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#C70000] hover:bg-red-700 text-white py-3"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>

                    <p className="text-sm text-gray-500 text-center">
                      * Required fields. Your information is secure and will not
                      be shared.
                    </p>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information Sidebar */}
          <div className="space-y-6">
            {/* Contact Details */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">
                  Get in Touch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#C70000] rounded-lg flex items-center justify-center flex-shrink-0">
                      <info.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {info.title}
                      </h3>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="text-[#C70000] hover:text-red-700 font-medium transition-colors"
                          target={
                            info.href.startsWith("http") ? "_blank" : "_self"
                          }
                          rel={
                            info.href.startsWith("http")
                              ? "noopener noreferrer"
                              : ""
                          }
                          onClick={() =>
                            handleFooterLinkClick(
                              `contact_${info.title.toLowerCase().replace(" ", "_")}`,
                            )
                          }
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-gray-900 font-medium">
                          {info.value}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">
                        {info.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Map Placeholder */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">
                  Visit Our Office
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                  {/* Map placeholder - in a real app, you'd integrate Google Maps or similar */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#C70000] to-red-700 opacity-20"></div>
                  <div className="text-center z-10">
                    <MapPin className="h-12 w-12 text-[#C70000] mx-auto mb-2" />
                    <p className="font-semibold text-gray-900">
                      Aashish Properties
                    </p>
                    <p className="text-sm text-gray-600">Model Town, Rohtak</p>
                    <p className="text-sm text-gray-600">Haryana, India</p>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      asChild
                      onClick={() => handleFooterLinkClick("office_directions")}
                    >
                      <a
                        href="https://maps.google.com/?q=Model+Town+Rohtak+Haryana"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Get Directions
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>
                    <strong>Parking:</strong> Free parking available on-site
                  </p>
                  <p>
                    <strong>Public Transport:</strong> Near main bus stand and
                    railway station
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  💡 Quick Tips
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Include your budget and preferred location</li>
                  <li>• Mention if you're a first-time buyer</li>
                  <li>• Specify property type (residential/commercial)</li>
                  <li>• Let us know your timeline</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Alternative Contact Methods */}
        <section className="mt-16">
          <Card className="bg-gradient-to-r from-[#C70000] to-red-700 text-white">
            <CardContent className="py-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">
                  Need Immediate Assistance?
                </h2>
                <p className="text-red-100 mb-6 max-w-2xl mx-auto">
                  For urgent property inquiries or immediate assistance, you can
                  reach us directly through these channels.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    variant="secondary"
                    className="bg-white text-[#C70000] hover:bg-gray-100"
                    onClick={() => handleFooterLinkClick("urgent_call")}
                  >
                    <a href="tel:+919876543210">
                      <Phone className="mr-2 h-4 w-4" />
                      Call Now: +91 9876543210
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-[#C70000]"
                    onClick={() => handleFooterLinkClick("urgent_whatsapp")}
                  >
                    <a
                      href="https://wa.me/919876543210"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      WhatsApp Us
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <StaticFooter />
    </div>
  );
}
