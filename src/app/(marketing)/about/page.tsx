"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight,
  Code2,
  Database,
  Zap,
  Heart,
  Calendar,
  Users,
  Globe,
  Sparkles
} from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { EarlyAccessModal } from "@/components/marketing/EarlyAccessModal";
import { useState } from "react";

export default function AboutPage() {
  const [showEarlyAccess, setShowEarlyAccess] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-b from-background via-secondary/30 to-background">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge variant="outline" className="mb-6 px-4 py-1.5 border-primary/20 text-primary">
            Our Story
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Built from frustration,
            <br />
            <span className="text-primary">reimagined with AI</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            After years of struggling with outdated, fragmented school portals, we decided to build the learning management system we always wished we had.
          </p>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
              <p>
                <span className="text-foreground font-semibold">Studious began in 2023</span> when a group of students and educators came together with a shared frustration: existing school portals were clunky, slow, and built for a different era of education.
              </p>
              <p>
                We found ourselves juggling multiple platforms — one for grades, another for assignments, a third for communication. Teachers spent more time fighting with software than teaching. Students missed deadlines because notifications were buried in outdated interfaces.
              </p>
              <p className="text-foreground font-medium text-xl">
                We knew there had to be a better way.
              </p>
              <p>
                Drawing inspiration from modern collaboration tools like Linear and Notion, we set out to create a learning management system that felt <span className="text-foreground font-semibold">fast, intuitive, and delightful to use</span>. One that integrated AI not as a gimmick, but as a genuine productivity multiplier for both teachers and students.
              </p>
              <p>
                After two years of development, we officially launched Studious on October 17, 2025. We're now in early access, ready to help schools worldwide transform their learning experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-6 bg-secondary/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-muted-foreground">
              Two years of building, learning, and growing
            </p>
          </div>

          <div className="space-y-12">
            {/* 2023 Beginning */}
            <div className="flex gap-8">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="w-px h-full bg-border mt-4"></div>
              </div>
              <div className="pb-12">
                <Badge variant="outline" className="mb-3">2023</Badge>
                <h3 className="text-2xl font-bold text-foreground mb-2">The Beginning</h3>
                <p className="text-muted-foreground">
                  First prototype developed. Core features: class management, assignments, and calendar integration.
                </p>
              </div>
            </div>

            {/* October 17, 2025 - Public Launch */}
            <div className="flex gap-8">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary border-2 border-primary flex items-center justify-center flex-shrink-0">
                  <Zap className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="w-px h-full bg-border mt-4"></div>
              </div>
              <div className="pb-12">
                <Badge className="mb-3 bg-primary text-primary-foreground">October 31, 2025</Badge>
                <h3 className="text-2xl font-bold text-foreground mb-2">Public Beta Launch</h3>
                <p className="text-muted-foreground">
                  Official public beta-testing launch of Studious LMS. Opening early access to schools worldwide with full platform capabilities.
                </p>
              </div>
            </div>

            {/* November 2025 - Pilot Schools */}
            <div className="flex gap-8">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="w-px h-full bg-border mt-4"></div>
              </div>
              <div className="pb-12">
                <Badge variant="outline" className="mb-3">November 2025</Badge>
                <h3 className="text-2xl font-bold text-foreground mb-2">Pilot Schools Program</h3>
                <p className="text-muted-foreground">
                  Launching partnerships with pilot schools to gather real-world feedback and refine the platform based on diverse educational needs.
                </p>
              </div>
            </div>

            {/* December 2025 - Beta Complete */}
            <div className="flex gap-8">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="w-px h-full bg-border mt-4"></div>
              </div>
              <div className="pb-12">
                <Badge variant="outline" className="mb-3">December 2025</Badge>
                <h3 className="text-2xl font-bold text-foreground mb-2">Beta Complete</h3>
                <p className="text-muted-foreground">
                  Transition from beta to full production release. Platform stabilization with all core features fully tested and optimized.
                </p>
              </div>
            </div>

            {/* January 2026 - School Development Program */}
            <div className="flex gap-8">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center flex-shrink-0">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <Badge variant="outline" className="mb-3">January 2026</Badge>
                <h3 className="text-2xl font-bold text-foreground mb-2">School Development Program Launch</h3>
                <p className="text-muted-foreground">
                  Announcing the first cohort of schools accepted into the Studious School Development Program, providing free access to qualifying institutions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 px-6 bg-primary">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Our mission is simple
          </h2>
          <p className="text-2xl text-primary-foreground/90 leading-relaxed">
            To build the learning management system that we—as students, teachers, and lifelong learners—would want to use every day.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Join us on this journey
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Be part of the future of education
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 h-14"
              onClick={() => setShowEarlyAccess(true)}
            >
              Request Early Access
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Link href="/press">
              <Button size="lg" variant="outline" className="border-border hover:bg-secondary px-10 h-14">
                Press Kit
              </Button>
            </Link>
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
      
      <EarlyAccessModal open={showEarlyAccess} onOpenChange={setShowEarlyAccess} />
    </div>
  );
}

