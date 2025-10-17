"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle2,
  ArrowRight,
  Users,
  Heart,
  Send,
  Search,
  Clock,
  FileCheck,
  XCircle
} from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function ProgramPage() {
  const [searchId, setSearchId] = useState("");
  const [shouldSearch, setShouldSearch] = useState(false);

  // tRPC query for searching application
  const { data: application, isLoading, error } = trpc.marketing.searchSchoolDevelopementPrograms.useQuery(
    { id: searchId },
    { 
      enabled: shouldSearch && searchId.trim().length > 0,
      retry: false
    }
  );

  const handleCheckStatus = () => {
    if (searchId.trim()) {
      setShouldSearch(true);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "UNDER_REVIEW":
        return <Badge variant="outline" className="border-yellow-500/50 text-yellow-600 bg-yellow-50"><Clock className="h-3 w-3 mr-1" />Under Review</Badge>;
      case "APPROVED":
        return <Badge variant="outline" className="border-green-500/50 text-green-600 bg-green-50"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      case "PENDING":
        return <Badge variant="outline" className="border-blue-500/50 text-blue-600 bg-blue-50"><FileCheck className="h-3 w-3 mr-1" />Pending</Badge>;
      case "REJECTED":
        return <Badge variant="outline" className="border-red-500/50 text-red-600 bg-red-50"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Submitted</Badge>;
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section with Background Image */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Background Image - Cropped to show middle section */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <img 
            src="/marketing/school-program.png" 
            alt="Students and teacher in classroom" 
            className="w-full h-full object-cover object-center"
            style={{ objectPosition: 'center 40%' }}
          />
        </div>
        
        <div className="container mx-auto max-w-4xl text-center relative z-20">
          <Badge variant="outline" className="mb-6 px-4 py-1.5 border-white/30 text-white bg-white/10 backdrop-blur-sm">
            Social Impact Initiative
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight drop-shadow-lg">
            Studious School Development Program
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
            Providing free access to modern learning technology for schools without economic means
          </p>
        </div>
      </section>

      {/* Program Commitment */}
      <section className="py-16 px-6 bg-secondary/30">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-primary mb-2">10%</div>
              <p className="text-muted-foreground">Revenue Committed</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-primary mb-2">Jan 2026</div>
              <p className="text-muted-foreground">First Cohort Launch</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-primary mb-2">100%</div>
              <p className="text-muted-foreground">Free Access</p>
            </div>
          </div>
        </div>
      </section>

      {/* About the Program */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8 text-muted-foreground text-lg leading-relaxed">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-4">Our Mission</h2>
                <p>
                  The Studious School Development Program was established with a clear mission: to ensure that every student, regardless of their school's economic circumstances, has access to world-class learning management technology. We recognize that educational inequality often begins with unequal access to tools and resources, and we're committed to changing that.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-foreground mb-4">Why We Created This Program</h2>
                <p>
                  Throughout our journey building Studious, we've witnessed firsthand the challenges faced by schools in underserved communities. While wealthier institutions can afford the latest educational technology, schools serving disadvantaged students often struggle with outdated systems or prohibitive licensing costs. This disparity creates an educational gap that can impact students' entire academic careers.
                </p>
                <p className="mt-4">
                  We believe this is fundamentally unfair. Technology should be an equalizer in education, not another barrier. That's why we've committed 10% of our revenue from paying customers to provide completely free access to qualifying schools. This isn't charity—it's an investment in the future of education and a recognition that every student deserves the best tools available.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-foreground mb-4">What You'll Receive</h2>
                <p>
                  Schools accepted into the program receive the full Studious platform experience—not a limited or stripped-down version. This includes unlimited student and teacher accounts, all premium features (AI assistant, advanced analytics, real-time collaboration), priority technical support, dedicated onboarding specialists, ongoing training resources, and access to all future updates and improvements.
                </p>
                <p className="mt-4">
                  Beyond the software itself, we provide comprehensive support to ensure your school can maximize the platform's benefits. Our team will work directly with your administrators and teachers to customize the system for your specific needs, provide hands-on training, and remain available for ongoing assistance throughout your journey.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-foreground mb-4">Who Qualifies</h2>
                <p>
                  We prioritize schools serving students who would benefit most from improved educational technology. This includes public schools in underserved or economically disadvantaged communities, registered non-profit educational institutions demonstrating financial constraints, schools in developing regions or countries, US Title I schools and their international equivalents, and any educational institution that can demonstrate genuine financial need alongside a commitment to improving student outcomes.
                </p>
                <p className="mt-4">
                  We evaluate each application individually, considering not just financial metrics but also your school's mission, the population you serve, and your plans for using Studious to enhance education. Our goal is to partner with schools that will truly benefit from and effectively utilize our platform to improve student learning experiences.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-foreground mb-4">Our Vision for Impact</h2>
                <p>
                  The School Development Program launches in January 2026, with our first cohort of partner schools to be announced. We're committed to building this program as Studious grows, with a goal of supporting dozens of schools within the first year and hundreds as our platform scales.
                </p>
                <p className="mt-4">
                  This is just the beginning. As Studious grows, so does our capacity to support more schools. Every school that chooses to pay for Studious directly enables us to provide free access to another school in need, creating a sustainable model for educational equity that grows stronger over time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application CTA & Status Checker */}
      <section className="py-20 px-6 bg-secondary/30">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Apply Card */}
            <div>
            <Card className="border border-border shadow-lg bg-background">
              <CardHeader>
                <CardTitle className="text-2xl">Apply to the Program</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Ready to bring Studious to your school? Fill out our application form and we'll review it within 5-7 business days.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Takes approximately 10-15 minutes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>No application fee required</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Response within 5-7 business days</span>
                  </li>
                </ul>
                <Link href="/program/apply" className="block pt-4">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Start Application
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
            </div>

            {/* Status Checker Card */}
            <Card className="border border-border shadow-lg bg-background">
              <CardHeader>
                <CardTitle className="text-2xl">Check Application Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Already applied? Enter your application ID to check the status of your application.
                </p>
                <div className="space-y-3">
                  <Label htmlFor="application-id">Application ID</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="application-id" 
                      placeholder="e.g., EXA2025-..." 
                      className="flex-1"
                      value={searchId}
                      onChange={(e) => {
                        setSearchId(e.target.value);
                        setShouldSearch(false); // Reset search when typing
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleCheckStatus()}
                    />
                    <Button 
                      variant="outline" 
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={handleCheckStatus}
                      disabled={isLoading}
                    >
                      {isLoading ? <Clock className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You received your application ID via email after submitting your application.
                  </p>
                </div>

                {/* Search Results */}
                {shouldSearch && (
                  <div className="mt-6 pt-6 border-t border-border">
                    {isLoading ? (
                      <div className="text-center py-4">
                        <Clock className="h-8 w-8 text-primary mx-auto mb-2 animate-spin" />
                        <p className="text-sm text-muted-foreground">Searching...</p>
                      </div>
                    ) : application ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-foreground">Application Found</h4>
                          {getStatusBadge(application.status || "PENDING")}
                        </div>
                        
                        <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">School:</span>
                            <span className="font-medium text-foreground">{application.name}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Location:</span>
                            <span className="font-medium text-foreground">{application.city}, {application.country}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Submitted:</span>
                            <span className="font-medium text-foreground">
                              {new Date(application.submittedAt || "").toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Contact:</span>
                            <span className="font-medium text-foreground">{application.contactEmail}</span>
                          </div>
                        </div>

                        {application.status === "APPROVED" && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm text-green-800 font-medium mb-2">
                              🎉 Congratulations! Your application has been approved.
                            </p>
                            <p className="text-sm text-green-700">
                              Check your email for next steps to set up your account.
                            </p>
                          </div>
                        )}

                        {application.status === "UNDER_REVIEW" && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-sm text-yellow-800 font-medium mb-2">
                              ⏳ Your application is currently under review.
                            </p>
                            <p className="text-sm text-yellow-700">
                              We'll contact you via email once the review is complete.
                            </p>
                          </div>
                        )}

                        {(!application.status || application.status === "PENDING") && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800 font-medium mb-2">
                              📋 Your application has been received.
                            </p>
                            <p className="text-sm text-blue-700">
                              Our team will begin reviewing it soon. Expected review time: 5-7 business days.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">
                            Application not found
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Please check your application ID and try again. If you continue to have issues, contact us at impact@studious.sh
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Have Questions?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Our team is here to help you through the application process
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="mailto:impact@studious.sh">
              <Button size="lg" variant="outline" className="border-border hover:bg-secondary">
                Email Us: impact@studious.sh
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-secondary border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Studious" className="w-7 h-7" />
                <span className="text-xl font-semibold text-foreground">Studious</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Modern learning management for the next generation of education.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="/program" className="text-sm text-muted-foreground hover:text-foreground transition-colors">School Program</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/#team" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Team</Link></li>
                <li><Link href="/press" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Press</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Contact</h3>
              <ul className="space-y-2">
                <li><a href="mailto:hello@studious.sh" className="text-sm text-muted-foreground hover:text-foreground transition-colors">hello@studious.sh</a></li>
                <li><a href="mailto:press@studious.sh" className="text-sm text-muted-foreground hover:text-foreground transition-colors">press@studious.sh</a></li>
                <li><a href="mailto:impact@studious.sh" className="text-sm text-muted-foreground hover:text-foreground transition-colors">impact@studious.sh</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Studious LMS. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

