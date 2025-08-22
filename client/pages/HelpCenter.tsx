import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  HelpCircle,
  User,
  CreditCard,
  Settings,
  MessageCircle,
  ChevronDown,
  ChevronRight,
  Calendar,
  Building,
  Shield,
  Phone,
  Mail,
  Clock,
  BookOpen,
  FileText,
  ExternalLink,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import OLXStyleHeader from "../components/OLXStyleHeader";
import StaticFooter from "../components/StaticFooter";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  helpful?: number;
}

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFAQs, setFilteredFAQs] = useState<FAQItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    // Set page title and meta tags for SEO
    document.title =
      "Help Center - Aashish Properties | Property Search Support & FAQs";

    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Get help with property search, account management, and more. Find answers to frequently asked questions about Aashish Properties services.",
      );
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content =
        "Get help with property search, account management, and more. Find answers to frequently asked questions about Aashish Properties services.";
      document.head.appendChild(meta);
    }

    // Set canonical URL
    const canonical =
      document.querySelector('link[rel="canonical"]') ||
      document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    canonical.setAttribute("href", `${window.location.origin}/help-center`);
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
          name: "Help Center",
          item: `${window.location.origin}/help-center`,
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
        path: "/help-center",
        page_title: "Help Center",
      });
    }

    // Cleanup function
    return () => {
      const scriptTags = document.querySelectorAll(
        'script[type="application/ld+json"]',
      );
      scriptTags.forEach((script) => {
        if (script.textContent?.includes("Help Center")) {
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

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();

    // Analytics event for search
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "help_center_search",
        search_query: searchQuery,
      });
    }

    // Filter FAQs based on search query
    if (searchQuery.trim()) {
      const filtered = allFAQs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
      setFilteredFAQs(filtered);
    } else {
      setFilteredFAQs(allFAQs);
    }
  };

  const categories = [
    { id: "all", name: "All Categories", icon: BookOpen, count: 0 },
    { id: "account", name: "Account & Profile", icon: User, count: 0 },
    { id: "properties", name: "Property Search", icon: Building, count: 0 },
    { id: "technical", name: "Technical Support", icon: Settings, count: 0 },
    { id: "billing", name: "Billing & Payments", icon: CreditCard, count: 0 },
    { id: "security", name: "Security & Privacy", icon: Shield, count: 0 },
  ];

  const allFAQs: FAQItem[] = [
    // Account & Profile
    {
      id: "account-1",
      question: "How do I create an account on Aashish Properties?",
      answer:
        "Creating an account is simple! Click the 'Sign Up' button on the top right of our homepage. You can register using your email address, phone number, or social media accounts like Google or Facebook. After registration, verify your email to activate your account and start browsing properties.",
      category: "account",
      tags: ["registration", "signup", "account", "verification"],
      helpful: 245,
    },
    {
      id: "account-2",
      question: "I forgot my password. How can I reset it?",
      answer:
        "Click 'Forgot Password' on the login page and enter your registered email address. We'll send you a secure reset link. Check your spam folder if you don't see the email within 5 minutes. The reset link expires in 24 hours for security.",
      category: "account",
      tags: ["password", "reset", "login", "email"],
      helpful: 189,
    },
    {
      id: "account-3",
      question: "How do I update my profile information?",
      answer:
        "Log into your account and go to 'My Profile' or 'Account Settings'. You can update your name, email, phone number, profile picture, and property preferences. Some changes may require email verification for security.",
      category: "account",
      tags: ["profile", "update", "settings", "personal information"],
      helpful: 156,
    },

    // Property Search
    {
      id: "properties-1",
      question: "How do I search for properties in my preferred location?",
      answer:
        "Use our advanced search filters on the homepage. Enter your desired location, select property type (residential, commercial, rental), set your budget range, and choose specific amenities. You can also use the map view to explore properties in specific areas of Rohtak.",
      category: "properties",
      tags: ["search", "location", "filters", "map"],
      helpful: 312,
    },
    {
      id: "properties-2",
      question: "How can I save properties to view later?",
      answer:
        "Click the heart icon on any property listing to add it to your favorites. You can access all saved properties from your account dashboard under 'Saved Properties'. You'll also receive notifications if the price changes or the property status updates.",
      category: "properties",
      tags: ["favorites", "save", "wishlist", "notifications"],
      helpful: 234,
    },
    {
      id: "properties-3",
      question: "What information is included in property listings?",
      answer:
        "Our listings include property details, price, location, photos, floor plans, amenities, nearby facilities, legal documentation status, and contact information for the owner or agent. We verify all listings to ensure accuracy.",
      category: "properties",
      tags: ["listing", "details", "verification", "information"],
      helpful: 198,
    },

    // Technical Support
    {
      id: "technical-1",
      question: "The website is loading slowly. What should I do?",
      answer:
        "First, check your internet connection. Clear your browser cache and cookies, or try a different browser. If the issue persists, try accessing the site from a different device. Contact our technical support if problems continue.",
      category: "technical",
      tags: ["slow", "loading", "performance", "browser"],
      helpful: 87,
    },
    {
      id: "technical-2",
      question: "Can I use Aashish Properties on my mobile phone?",
      answer:
        "Yes! Our website is fully mobile-responsive and works great on smartphones and tablets. We also have a mobile app available for download on Android and iOS app stores for an even better mobile experience.",
      category: "technical",
      tags: ["mobile", "app", "responsive", "smartphone"],
      helpful: 176,
    },
    {
      id: "technical-3",
      question:
        "I'm having trouble uploading photos. What are the requirements?",
      answer:
        "Photos must be in JPG, PNG, or WebP format, maximum 5MB per image. Ensure your internet connection is stable. We recommend photos be at least 1024x768 pixels for best quality. If you continue having issues, try uploading one photo at a time.",
      category: "technical",
      tags: ["upload", "photos", "images", "format", "size"],
      helpful: 143,
    },

    // Billing & Payments
    {
      id: "billing-1",
      question: "Is it free to search and view properties?",
      answer:
        "Yes! Browsing properties, creating an account, and contacting property owners is completely free. We only charge for premium services like featured listings, advanced analytics for property owners, and priority customer support.",
      category: "billing",
      tags: ["free", "cost", "pricing", "premium"],
      helpful: 267,
    },
    {
      id: "billing-2",
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards, debit cards, UPI payments, net banking, and digital wallets like Paytm, PhonePe, and Google Pay. All payments are processed securely through encrypted channels.",
      category: "billing",
      tags: ["payment", "methods", "cards", "UPI", "wallet"],
      helpful: 134,
    },

    // Security & Privacy
    {
      id: "security-1",
      question: "How do you protect my personal information?",
      answer:
        "We use industry-standard encryption to protect your data. Personal information is never shared without consent. Our servers are secured with multiple layers of protection. Read our Privacy Policy for complete details on data handling.",
      category: "security",
      tags: ["privacy", "security", "data protection", "encryption"],
      helpful: 201,
    },
    {
      id: "security-2",
      question: "How can I make my account more secure?",
      answer:
        "Use a strong, unique password and enable two-factor authentication in your account settings. Never share your login credentials. Log out from shared devices. Contact us immediately if you notice any suspicious activity.",
      category: "security",
      tags: ["security", "password", "two-factor", "authentication"],
      helpful: 167,
    },
  ];

  // Update category counts
  categories.forEach((category) => {
    if (category.id === "all") {
      category.count = allFAQs.length;
    } else {
      category.count = allFAQs.filter(
        (faq) => faq.category === category.id,
      ).length;
    }
  });

  // Filter FAQs based on selected category and search
  useEffect(() => {
    let filtered =
      selectedCategory === "all"
        ? allFAQs
        : allFAQs.filter((faq) => faq.category === selectedCategory);

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
    }

    setFilteredFAQs(filtered);
  }, [selectedCategory, searchQuery]);

  const supportChannels = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak with our experts",
      contact: "+91 9876543210",
      hours: "Mon-Sat 9AM-6PM",
      href: "tel:+919876543210",
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Get detailed help via email",
      contact: "support@aashishproperty.com",
      hours: "24-48 hour response",
      href: "mailto:support@aashishproperty.com",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Instant help from our team",
      contact: "Available Now",
      hours: "Mon-Sat 9AM-6PM",
      href: "/contact",
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
              Help Center
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
          <div className="flex items-center justify-center mb-4">
            <HelpCircle className="h-12 w-12 text-[#C70000] mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Help Center
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Find answers to your questions about property search, account
            management, and more. Our comprehensive help center is here to
            assist you.
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for help articles, FAQs, and guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg focus:ring-[#C70000] focus:border-[#C70000]"
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#C70000] hover:bg-red-700"
              >
                Search
              </Button>
            </form>
          </div>
        </section>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-sm sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">
                  Browse by Category
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        handleFooterLinkClick(`help_category_${category.id}`);
                      }}
                      className={`w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors ${
                        selectedCategory === category.id
                          ? "bg-red-50 border-r-2 border-[#C70000] text-[#C70000]"
                          : "text-gray-700"
                      }`}
                    >
                      <div className="flex items-center">
                        <category.icon className="h-5 w-5 mr-3" />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {category.count}
                      </Badge>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Contact */}
            <Card className="bg-gradient-to-br from-[#C70000] to-red-700 text-white mt-6">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Still Need Help?</h3>
                <p className="text-red-100 text-sm mb-4">
                  Can't find what you're looking for? Our support team is here
                  to help.
                </p>
                <Button
                  asChild
                  variant="secondary"
                  className="w-full bg-white text-[#C70000] hover:bg-gray-100"
                  onClick={() => handleFooterLinkClick("help_contact_support")}
                >
                  <Link to="/contact">Contact Support</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* FAQ Section */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900">
                  {selectedCategory === "all"
                    ? "Frequently Asked Questions"
                    : `${categories.find((c) => c.id === selectedCategory)?.name} - FAQs`}
                </CardTitle>
                <p className="text-gray-600">
                  {searchQuery
                    ? `Found ${filteredFAQs.length} results for "${searchQuery}"`
                    : `${filteredFAQs.length} helpful articles`}
                </p>
              </CardHeader>
              <CardContent>
                {filteredFAQs.length > 0 ? (
                  <Accordion type="single" collapsible className="space-y-2">
                    {filteredFAQs.map((faq) => (
                      <AccordionItem
                        key={faq.id}
                        value={faq.id}
                        className="border border-gray-200 rounded-lg px-4"
                      >
                        <AccordionTrigger
                          className="text-left hover:no-underline py-4"
                          onClick={() =>
                            handleFooterLinkClick(`help_faq_${faq.id}`)
                          }
                        >
                          <div className="flex items-start justify-between w-full">
                            <span className="font-medium text-gray-900 pr-4">
                              {faq.question}
                            </span>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              {faq.helpful && (
                                <Badge variant="secondary" className="text-xs">
                                  {faq.helpful} helpful
                                </Badge>
                              )}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <div className="text-gray-700 leading-relaxed mb-4">
                            {faq.answer}
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {faq.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-sm text-gray-500">
                            Was this helpful?
                            <Button
                              variant="link"
                              className="text-xs h-auto p-1 ml-2"
                            >
                              👍 Yes
                            </Button>
                            <Button
                              variant="link"
                              className="text-xs h-auto p-1"
                            >
                              👎 No
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center py-12">
                    <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No results found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {searchQuery
                        ? `No articles match "${searchQuery}". Try different keywords or browse categories.`
                        : "No articles available in this category yet."}
                    </p>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedCategory("all");
                        }}
                      >
                        Clear Search
                      </Button>
                      <Button
                        asChild
                        className="bg-[#C70000] hover:bg-red-700"
                        onClick={() =>
                          handleFooterLinkClick("help_no_results_contact")
                        }
                      >
                        <Link to="/contact">Contact Support</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Support Channels */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Get Personal Support
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {supportChannels.map((channel, index) => (
                  <Card
                    key={index}
                    className="bg-white hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-[#C70000] rounded-lg flex items-center justify-center mx-auto mb-4">
                          <channel.icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {channel.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {channel.description}
                        </p>
                        <div className="space-y-1 mb-4">
                          <p className="font-medium text-[#C70000]">
                            {channel.contact}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center justify-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {channel.hours}
                          </p>
                        </div>
                        <Button
                          asChild
                          variant="outline"
                          className="w-full border-[#C70000] text-[#C70000] hover:bg-red-50"
                          onClick={() =>
                            handleFooterLinkClick(
                              `help_support_${channel.title.toLowerCase().replace(" ", "_")}`,
                            )
                          }
                        >
                          <a href={channel.href}>
                            {channel.title === "Live Chat"
                              ? "Start Chat"
                              : "Contact Now"}
                            <ExternalLink className="h-3 w-3 ml-2" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Popular Resources */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Popular Resources
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-white hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <FileText className="h-8 w-8 text-[#C70000] flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Property Buying Guide
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          Complete guide to buying property in Rohtak, including
                          legal requirements and documentation.
                        </p>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-[#C70000]"
                          onClick={() =>
                            handleFooterLinkClick("help_resource_buying_guide")
                          }
                        >
                          Read Guide →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <Building className="h-8 w-8 text-[#C70000] flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Property Valuation
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          Learn how property values are determined and get tips
                          for accurate property assessment.
                        </p>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-[#C70000]"
                          onClick={() =>
                            handleFooterLinkClick("help_resource_valuation")
                          }
                        >
                          Learn More →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <StaticFooter />
    </div>
  );
}
