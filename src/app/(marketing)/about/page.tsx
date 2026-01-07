"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowRight,
  Zap,
  Heart,
  Calendar,
  Users,
  Globe,
  Sparkles,
  Target,
  Lightbulb,
  GraduationCap,
  MapPin
} from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { EarlyAccessModal } from "@/components/marketing/EarlyAccessModal";
import { useState } from "react";
import { Footer } from "@/components/marketing/Footer";
import { useTranslations } from "next-intl"

export default function AboutPage() {
  const [showEarlyAccess, setShowEarlyAccess] = useState(false);
  const t = useTranslations('about');

  const teamMembers = [
    {
      name: "Team Member 1",
      role: "Co-Founder & CEO",
      location: "Singapore"
    },
    {
      name: "Team Member 2",
      role: "Co-Founder & CTO",
      location: "Switzerland"
    },
    {
      name: "Team Member 3",
      role: "Head of Product",
      location: "China"
    },
    {
      name: "Team Member 4",
      role: "Lead Engineer",
      location: "Singapore"
    },
    {
      name: "Team Member 5",
      role: "Design Lead",
      location: "Switzerland"
    },
    {
      name: "Team Member 6",
      role: "Education Specialist",
      location: "Singapore"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 sm:pt-36 md:pt-44 pb-16 sm:pb-20 px-4 sm:px-6 bg-background">
        <div className="container mx-auto max-w-3xl text-center">
          <p className="text-primary font-medium text-sm uppercase tracking-wide mb-4">
            {t('titleStatement1')}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            {t('titleStatement2')} <span className="text-primary">{t('titleStatement3')}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('titleStatement4')}
          </p>
        </div>
      </section>

      {/* Mission/Vision/Values */}
      <section className="py-12 px-4 sm:px-6 bg-secondary/30 border-y border-border">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <Target className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Our Mission</h3>
              <p className="text-sm text-muted-foreground">Democratize quality education technology for every school, everywhere</p>
            </div>
            <div className="text-center p-6">
              <Lightbulb className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Our Vision</h3>
              <p className="text-sm text-muted-foreground">A world where every educator has the tools to inspire the next generation</p>
            </div>
            <div className="text-center p-6">
              <Heart className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Our Values</h3>
              <p className="text-sm text-muted-foreground">Accessibility, innovation, and unwavering commitment to educators</p>
            </div>
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-background">
        <div className="container mx-auto max-w-3xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
            {/* Story Image Placeholder */}
            <div className="lg:col-span-2 order-first lg:order-last">
              <div className="aspect-[4/5] rounded-lg bg-secondary border border-border flex items-center justify-center">
                <div className="text-center p-6">
                  <GraduationCap className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-muted-foreground/50 text-sm">Team Photo</p>
                </div>
              </div>
            </div>
            
            {/* Story Text */}
            <div className="lg:col-span-3">
              <p className="text-primary font-medium text-sm uppercase tracking-wide mb-3">
                Our Story
              </p>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <span className="text-foreground font-medium">{t('problemParagraph1')}</span> {t('problemParagraph2')}
                </p>
                <p>
                  {t('problemDetailParagraph')}
                </p>
                <p className="text-foreground font-medium text-lg border-l-2 border-primary pl-4">
                  {t('betterWay')}
                </p>
                <p>
                  {t('solutionParagraph1')} <span className="text-foreground font-medium">{t('solutionParagraph2')}</span> {t('solutionParagraph3')}
                </p>
                <p>
                  {t('launchParagraph')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-secondary/30 border-y border-border">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              {t('journey1')}
            </h2>
            <p className="text-muted-foreground">
              {t('journey2')}
            </p>
          </div>

          <div className="space-y-6">
            {/* 2023 Beginning */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div className="w-px h-full bg-border mt-2"></div>
              </div>
              <div className="pb-6">
                <p className="text-xs text-primary font-medium uppercase tracking-wide mb-1">{t('journeyBeginningDate')}</p>
                <h3 className="text-lg font-semibold text-foreground mb-1">{t('journeyBeginning1')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('journeyBeginning2')}
                </p>
              </div>
            </div>

            {/* October 17, 2025 - Public Launch */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-primary border border-primary flex items-center justify-center flex-shrink-0">
                  <Zap className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="w-px h-full bg-border mt-2"></div>
              </div>
              <div className="pb-6">
                <p className="text-xs text-primary font-medium uppercase tracking-wide mb-1">{t('journeyBetaLaunchDate')}</p>
                <h3 className="text-lg font-semibold text-foreground mb-1">{t('journeyBetaLaunch1')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('journeyBetaLaunch2')}
                </p>
              </div>
            </div>

            {/* November 2025 - Pilot Schools */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="w-px h-full bg-border mt-2"></div>
              </div>
              <div className="pb-6">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">{t('journeyPilotSchoolsDate')}</p>
                <h3 className="text-lg font-semibold text-foreground mb-1">{t('journeyPilotSchools1')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('journeyPilotSchools2')}
                </p>
              </div>
            </div>

            {/* December 2025 - Beta Complete */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="w-px h-full bg-border mt-2"></div>
              </div>
              <div className="pb-6">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">{t('journeyBetaCompleteDate')}</p>
                <h3 className="text-lg font-semibold text-foreground mb-1">{t('journeyBetaComplete1')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('journeyBetaComplete2')}
                </p>
              </div>
            </div>

            {/* January 2026 - School Development Program */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary flex items-center justify-center flex-shrink-0">
                  <Heart className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">{t('journeySDPDate')}</p>
                <h3 className="text-lg font-semibold text-foreground mb-1">{t('journeySDP1')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('journeySDP2')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Meet the Team
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A distributed team of educators, engineers, and designers passionate about transforming education
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                {/* Avatar placeholder */}
                <div className="aspect-square rounded-lg bg-secondary border border-border flex items-center justify-center mb-3">
                  <Users className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <h3 className="font-medium text-sm text-foreground">{member.name}</h3>
                <p className="text-xs text-primary">{member.role}</p>
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  <span>{member.location}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Global presence */}
          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4 text-primary" />
              <span>Distributed across <span className="font-medium text-foreground">3 countries</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-primary">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            {t('missionStatement1')}
          </h2>
          <p className="text-lg text-primary-foreground/80">
            {t('missionStatement2')}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-background">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            {t('joinAppeal1')}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t('joinAppeal2')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
              onClick={() => setShowEarlyAccess(true)}
            >
              {t('requestEarlyAccess')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Link href="/press">
              <Button size="lg" variant="outline" className="px-8">
                {t('pressKit')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      
      <EarlyAccessModal open={showEarlyAccess} onOpenChange={setShowEarlyAccess} />
    </div>
  );
}
