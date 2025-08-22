import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Eye,
  Lock,
  Cookie,
  User,
  Mail,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import OLXStyleHeader from "../components/OLXStyleHeader";
import StaticFooter from "../components/StaticFooter";

export default function PrivacyPolicy() {
  useEffect(() => {
    // Set page title and meta tags for SEO
    document.title =
      "Privacy Policy - Aashish Properties | How We Protect Your Data";

    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Read Aashish Properties privacy policy to understand how we collect, use, and protect your personal information. Your privacy and data security are our priority.",
      );
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content =
        "Read Aashish Properties privacy policy to understand how we collect, use, and protect your personal information. Your privacy and data security are our priority.";
      document.head.appendChild(meta);
    }

    // Set canonical URL
    const canonical =
      document.querySelector('link[rel="canonical"]') ||
      document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    canonical.setAttribute("href", `${window.location.origin}/privacy-policy`);
    if (!document.querySelector('link[rel="canonical"]')) {
      document.head.appendChild(canonical);
    }

    // Add JSON-LD structured data for breadcrumbs
    const jsonLd = {
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
          name: "Privacy Policy",
          item: `${window.location.origin}/privacy-policy`,
        },
      ],
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    // Analytics event
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "page_view",
        path: "/privacy-policy",
        page_title: "Privacy Policy",
      });
    }

    // Cleanup function
    return () => {
      const scriptTags = document.querySelectorAll(
        'script[type="application/ld+json"]',
      );
      scriptTags.forEach((script) => {
        if (script.textContent?.includes("Privacy Policy")) {
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

  const lastUpdated = "January 15, 2024";
  const effectiveDate = "January 15, 2024";

  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      icon: Shield,
      content: `
        At Aashish Properties, we are committed to protecting your privacy and personal information. 
        This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
        when you visit our website, use our services, or interact with us in any way.
        
        By using our services, you consent to the collection and use of information in accordance 
        with this policy. If you do not agree with our policies and practices, do not use our services.
      `,
    },
    {
      id: "information-we-collect",
      title: "Information We Collect",
      icon: Eye,
      content: `
        We collect information in several ways:
        
        **Personal Information You Provide:**
        • Name, email address, phone number
        • Property preferences and requirements
        • Budget and financial information (when relevant)
        • Communication history and inquiries
        • Account registration details
        
        **Automatically Collected Information:**
        • IP address and device information
        • Browser type and version
        • Pages visited and time spent on site
        • Referring website information
        • Location data (with your permission)
        
        **Third-Party Information:**
        • Social media profile information (if you connect accounts)
        • Information from property databases and public records
        • Verification information from third-party services
      `,
    },
    {
      id: "how-we-use-information",
      title: "How We Use Your Information",
      icon: User,
      content: `
        We use your information for the following purposes:
        
        **Service Provision:**
        • Provide property search and listing services
        • Match you with suitable properties
        • Facilitate property transactions
        • Provide customer support and assistance
        
        **Communication:**
        • Send property updates and notifications
        • Respond to inquiries and requests
        • Send newsletters and marketing materials (with consent)
        • Provide important service announcements
        
        **Business Operations:**
        • Improve our website and services
        • Analyze usage patterns and trends
        • Prevent fraud and ensure security
        • Comply with legal obligations
        
        **Marketing and Advertising:**
        • Personalize your experience
        • Show relevant property listings
        • Send targeted marketing communications
        • Measure advertising effectiveness
      `,
    },
    {
      id: "information-sharing",
      title: "Information Sharing and Disclosure",
      icon: Lock,
      content: `
        We may share your information in the following circumstances:
        
        **Service Providers:**
        • Property owners and agents (for legitimate inquiries)
        • Payment processors and financial institutions
        • Technology service providers
        • Legal and professional advisors
        
        **Business Transfers:**
        • In case of merger, acquisition, or sale of assets
        • During business restructuring or reorganization
        
        **Legal Requirements:**
        • When required by law or legal process
        • To protect our rights and property
        • To prevent fraud or criminal activity
        • For public safety or national security
        
        **With Your Consent:**
        • When you explicitly authorize sharing
        • For specific services you request
        
        We do not sell your personal information to third parties for marketing purposes.
      `,
    },
    {
      id: "cookies-and-tracking",
      title: "Cookies and Tracking Technologies",
      icon: Cookie,
      content: `
        We use cookies and similar technologies to enhance your experience:
        
        **Essential Cookies:**
        • Required for basic website functionality
        • Enable secure login and authentication
        • Remember your preferences and settings
        
        **Analytics Cookies:**
        • Help us understand how you use our site
        • Measure website performance
        • Identify popular content and features
        
        **Marketing Cookies:**
        • Personalize content and advertisements
        • Track the effectiveness of marketing campaigns
        • Enable social media sharing features
        
        **Managing Cookies:**
        You can control cookies through your browser settings. However, disabling 
        certain cookies may affect website functionality.
        
        **Third-Party Cookies:**
        We may use services like Google Analytics, Facebook Pixel, and other 
        analytics tools that place their own cookies.
      `,
    },
    {
      id: "data-security",
      title: "Data Security",
      icon: Shield,
      content: `
        We implement comprehensive security measures to protect your information:
        
        **Technical Safeguards:**
        • SSL encryption for data transmission
        • Secure server infrastructure
        • Regular security audits and updates
        • Access controls and authentication
        
        **Organizational Measures:**
        • Employee training on data protection
        • Limited access to personal information
        • Regular security policy reviews
        • Incident response procedures
        
        **Physical Security:**
        • Secure office premises
        • Controlled access to equipment
        • Secure disposal of sensitive documents
        
        While we strive to protect your information, no method of transmission 
        over the internet is 100% secure. We cannot guarantee absolute security.
      `,
    },
    {
      id: "user-rights",
      title: "Your Rights and Choices",
      icon: User,
      content: `
        You have several rights regarding your personal information:
        
        **Access and Portability:**
        • Request a copy of your personal data
        • Export your information in a readable format
        • Receive details about how we process your data
        
        **Correction and Updates:**
        • Correct inaccurate information
        • Update your profile and preferences
        • Add missing information
        
        **Deletion and Restriction:**
        • Request deletion of your personal data
        • Restrict processing of your information
        • Withdraw consent for data processing
        
        **Marketing Communications:**
        • Opt out of marketing emails
        • Unsubscribe from newsletters
        • Control notification preferences
        
        **Data Processing:**
        • Object to certain types of processing
        • Request transfer to another service provider
        
        To exercise these rights, contact us at privacy@aashishproperty.com
      `,
    },
    {
      id: "data-retention",
      title: "Data Retention",
      icon: Calendar,
      content: `
        We retain your information for different periods based on the type of data:
        
        **Account Information:**
        • Retained while your account is active
        • 3 years after account closure (for legal compliance)
        
        **Communication Records:**
        �� Email and chat histories: 5 years
        • Call recordings: 2 years
        • Support tickets: 3 years
        
        **Transaction Data:**
        • Property inquiry history: 7 years
        • Payment records: 7 years (tax and legal requirements)
        • Contract documents: 10 years
        
        **Marketing Data:**
        • Newsletter subscriptions: Until you unsubscribe
        • Website analytics: 26 months (Google Analytics default)
        
        **Legal Hold:**
        We may retain data longer if required for legal proceedings, 
        investigations, or regulatory compliance.
      `,
    },
    {
      id: "international-transfers",
      title: "International Data Transfers",
      icon: FileText,
      content: `
        Your information may be transferred to and processed in countries 
        other than India, including:
        
        **Cloud Storage:**
        • Servers located in multiple countries
        • Data centers with adequate security measures
        • Compliance with international standards
        
        **Service Providers:**
        • International technology partners
        • Global payment processors
        • Analytics and marketing platforms
        
        **Safeguards:**
        We ensure appropriate safeguards are in place for international transfers, 
        including contractual protections and compliance with applicable data 
        protection laws.
      `,
    },
    {
      id: "children-privacy",
      title: "Children's Privacy",
      icon: AlertCircle,
      content: `
        Our services are not intended for children under 18 years of age:
        
        • We do not knowingly collect personal information from children
        • If we learn we have collected child information, we will delete it
        • Parents/guardians can contact us to review or delete child data
        • We comply with applicable children's privacy laws
        
        If you believe we have collected information from a child, 
        please contact us immediately at privacy@aashishproperty.com
      `,
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
              Privacy Policy
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-[#C70000] mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Privacy Policy
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6">
            We are committed to protecting your privacy and ensuring the
            security of your personal information.
          </p>

          {/* Last Updated Info */}
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="px-4 py-2">
              <Calendar className="h-4 w-4 mr-2" />
              Last Updated: {lastUpdated}
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <CheckCircle className="h-4 w-4 mr-2" />
              Effective: {effectiveDate}
            </Badge>
          </div>
        </section>

        {/* Important Notice */}
        <Alert className="mb-8 border-[#C70000] bg-red-50">
          <AlertCircle className="h-4 w-4 text-[#C70000]" />
          <AlertDescription className="text-gray-800">
            <strong>Important:</strong> This privacy policy was last updated on{" "}
            {lastUpdated}. We may update this policy from time to time. We will
            notify you of any material changes by email or through a prominent
            notice on our website.
          </AlertDescription>
        </Alert>

        {/* Table of Contents */}
        <Card className="mb-8 bg-gray-100">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">
              Table of Contents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-2">
              {sections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center text-sm text-gray-600 hover:text-[#C70000] transition-colors py-1"
                  onClick={() =>
                    handleFooterLinkClick(`privacy_toc_${section.id}`)
                  }
                >
                  <section.icon className="h-4 w-4 mr-2 text-[#C70000]" />
                  {index + 1}. {section.title}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <Card
              key={section.id}
              id={section.id}
              className="bg-white shadow-sm"
            >
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-gray-900">
                  <section.icon className="h-6 w-6 mr-3 text-[#C70000]" />
                  {index + 1}. {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray max-w-none">
                  {section.content.split("\n").map((paragraph, pIndex) => {
                    if (paragraph.trim() === "") return null;

                    if (
                      paragraph.startsWith("**") &&
                      paragraph.endsWith("**")
                    ) {
                      return (
                        <h4
                          key={pIndex}
                          className="font-semibold text-gray-900 mt-4 mb-2"
                        >
                          {paragraph.slice(2, -2)}
                        </h4>
                      );
                    }

                    if (paragraph.startsWith("•")) {
                      return (
                        <li key={pIndex} className="text-gray-700 ml-4">
                          {paragraph.slice(1).trim()}
                        </li>
                      );
                    }

                    return (
                      <p
                        key={pIndex}
                        className="text-gray-700 leading-relaxed mb-3"
                      >
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Information for Privacy Matters */}
        <Card className="mt-12 bg-gradient-to-r from-[#C70000] to-red-700 text-white">
          <CardContent className="py-8">
            <div className="text-center">
              <Mail className="h-12 w-12 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">
                Questions About Your Privacy?
              </h2>
              <p className="text-red-100 mb-6 max-w-2xl mx-auto">
                If you have any questions about this Privacy Policy, your
                personal data, or would like to exercise your rights, please
                contact our Privacy Team.
              </p>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold">Privacy Officer</p>
                  <p className="text-red-100">Aashish Properties</p>
                </div>
                <div className="space-y-2">
                  <p>
                    <strong>Email:</strong>{" "}
                    <a
                      href="mailto:privacy@aashishproperty.com"
                      className="underline hover:no-underline"
                      onClick={() =>
                        handleFooterLinkClick("privacy_contact_email")
                      }
                    >
                      privacy@aashishproperty.com
                    </a>
                  </p>
                  <p>
                    <strong>Phone:</strong>{" "}
                    <a
                      href="tel:+919876543210"
                      className="underline hover:no-underline"
                      onClick={() =>
                        handleFooterLinkClick("privacy_contact_phone")
                      }
                    >
                      +91 9876543210
                    </a>
                  </p>
                  <p>
                    <strong>Address:</strong> Model Town, Rohtak, Haryana
                    124001, India
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <Button
                  asChild
                  variant="secondary"
                  className="bg-white text-[#C70000] hover:bg-gray-100"
                  onClick={() => handleFooterLinkClick("privacy_contact_form")}
                >
                  <Link to="/contact">Contact Privacy Team</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Disclaimer */}
        <div className="mt-8 p-6 bg-gray-100 rounded-lg text-sm text-gray-600">
          <p className="mb-2">
            <strong>Disclaimer:</strong> This privacy policy is provided for
            informational purposes and does not constitute legal advice. Laws
            and regulations may vary by jurisdiction.
          </p>
          <p>
            For the most current version of this privacy policy, please visit
            our website. This policy is effective as of {effectiveDate} and was
            last updated on {lastUpdated}.
          </p>
        </div>

        {/* Quick Links */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Related Information:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="outline"
              asChild
              onClick={() => handleFooterLinkClick("related_terms")}
            >
              <Link to="/terms-of-service">Terms of Service</Link>
            </Button>
            <Button
              variant="outline"
              asChild
              onClick={() => handleFooterLinkClick("related_contact")}
            >
              <Link to="/contact">Contact Us</Link>
            </Button>
            <Button
              variant="outline"
              asChild
              onClick={() => handleFooterLinkClick("related_help")}
            >
              <Link to="/help-center">Help Center</Link>
            </Button>
          </div>
        </div>
      </main>

      <StaticFooter />
    </div>
  );
}
