"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  FileText, 
  BarChart3, 
  Calendar, 
  MessageCircle, 
  Bot,
  Globe,
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
  Play,
  CheckCircle2
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/marketing/Navbar";
import { EarlyAccessModal } from "@/components/marketing/EarlyAccessModal";

export default function Home() {
  const appState = useSelector((state: RootState) => state.app);
  const router = useRouter();
  const [showEarlyAccess, setShowEarlyAccess] = useState(false);

  useEffect(() => {
    if (appState.user.loggedIn) {
      router.push('/home');
    }
  }, [appState.user.loggedIn, router]);
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-background via-secondary/30 to-background relative overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center">
            <Badge variant="outline" className="mb-6 px-4 py-1.5 border-primary/20 text-primary">
              Modern Learning Platform
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 tracking-tight">
              Seamless, distraction-free
                <br />
              <span className="text-primary">learning for modern schools</span>
              </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              Studious LMS integrates AI, real-time calendars, and class communication into one cohesive platform — designed to help teachers teach and students thrive.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-12 text-base font-medium"
                onClick={() => setShowEarlyAccess(true)}
              >
                Request Early Access
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-border hover:bg-secondary px-8 h-12 text-base font-medium">
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="mt-20 rounded-2xl overflow-hidden shadow-2xl border border-border relative">
            <img src="/hero-light.png" alt="Platform Dashboard" className="w-full h-auto block dark:hidden" />
            <img src="/hero-dark.png" alt="Platform Dashboard" className="w-full h-auto hidden dark:block" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-20 px-6 bg-secondary/50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Traditional school portals are fragmented and outdated
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto">
                  <Zap className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">
                  Teachers waste time switching between multiple tools
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">
                  Students struggle with organisation and deadlines
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto">
                  <Bot className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">
                  AI remains under-integrated in actual school workflows
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Response Section */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Studious LMS unifies teaching, learning,
            <br />
            and communication into a single workspace
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Built with cutting-edge frameworks and human-centred design, it's built to scale across schools of any size.
          </p>
        </div>
      </section>

      {/* Key Features Table */}
      <section id="features" className="py-20 px-6 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Key Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage modern learning experiences
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border border-border hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">AI Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Helps generate study materials, summarise content, and assist with grading
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Class Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Organise classes, assignments, and attendance effortlessly
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Create, collect, and grade student submissions efficiently
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Real-time sync with assignments, lessons, and events
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  View insights on performance, participation, and engagement
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Communication</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Built-in messaging and announcements for unified collaboration
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-20 px-6 bg-primary">
        <div className="container mx-auto max-w-4xl text-center">
          <blockquote className="text-3xl md:text-4xl font-medium text-primary-foreground leading-relaxed">
            "Every feature in Studious was built to reduce friction — not add it."
          </blockquote>
              </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Choose the plan that fits your institution
            </p>
              </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <Card className="border-2 border-border hover:border-primary/50 transition-all">
              <CardHeader className="space-y-4">
                <CardTitle className="text-2xl">Starter</CardTitle>
                <div>
                  <div className="text-4xl font-bold text-foreground">Free</div>
                  <p className="text-sm text-muted-foreground mt-1">Beta access</p>
            </div>
                <p className="text-muted-foreground">
                  For small classes & pilot programs
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Up to 30 students</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Core features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Community support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">AI assistant (limited)</span>
                  </li>
                </ul>
                <Link href="/signup" className="block">
                  <Button variant="outline" className="w-full mt-6">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* School Plan */}
            <Card className="border-2 border-primary shadow-xl relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1">
                  Popular
                </Badge>
              </div>
              <CardHeader className="space-y-4">
                <CardTitle className="text-2xl">School</CardTitle>
                <div>
                  <div className="text-4xl font-bold text-foreground">$5</div>
                  <p className="text-sm text-muted-foreground mt-1">per user / month</p>
                </div>
                <p className="text-muted-foreground">
                  Schools with &lt; 1000 students
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Unlimited students</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">All features included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Priority support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Full AI capabilities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Advanced analytics</span>
                  </li>
                </ul>
                <Link href="/signup" className="block">
                  <Button className="w-full mt-6 bg-primary hover:bg-primary/90">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Institution Plan */}
            <Card className="border-2 border-border hover:border-primary/50 transition-all">
              <CardHeader className="space-y-4">
                <CardTitle className="text-2xl">Institution</CardTitle>
                <div>
                  <div className="text-4xl font-bold text-foreground">Custom</div>
                  <p className="text-sm text-muted-foreground mt-1">Contact sales</p>
            </div>
                <p className="text-muted-foreground">
                  Large schools / universities
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Unlimited everything</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Custom integrations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Dedicated support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">On-premise deployment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">SLA guarantee</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-6">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-muted-foreground mt-12 max-w-2xl mx-auto">
            Early adopters receive extended beta access and onboarding support.
          </p>
              </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Our Team
              </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A globally distributed team of developers, designers, and educators — connecting Switzerland, Singapore, and China to build the future of education.
              </p>
            </div>
          
          {/* World Map Visualization */}
          <div className="relative bg-secondary/30 rounded-2xl p-12 border border-border">
            <div className="flex items-center justify-center gap-16 flex-wrap">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Globe className="h-8 w-8 text-primary" />
                    </div>
                <p className="font-semibold text-foreground">Switzerland</p>
                <p className="text-sm text-muted-foreground">Engineering & Design</p>
                  </div>
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Globe className="h-8 w-8 text-primary" />
                    </div>
                <p className="font-semibold text-foreground">Singapore</p>
                <p className="text-sm text-muted-foreground">Product & Education</p>
                  </div>
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <p className="font-semibold text-foreground">China</p>
                <p className="text-sm text-muted-foreground">Development & AI</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* School Development Program */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/5 via-background to-primary/5 border-y border-primary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="outline" className="border-primary/30 text-primary">
                Social Impact
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                Studious School Development Program
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                We believe every student deserves access to modern learning tools, regardless of their school's economic situation.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">100% Free Access</p>
                    <p className="text-sm text-muted-foreground">Full platform access with all features for qualifying schools</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Dedicated Support</p>
                    <p className="text-sm text-muted-foreground">Priority onboarding and training for teachers and staff</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Educational Resources</p>
                    <p className="text-sm text-muted-foreground">Free teaching materials and curriculum support</p>
                  </div>
                </div>
              </div>
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
            
            <Card className="border-2 border-primary/20 bg-card shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Program Eligibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Qualifying Schools:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Public schools in underserved communities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Registered non-profit educational institutions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Schools in developing regions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Title I schools (US) or equivalent</span>
                    </li>
                  </ul>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Our Commitment:</strong> 10% of our paying customers support free access for schools in need.
                  </p>
                </div>
                
                <div className="bg-primary/5 rounded-lg p-4">
                  <p className="text-sm font-medium text-foreground mb-2">
                    Program Launch:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    January 2026 • Applications now open
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Future Developments Section */}
      <section className="py-20 px-6 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Future Developments
            </h2>
            <p className="text-xl text-muted-foreground">
              Our roadmap for transforming education
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">CAS Perspective</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Supporting underfunded schools through donations and materials, making quality education accessible to all.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Features Perspective</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Expanding AI student support and building API integrations for diverse educational systems worldwide.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Launch Perspective</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Presentations at schools, universities, and conferences to reshape the learning experience.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Ready to redefine how your school learns and teaches?
            </h2>
          <p className="text-xl text-muted-foreground mb-12">
            Join the future of education with Studious LMS
            </p>
            
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 h-14 text-base font-medium"
              onClick={() => setShowEarlyAccess(true)}
            >
              Request Access
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-border hover:bg-secondary px-10 h-14 text-base font-medium">
              Partner with Us
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-8">
            Studious LMS — Modern Learning, Simplified.
          </p>
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
                <li><Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="/program" className="text-sm text-muted-foreground hover:text-foreground transition-colors">School Program</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="#team" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Team</Link></li>
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