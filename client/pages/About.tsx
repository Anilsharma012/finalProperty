import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Users,
  Award,
  CheckCircle,
  Calendar,
  Building,
  Heart,
  Target,
  Eye,
  TrendingUp,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import OLXStyleHeader from "../components/OLXStyleHeader";
import StaticFooter from "../components/StaticFooter";

export default function About() {
  useEffect(() => {
    // Set page title and meta tags for SEO
    document.title =
      "About Us - Aashish Properties | Your Trusted Property Partner in Rohtak";

    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Learn about Aashish Properties - Rohtak's trusted real estate partner since 2006. Discover our mission, vision, and commitment to helping you find your dream property.",
      );
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content =
        "Learn about Aashish Properties - Rohtak's trusted real estate partner since 2006. Discover our mission, vision, and commitment to helping you find your dream property.";
      document.head.appendChild(meta);
    }

    // Set canonical URL
    const canonical =
      document.querySelector('link[rel="canonical"]') ||
      document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    canonical.setAttribute("href", `${window.location.origin}/about`);
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
          name: "About Us",
          item: `${window.location.origin}/about`,
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
        path: "/about",
        page_title: "About Us",
      });
    }

    // Cleanup function
    return () => {
      const scriptTags = document.querySelectorAll(
        'script[type="application/ld+json"]',
      );
      scriptTags.forEach((script) => {
        if (script.textContent?.includes("About Us")) {
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

  const milestones = [
    {
      year: "2006",
      title: "Founded",
      description: "Aashish Properties established in Rohtak",
    },
    {
      year: "2010",
      title: "Digital Expansion",
      description: "Launched online property platform",
    },
    {
      year: "2015",
      title: "1000+ Properties",
      description: "Reached milestone of 1000+ property listings",
    },
    {
      year: "2020",
      title: "Mobile App",
      description: "Launched mobile app for better user experience",
    },
    {
      year: "2023",
      title: "AI Integration",
      description: "Integrated AI-powered property matching",
    },
    {
      year: "2024",
      title: "5000+ Happy Families",
      description: "Helped over 5000 families find their dream homes",
    },
  ];

  const teamMembers = [
    {
      name: "Aashish Kumar",
      role: "Founder & CEO",
      experience: "18+ years",
      speciality: "Property Investment & Development",
    },
    {
      name: "Priya Sharma",
      role: "Head of Sales",
      experience: "12+ years",
      speciality: "Residential Properties",
    },
    {
      name: "Rajesh Gupta",
      role: "Commercial Lead",
      experience: "15+ years",
      speciality: "Commercial & Industrial Properties",
    },
    {
      name: "Sunita Devi",
      role: "Customer Relations",
      experience: "8+ years",
      speciality: "Client Support & After-sales",
    },
  ];

  const achievements = [
    { icon: Building, number: "5000+", label: "Properties Sold" },
    { icon: Users, number: "10,000+", label: "Happy Clients" },
    { icon: Award, number: "15+", label: "Industry Awards" },
    { icon: Calendar, number: "18+", label: "Years Experience" },
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
              About Us
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

        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About <span className="text-[#C70000]">Aashish Properties</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Your trusted property partner in Rohtak since 2006. We've been
              helping families and businesses find their perfect properties with
              integrity, expertise, and excellence.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <MapPin className="h-4 w-4 mr-2" />
                Rohtak, Haryana
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Calendar className="h-4 w-4 mr-2" />
                Since 2006
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Award className="h-4 w-4 mr-2" />
                Trusted by 10,000+
              </Badge>
            </div>
          </div>
        </section>

        {/* Achievements Section */}
        <section className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <Card
                key={index}
                className="text-center bg-white hover:shadow-lg transition-shadow"
              >
                <CardContent className="pt-6">
                  <achievement.icon className="h-12 w-12 text-[#C70000] mx-auto mb-4" />
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {achievement.number}
                  </div>
                  <div className="text-sm text-gray-600">
                    {achievement.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-[#C70000] to-red-700 text-white">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Target className="h-6 w-6 mr-3" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-100 leading-relaxed">
                  To provide transparent, reliable, and personalized property
                  services that help our clients make informed decisions. We
                  strive to simplify the property buying, selling, and renting
                  process while maintaining the highest standards of integrity
                  and customer satisfaction.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Eye className="h-6 w-6 mr-3" />
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">
                  To become Haryana's most trusted and innovative real estate
                  platform, where technology meets tradition. We envision a
                  future where finding the perfect property is seamless,
                  transparent, and accessible to everyone in our community.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Company Story Section */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
            <p className="text-gray-600 leading-relaxed">
              What started as a small family business has grown into Rohtak's
              most trusted property platform
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  From Humble Beginnings to Market Leader
                </h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Founded in 2006 by <strong>Aashish Kumar</strong>, our
                    company began with a simple mission: to help people in
                    Rohtak find their dream properties with complete
                    transparency and trust.
                  </p>
                  <p>
                    Starting with just 3 team members and a small office in
                    Model Town, we've grown to become one of the most respected
                    real estate platforms in Haryana, with over 50 dedicated
                    professionals serving our community.
                  </p>
                  <p>
                    Our commitment to technology, customer service, and ethical
                    practices has helped us build lasting relationships with
                    over 10,000 satisfied clients across residential,
                    commercial, and industrial sectors.
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verified Properties Only
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Legal Documentation Support
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    24/7 Customer Support
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-[#C70000] to-red-700 rounded-xl flex items-center justify-center text-white">
                  <div className="text-center">
                    <Building className="h-16 w-16 mx-auto mb-4" />
                    <div className="text-2xl font-bold">18+ Years</div>
                    <div className="text-red-200">of Excellence</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-gray-600">
              Key milestones that shaped our growth
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-[#C70000]"></div>
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="relative flex items-center">
                  <div
                    className={`flex-1 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8"}`}
                  >
                    <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="pt-4">
                        <div className="text-sm text-[#C70000] font-semibold mb-1">
                          {milestone.year}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {milestone.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {milestone.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#C70000] rounded-full border-4 border-white shadow-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Meet Our Leadership Team
            </h2>
            <p className="text-gray-600">
              Experienced professionals dedicated to your property success
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <Card
                key={index}
                className="text-center bg-white hover:shadow-lg transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#C70000] to-red-700 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-[#C70000] font-medium text-sm mb-2">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-xs mb-2">
                    {member.experience}
                  </p>
                  <p className="text-gray-500 text-xs">{member.speciality}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <div className="bg-gray-100 rounded-xl p-8">
            <div className="max-w-4xl mx-auto text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Our Core Values
              </h2>
              <p className="text-gray-600">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#C70000] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Integrity</h3>
                <p className="text-gray-600 text-sm">
                  We believe in honest, transparent dealings and building trust
                  through our actions.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-[#C70000] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Customer First
                </h3>
                <p className="text-gray-600 text-sm">
                  Your needs, satisfaction, and success are at the center of
                  everything we do.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-[#C70000] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Innovation</h3>
                <p className="text-gray-600 text-sm">
                  We continuously evolve our services and technology to serve
                  you better.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-[#C70000] to-red-700 text-white">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Find Your Dream Property?
              </h2>
              <p className="text-red-100 mb-8 max-w-2xl mx-auto">
                Join thousands of satisfied customers who have found their
                perfect properties with us. Let our experienced team guide you
                through your property journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  variant="secondary"
                  className="bg-white text-[#C70000] hover:bg-gray-100"
                  onClick={() => handleFooterLinkClick("contact")}
                >
                  <Link to="/contact">Contact Us Today</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-[#C70000]"
                >
                  <Link to="/properties">Browse Properties</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <StaticFooter />
    </div>
  );
}
