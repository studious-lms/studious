"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2,
  ArrowRight,
  Shield,
  Clock,
  Lock,
  Server,
  Headphones,
  Zap
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Navbar } from "@/components/marketing/Navbar";
import { EarlyAccessModal } from "@/components/marketing/EarlyAccessModal";
import { useState } from "react";

export default function PricingPage() {
  const [showEarlyAccess, setShowEarlyAccess] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-b from-background via-secondary/30 to-background">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge variant="outline" className="mb-6 px-4 py-1.5 border-primary/20 text-primary">
            Transparent Pricing
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Choose the right plan for your institution
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple, transparent pricing with no hidden fees. All plans include core features with scalable options.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <Card className="border-2 border-border hover:border-primary/50 transition-all">
              <CardHeader className="space-y-4">
                <CardTitle className="text-2xl">Starter</CardTitle>
                <div>
                  <div className="text-5xl font-bold text-foreground">Free</div>
                  <p className="text-sm text-muted-foreground mt-2">Beta access included</p>
          </div>
                <p className="text-muted-foreground">
                  Perfect for small classes & pilot programs
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Up to 30 students</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">1 class</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Core features (assignments, calendar, grades)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">AI assistant (100 queries/month)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Community support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">5GB storage</span>
                  </li>
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowEarlyAccess(true)}
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* School Plan - Featured */}
            <Card className="border-2 border-primary shadow-2xl relative scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1.5">
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="space-y-4">
                <CardTitle className="text-2xl">School</CardTitle>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-foreground">$5</span>
                    <span className="text-muted-foreground">/user/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Billed annually or $6/month</p>
                </div>
                <p className="text-muted-foreground">
                  For schools with up to 1,000 students
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Unlimited students</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Unlimited classes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">All core features + advanced analytics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">AI assistant (unlimited queries)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Priority email support (24hr response)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">100GB storage per teacher</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Custom branding</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">API access</span>
                  </li>
                </ul>
                <Button 
                  className="w-full mt-6 bg-primary hover:bg-primary/90"
                  onClick={() => setShowEarlyAccess(true)}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Institution Plan */}
            <Card className="border-2 border-border hover:border-primary/50 transition-all">
              <CardHeader className="space-y-4">
                <CardTitle className="text-2xl">Institution</CardTitle>
                <div>
                  <div className="text-5xl font-bold text-foreground">Custom</div>
                  <p className="text-sm text-muted-foreground mt-2">Tailored to your needs</p>
                </div>
                <p className="text-muted-foreground">
                  For large schools & universities (1,000+ students)
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Everything in School plan</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Custom integrations (SIS, LTI, SSO)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Dedicated account manager</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">24/7 priority support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Unlimited storage</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">On-premise deployment option</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">99.9% uptime SLA</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Custom training & onboarding</span>
                    </li>
                </ul>
                <Button variant="outline" className="w-full">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-muted-foreground mt-12 text-lg">
            🎉 Early adopters receive <span className="font-semibold text-foreground">3 months free</span> on annual plans + dedicated onboarding support
          </p>
        </div>
      </section>

      {/* School Development Program */}
      <section className="py-24 px-6 bg-secondary/30">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Main Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
                  Social Impact
                </Badge>
                
                <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                  Studious School Development Program
                </h2>
                
                <p className="text-xl text-muted-foreground leading-relaxed">
                  We believe every student deserves access to modern learning tools, regardless of their school's economic situation.
                </p>
              </div>

              {/* Key Features */}
              <div className="space-y-6 pt-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg mb-1">100% Free Access</h3>
                    <p className="text-muted-foreground">Full platform access with all features for qualifying schools</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg mb-1">Dedicated Support</h3>
                    <p className="text-muted-foreground">Priority onboarding and training for teachers and staff</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg mb-1">Educational Resources</h3>
                    <p className="text-muted-foreground">Free teaching materials and curriculum support</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-4 flex gap-3">
                <Link href="/program/apply">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Apply Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/program">
                  <Button size="lg" variant="outline" className="border-border hover:bg-secondary">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column - Eligibility Card */}
            <Card className="border border-border shadow-lg bg-background">
              <CardHeader>
                <CardTitle className="text-2xl">Program Eligibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-4">Qualifying Schools:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      <span>Public schools in underserved communities</span>
                    </li>
                    <li className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      <span>Registered non-profit educational institutions</span>
                    </li>
                    <li className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      <span>Schools in developing regions</span>
                    </li>
                    <li className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      <span>Title I schools (US) or equivalent</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Our Commitment:</span> 10% of our paying customers support free access for schools in need.
                  </p>
                </div>

                <div className="pt-4 bg-secondary/50 rounded-lg p-4">
                  <p className="text-sm font-medium text-foreground mb-2">
                    Program Launch:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    January 2026 • First cohort to be announced
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Included in All Plans */}
      <section className="py-20 px-6 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Included in all plans
            </h2>
            <p className="text-xl text-muted-foreground">
              Enterprise-grade security and reliability, no matter your size
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">GDPR & FERPA Compliant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Full compliance with international data protection regulations
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">End-to-end Encryption</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Bank-level encryption for all student and teacher data
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Server className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">99.9% Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Reliable infrastructure with automatic backups and redundancy
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Headphones className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Responsive Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Dedicated support team available via email, chat, and phone
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Regular Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Continuous improvements and new features at no extra cost
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Built on modern infrastructure for instant page loads
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about Studious pricing
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left">
                Can I try Studious before committing to a paid plan?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes! The Starter plan is completely free and gives you access to core features. You can also start a 14-day free trial of the School plan with no credit card required.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left">
                What happens if I exceed my student limit?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                We'll notify you when you're approaching your limit. You can easily upgrade to the next tier, and we'll only charge you for the prorated difference for the remainder of your billing cycle.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left">
                Do you offer discounts for non-profit schools?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes! We offer 50% discounts for registered non-profit educational institutions. Contact our sales team with your non-profit documentation to apply.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left">
                Can I cancel my subscription at any time?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Absolutely. You can cancel anytime from your account settings. Your data will remain accessible for 30 days after cancellation, giving you time to export everything you need.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left">
                What payment methods do you accept?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                We accept all major credit cards (Visa, Mastercard, American Express), bank transfers for annual plans, and purchase orders for Institution tier customers.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left">
                Is there a setup fee or hidden costs?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                No hidden fees, ever. The price you see is what you pay. Institution tier customers may opt for paid onboarding services, but this is entirely optional.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left">
                Do you offer multi-year discounts?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes! We offer additional discounts for 2-year and 3-year commitments on School and Institution plans. Contact sales for a custom quote.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left">
                What kind of support is included?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Starter includes community support via forums. School includes priority email support with 24-hour response times. Institution includes 24/7 phone and chat support with a dedicated account manager.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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
      
      <EarlyAccessModal open={showEarlyAccess} onOpenChange={setShowEarlyAccess} />
    </div>
  );
}
