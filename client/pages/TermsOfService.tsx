import { useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Scale, 
  FileText, 
  AlertTriangle, 
  CreditCard, 
  Shield,
  Calendar,
  CheckCircle,
  Users,
  Globe,
  Gavel,
  AlertCircle,
  Building
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import OLXStyleHeader from "../components/OLXStyleHeader";
import StaticFooter from "../components/StaticFooter";

export default function TermsOfService() {
  useEffect(() => {
    // Set page title and meta tags for SEO
    document.title = "Terms of Service - Aashish Properties | Legal Terms and Conditions";
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content", 
        "Read Aashish Properties terms of service and legal conditions. Understand your rights and responsibilities when using our real estate platform and services."
      );
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = "Read Aashish Properties terms of service and legal conditions. Understand your rights and responsibilities when using our real estate platform and services.";
      document.head.appendChild(meta);
    }

    // Set canonical URL
    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    canonical.setAttribute("href", `${window.location.origin}/terms-of-service`);
    if (!document.querySelector('link[rel="canonical"]')) {
      document.head.appendChild(canonical);
    }

    // Add JSON-LD structured data for breadcrumbs
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": window.location.origin
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Terms of Service",
          "item": `${window.location.origin}/terms-of-service`
        }
      ]
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    // Analytics event
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: "page_view",
        path: "/terms-of-service",
        page_title: "Terms of Service"
      });
    }

    // Cleanup function
    return () => {
      const scriptTags = document.querySelectorAll('script[type="application/ld+json"]');
      scriptTags.forEach(script => {
        if (script.textContent?.includes('Terms of Service')) {
          script.remove();
        }
      });
    };
  }, []);

  const handleFooterLinkClick = (label: string) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: "footer_link_click",
        label: label
      });
    }
  };

  const lastUpdated = "January 15, 2024";
  const effectiveDate = "January 15, 2024";

  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: CheckCircle,
      content: `
        By accessing and using the Aashish Properties website, mobile application, 
        or any of our services, you accept and agree to be bound by these Terms of Service.
        
        **Agreement to Terms:**
        • These terms constitute a legally binding agreement between you and Aashish Properties
        • Your use of our services indicates your acceptance of these terms
        • If you do not agree with these terms, you must not use our services
        • These terms apply to all users, including browsers, customers, and contributors
        
        **Updates to Terms:**
        • We reserve the right to modify these terms at any time
        • Changes will be effective immediately upon posting
        • Continued use after changes constitutes acceptance of new terms
        • We will notify users of material changes via email or website notice
        
        **Age Requirements:**
        • You must be at least 18 years old to use our services
        • If you are under 18, you may only use our services with parental consent
        • We may verify your age and identity as required
      `
    },
    {
      id: "use-restrictions",
      title: "Use Restrictions and Guidelines",
      icon: AlertTriangle,
      content: `
        Your use of our services is subject to the following restrictions:
        
        **Permitted Uses:**
        • Browse and search property listings
        • Contact property owners and agents
        • Create and manage user accounts
        • Submit property inquiries and applications
        • Use our communication features for legitimate purposes
        
        **Prohibited Activities:**
        • Violating any applicable laws or regulations
        • Impersonating others or providing false information
        • Harassing, threatening, or intimidating other users
        • Posting spam, advertisements, or unsolicited communications
        • Attempting to hack, disrupt, or damage our systems
        • Scraping or copying our content without permission
        • Using our services for illegal or fraudulent activities
        • Interfering with other users' enjoyment of our services
        
        **Content Guidelines:**
        • All user-generated content must be accurate and truthful
        • No offensive, defamatory, or inappropriate content
        • Respect intellectual property rights
        • No misleading or false property information
        
        **Account Responsibilities:**
        • Maintain the security of your account credentials
        • Notify us immediately of any unauthorized access
        • You are responsible for all activities under your account
        • One account per person or business entity
      `
    },
    {
      id: "property-listings",
      title: "Property Listings and Information",
      icon: Building,
      content: `
        Our platform connects buyers, sellers, and renters, but we are not party to transactions:
        
        **Listing Accuracy:**
        • Property information is provided by property owners and agents
        • We strive for accuracy but cannot guarantee all information is current
        • Users should verify all details independently
        • We are not responsible for inaccurate or outdated listings
        
        **Property Verification:**
        • We encourage users to verify property ownership and legal status
        • Visit properties in person before making decisions
        • Verify all legal documents and permits
        • Conduct due diligence on all transactions
        
        **Listing Responsibilities:**
        • Property owners must provide accurate information
        • All legal requirements must be met for listings
        • Discrimination in housing is prohibited
        • Listings must comply with local laws and regulations
        
        **Transaction Facilitation:**
        • We provide a platform for connections, not transaction guarantees
        • All negotiations and agreements are between users
        • We are not responsible for failed transactions
        • Legal compliance is the responsibility of transaction parties
      `
    },
    {
      id: "payments-fees",
      title: "Payments and Fees",
      icon: CreditCard,
      content: `
        Information about our fees and payment policies:
        
        **Service Fees:**
        • Basic property search and browsing is free
        • Premium features may require subscription or payment
        • Advertising and listing fees may apply for property owners
        • Commission may be charged for successful transactions
        
        **Payment Terms:**
        • All fees are due when services are provided
        • Payments are processed securely through approved providers
        • Refunds are subject to our refund policy
        • Failed payments may result in service suspension
        
        **Billing and Subscriptions:**
        • Subscription fees are billed in advance
        • Automatic renewal unless cancelled
        • Pro-rated refunds for cancelled annual subscriptions
        • Price changes will be communicated in advance
        
        **Third-Party Payments:**
        • Property transactions are between users and property owners
        • We do not handle security deposits or rental payments
        • All transaction payments are user responsibility
        • Verify payment methods and protect against fraud
        
        **Taxes:**
        • Users are responsible for applicable taxes
        • Service fees may be subject to GST or other taxes
        • International users may have additional tax obligations
      `
    },
    {
      id: "disclaimers",
      title: "Disclaimers and Warranties",
      icon: AlertCircle,
      content: `
        Important disclaimers regarding our services:
        
        **Service Availability:**
        • Services are provided "as is" without warranties
        • We do not guarantee uninterrupted or error-free service
        • Maintenance and updates may cause temporary disruptions
        • Third-party integrations may affect service availability
        
        **Information Accuracy:**
        • Property information is provided by third parties
        • We make no representations about accuracy or completeness
        • Users must verify all information independently
        • Market conditions and property details change frequently
        
        **Investment Advice:**
        • We do not provide investment or financial advice
        • All property decisions are user responsibility
        • Consult qualified professionals for advice
        • Real estate investments carry inherent risks
        
        **Third-Party Content:**
        • We are not responsible for third-party websites or content
        • Links to external sites are for convenience only
        • Third-party terms and privacy policies apply
        • We do not endorse third-party products or services
        
        **System Security:**
        • While we implement security measures, no system is completely secure
        • Users are responsible for protecting their account information
        • Report security issues immediately
        • We are not liable for unauthorized access due to user negligence
      `
    },
    {
      id: "liability-limitations",
      title: "Limitation of Liability",
      icon: Shield,
      content: `
        Important limitations on our liability:
        
        **Limitation of Damages:**
        • Our liability is limited to the amount you paid for services
        • We are not liable for indirect, incidental, or consequential damages
        • This includes lost profits, data loss, or business interruption
        • Maximum liability per incident is limited to ₹10,000
        
        **Property Transaction Liability:**
        • We are not party to property transactions
        • Users bear all risks in property dealings
        • Verify all legal, financial, and property details independently
        • We are not liable for transaction failures or disputes
        
        **Third-Party Actions:**
        • Not liable for actions of property owners, agents, or other users
        • Users interact with third parties at their own risk
        • Background checks and verification are user responsibility
        • Report suspicious or fraudulent activity immediately
        
        **Force Majeure:**
        • Not liable for events beyond our reasonable control
        • This includes natural disasters, government actions, or technical failures
        • Service interruptions due to force majeure events
        • We will make reasonable efforts to minimize disruptions
        
        **Jurisdictional Limitations:**
        • Some jurisdictions may not allow liability limitations
        • Local consumer protection laws may apply
        • These limitations apply to the maximum extent permitted by law
      `
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property Rights",
      icon: FileText,
      content: `
        Protection of intellectual property rights:
        
        **Our Intellectual Property:**
        • Website design, logos, and branding are our property
        • Software, algorithms, and technology are proprietary
        • Content, text, and marketing materials are copyrighted
        • Unauthorized use is prohibited and may result in legal action
        
        **User Content:**
        • You retain ownership of content you upload
        • You grant us license to use, display, and distribute your content
        • You are responsible for ensuring you have rights to uploaded content
        • We may remove content that violates intellectual property rights
        
        **Copyright Protection:**
        • We respect intellectual property rights of others
        • Report copyright infringement to legal@aashishproperty.com
        • We will remove infringing content upon valid notice
        • Repeat infringers may have accounts terminated
        
        **Trademark Policy:**
        • Our trademarks and service marks are protected
        • Unauthorized use of our marks is prohibited
        • Third-party trademarks are property of their respective owners
        • Commercial use of trademarks requires permission
        
        **License to Use:**
        • We grant you limited license to use our services
        • License is personal, non-transferable, and revocable
        • You may not copy, modify, or distribute our technology
        • License terminates when your account is closed
      `
    },
    {
      id: "privacy-data",
      title: "Privacy and Data Protection",
      icon: Shield,
      content: `
        How we handle your privacy and data:
        
        **Privacy Policy:**
        • Our Privacy Policy is incorporated by reference
        • We collect, use, and protect data as described in Privacy Policy
        • Users consent to data collection and processing
        • We comply with applicable data protection laws
        
        **Data Collection:**
        • We collect information you provide and usage data
        • Cookies and tracking technologies may be used
        • Third-party analytics and advertising partners may collect data
        • You can control data collection through privacy settings
        
        **Data Use:**
        • Data is used to provide and improve our services
        • We may use data for marketing and communication
        • Anonymized data may be used for research and analytics
        • We do not sell personal data to third parties
        
        **Data Security:**
        • We implement reasonable security measures
        • No data transmission is completely secure
        • Report data breaches or security concerns immediately
        • Users are responsible for protecting account access
        
        **Data Rights:**
        • You may access, correct, or delete your personal data
        • Data portability rights may apply
        • Opt-out of marketing communications anytime
        • Contact us for data-related requests
      `
    },
    {
      id: "termination",
      title: "Account Termination",
      icon: Users,
      content: `
        Conditions for account termination:
        
        **User Termination:**
        • You may close your account at any time
        • Contact support or use account settings to close account
        • Some information may be retained for legal compliance
        • Outstanding obligations survive account closure
        
        **Our Right to Terminate:**
        • We may suspend or terminate accounts for violations
        • Immediate termination for serious violations
        • Notice will be provided when possible
        • Appeals process available for disputed terminations
        
        **Consequences of Termination:**
        • Loss of access to all services and features
        • Forfeiture of unused credits or payments
        • Deletion of account data (subject to legal requirements)
        • Ongoing obligations continue (payments, confidentiality)
        
        **Data After Termination:**
        • Some data may be retained for legal or business purposes
        • Personal data deletion subject to Privacy Policy
        • Backup data may persist for limited time
        • Contact us for specific data deletion requests
        
        **Reactivation:**
        • Terminated accounts may not be eligible for reactivation
        • New registration may be permitted at our discretion
        • Previous violations may affect new account approval
      `
    },
    {
      id: "governing-law",
      title: "Governing Law and Jurisdiction",
      icon: Gavel,
      content: `
        Legal framework governing these terms:
        
        **Applicable Law:**
        • These terms are governed by the laws of India
        • Indian consumer protection laws apply where applicable
        • International users subject to local laws as well
        • Conflicts resolved under Indian legal framework
        
        **Jurisdiction:**
        • Disputes shall be resolved in courts of Rohtak, Haryana
        • Exclusive jurisdiction for all legal proceedings
        • Alternative dispute resolution may be available
        • Class action waiver where permitted by law
        
        **Dispute Resolution:**
        • We encourage resolution through customer service first
        • Mediation and arbitration may be required for some disputes
        • Small claims court remains available for qualifying disputes
        • Attorney fees may be awarded to prevailing party
        
        **Legal Compliance:**
        • Users must comply with applicable local laws
        • Some features may not be available in all jurisdictions
        • Export control and sanctions laws apply
        • Users responsible for their compliance obligations
        
        **Severability:**
        • Invalid provisions do not affect remaining terms
        • Unenforceable terms will be modified to be enforceable
        • Core business terms remain in effect
      `
    },
    {
      id: "contact-legal",
      title: "Legal Contact and Notices",
      icon: Globe,
      content: `
        How to contact us for legal matters:
        
        **Legal Notices:**
        • All legal notices must be in writing
        • Send to: legal@aashishproperty.com
        • Physical address: Model Town, Rohtak, Haryana 124001
        • Include your contact information and account details
        
        **Copyright Claims:**
        • DMCA takedown notices to: copyright@aashishproperty.com
        • Include specific infringing content identification
        • Provide proof of ownership or authorization
        • False claims may result in legal action
        
        **Business Inquiries:**
        • Partnership opportunities: business@aashishproperty.com
        • Vendor and supplier inquiries: procurement@aashishproperty.com
        • Media and press inquiries: media@aashishproperty.com
        
        **Regulatory Compliance:**
        • Real Estate Regulatory Authority (RERA) compliance inquiries
        • Consumer protection law questions
        • Data protection officer contact
        • Accessibility compliance officer
        
        **Emergency Contact:**
        • Security incidents: security@aashishproperty.com
        • Privacy breaches: privacy@aashishproperty.com
        • 24/7 emergency phone: +91 9876543210
      `
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <OLXStyleHeader />
      
      {/* Breadcrumb Navigation */}
      <nav className="bg-white border-b border-gray-200" aria-label="Breadcrumb">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-[#C70000] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium" aria-current="page">Terms of Service</span>
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
            <Scale className="h-12 w-12 text-[#C70000] mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Terms of Service
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6">
            Please read these terms carefully before using our services. 
            Your use of our platform constitutes acceptance of these terms.
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
          <AlertTriangle className="h-4 w-4 text-[#C70000]" />
          <AlertDescription className="text-gray-800">
            <strong>Legal Agreement:</strong> These terms constitute a binding legal agreement. 
            By using our services, you agree to be bound by these terms. If you do not agree, 
            please do not use our services. We may update these terms periodically.
          </AlertDescription>
        </Alert>

        {/* Table of Contents */}
        <Card className="mb-8 bg-gray-100">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Table of Contents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-2">
              {sections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center text-sm text-gray-600 hover:text-[#C70000] transition-colors py-1"
                  onClick={() => handleFooterLinkClick(`terms_toc_${section.id}`)}
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
            <Card key={section.id} id={section.id} className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-gray-900">
                  <section.icon className="h-6 w-6 mr-3 text-[#C70000]" />
                  {index + 1}. {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray max-w-none">
                  {section.content.split('\n').map((paragraph, pIndex) => {
                    if (paragraph.trim() === '') return null;
                    
                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                      return (
                        <h4 key={pIndex} className="font-semibold text-gray-900 mt-4 mb-2">
                          {paragraph.slice(2, -2)}
                        </h4>
                      );
                    }
                    
                    if (paragraph.startsWith('•')) {
                      return (
                        <li key={pIndex} className="text-gray-700 ml-4">
                          {paragraph.slice(1).trim()}
                        </li>
                      );
                    }
                    
                    return (
                      <p key={pIndex} className="text-gray-700 leading-relaxed mb-3">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Legal Contact Information */}
        <Card className="mt-12 bg-gradient-to-r from-[#C70000] to-red-700 text-white">
          <CardContent className="py-8">
            <div className="text-center">
              <Gavel className="h-12 w-12 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Legal Questions or Concerns?</h2>
              <p className="text-red-100 mb-6 max-w-2xl mx-auto">
                If you have questions about these terms, need legal clarification, 
                or want to report violations, please contact our legal team.
              </p>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold">Legal Department</p>
                  <p className="text-red-100">Aashish Properties</p>
                </div>
                <div className="space-y-2">
                  <p>
                    <strong>Email:</strong>{" "}
                    <a 
                      href="mailto:legal@aashishproperty.com" 
                      className="underline hover:no-underline"
                      onClick={() => handleFooterLinkClick('terms_legal_email')}
                    >
                      legal@aashishproperty.com
                    </a>
                  </p>
                  <p>
                    <strong>Phone:</strong>{" "}
                    <a 
                      href="tel:+919876543210" 
                      className="underline hover:no-underline"
                      onClick={() => handleFooterLinkClick('terms_legal_phone')}
                    >
                      +91 9876543210
                    </a>
                  </p>
                  <p>
                    <strong>Address:</strong> Model Town, Rohtak, Haryana 124001, India
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <Button 
                  asChild 
                  variant="secondary" 
                  className="bg-white text-[#C70000] hover:bg-gray-100"
                  onClick={() => handleFooterLinkClick('terms_contact_legal')}
                >
                  <Link to="/contact">Contact Legal Team</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Disclaimer */}
        <div className="mt-8 p-6 bg-gray-100 rounded-lg text-sm text-gray-600">
          <p className="mb-2">
            <strong>Legal Notice:</strong> These terms of service constitute a legally binding 
            agreement. Violation of these terms may result in account termination and legal action. 
            Consult with qualified legal counsel for specific legal advice.
          </p>
          <p>
            This document was last updated on {lastUpdated} and is effective as of {effectiveDate}. 
            Check back regularly for updates to these terms.
          </p>
        </div>

        {/* Quick Links */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Related Legal Information:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" asChild onClick={() => handleFooterLinkClick('related_privacy')}>
              <Link to="/privacy-policy">Privacy Policy</Link>
            </Button>
            <Button variant="outline" asChild onClick={() => handleFooterLinkClick('related_contact')}>
              <Link to="/contact">Contact Us</Link>
            </Button>
            <Button variant="outline" asChild onClick={() => handleFooterLinkClick('related_help')}>
              <Link to="/help-center">Help Center</Link>
            </Button>
          </div>
        </div>
      </main>

      <StaticFooter />
    </div>
  );
}
