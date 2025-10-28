"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download,
  Mail,
  FileText,
  Image as ImageIcon,
  Users,
  TrendingUp,
  Globe,
  Award
} from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { useTranslations } from "next-intl";

export default function PressPage() {
  const t = useTranslations('press');
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-14 md:pb-16 px-4 sm:px-6 bg-gradient-to-b from-background via-secondary/30 to-background">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge variant="outline" className="mb-4 sm:mb-6 px-3 sm:px-4 py-1 sm:py-1.5 border-primary/20 text-primary text-sm">
            {t('badge')}
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 tracking-tight px-4">
            {t('title')}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Company Factsheet */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-4">
              {t('factsheet.title')}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">
              {t('factsheet.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {t('factsheet.companyInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{t('factsheet.founded')}</span>
                  <span className="font-medium text-foreground">Q1 2023</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{t('factsheet.hq')}</span>
                  <span className="font-medium text-foreground">Distributed (CH, SG, CN)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{t('factsheet.industry')}</span>
                  <span className="font-medium text-foreground">Education Technology</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{t('factsheet.website')}</span>
                  <span className="font-medium text-foreground">studious.sh</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">{t('factsheet.status')}</span>
                  <span className="font-medium text-foreground">Early Access (Launched Oct 17, 2025)</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  {t('factsheet.currentStatus')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{t('factsheet.launchDate')}</span>
                  <span className="font-medium text-foreground">October 17, 2025</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{t('factsheet.currentPhase')}</span>
                  <span className="font-medium text-foreground">Early Access</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{t('factsheet.targetMarkets')}</span>
                  <span className="font-medium text-foreground">Global</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{t('factsheet.teamSize')}</span>
                  <span className="font-medium text-foreground">8 members</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">{t('factsheet.devHqs')}</span>
                  <span className="font-medium text-foreground">CH, SG, CN</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Product Description */}
      {/* <section className="py-20 px-6 bg-secondary/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-foreground mb-8">
            About Studious LMS
          </h2>
          
          <div className="prose prose-lg max-w-none">
            <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
              <p className="text-foreground font-semibold text-xl">
                Short Description (1 sentence)
              </p>
              <p className="bg-background border-l-4 border-primary pl-6 py-4 rounded-r">
                Studious is a modern learning management system launched on October 17, 2025, that integrates AI, real-time calendars, and class communication into one cohesive platform designed for schools of any size.
              </p>

              <p className="text-foreground font-semibold text-xl mt-12">
                Medium Description (1 paragraph)
              </p>
              <p className="bg-background border-l-4 border-primary pl-6 py-4 rounded-r">
                Studious LMS reimagines how schools manage teaching and learning. Launched on October 17, 2025, and built from the ground up with modern web technologies and AI integration, Studious unifies class management, assignments, grading, real-time communication, and analytics into a single, intuitive platform. Unlike traditional school portals that are slow and fragmented, Studious is fast, cohesive, and delightful to use—designed for the next generation of education.
              </p>

              <p className="text-foreground font-semibold text-xl mt-12">
                Long Description (Full)
              </p>
              <div className="bg-background border-l-4 border-primary pl-6 py-4 rounded-r space-y-4">
                <p>
                  Studious LMS was born from years of frustration with outdated, fragmented school portals. Founded in 2023 by students and educators who wanted better tools for modern education, Studious officially launched on October 17, 2025, as a comprehensive learning management platform designed for the modern era.
                </p>
                <p>
                  The platform brings together everything educators need in one place: class management, assignment creation and grading, real-time calendars, file storage, analytics, and built-in communication tools. What sets Studious apart is its thoughtful AI integration—not as a gimmick, but as a genuine productivity multiplier that helps teachers generate content, provide personalized feedback, and save hours each week.
                </p>
                <p>
                  Built with cutting-edge web technologies (Next.js, TypeScript, tRPC, PostgreSQL), Studious delivers the speed and reliability of modern SaaS products while maintaining the security and compliance standards required for educational institutions. The platform is designed to scale from small classrooms to large universities, with flexible pricing that makes quality education technology accessible to schools of all sizes. In January 2026, the Studious School Development Program will launch, providing free access to qualifying schools without economic means.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Brand Assets */}
      {/* <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Brand Assets
            </h2>
            <p className="text-xl text-muted-foreground">
              Logos, screenshots, and visual assets for media use
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border border-border hover:border-primary/50 transition-all">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  Logo Package
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  SVG, PNG, and vector formats in light and dark variants
                </p>
                <Button variant="outline" className="w-full" disabled>
                  <Download className="mr-2 h-4 w-4" />
                  Download Logos
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-border hover:border-primary/50 transition-all">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  Product Screenshots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  High-resolution screenshots of the platform interface
                </p>
                <Button variant="outline" className="w-full" disabled>
                  <Download className="mr-2 h-4 w-4" />
                  Download Screenshots
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-border hover:border-primary/50 transition-all">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Team Photos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Professional headshots and team photos
                </p>
                <Button variant="outline" className="w-full" disabled>
                  <Download className="mr-2 h-4 w-4" />
                  Download Photos
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-border hover:border-primary/50 transition-all">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Brand Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Usage guidelines, color palette, and typography
                </p>
                <Button variant="outline" className="w-full" disabled>
                  <Download className="mr-2 h-4 w-4" />
                  Download Guidelines
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-6 bg-secondary/30 border border-border rounded-xl">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Usage Note:</strong> All assets are provided for press and editorial use only. Please maintain the aspect ratio and spacing outlined in our brand guidelines. Do not modify the logo or use unauthorized color schemes.
            </p>
          </div>
        </div>
      </section> */}

      {/* Awards & Recognition */}
      {/* <section className="py-20 px-6 bg-secondary/30">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Awards & Recognition
            </h2>
          </div>

          <div className="space-y-4">
            <Card className="border border-border">
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">EdTech Startup to Watch 2024</h3>
                    <p className="text-sm text-muted-foreground">Featured in EdTech Innovators List</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Best Student-Built Project 2023</h3>
                    <p className="text-sm text-muted-foreground">International School Hackathon Winner</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Rising Star in Education Tech</h3>
                    <p className="text-sm text-muted-foreground">EdTech Asia Summit 2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section> */}

      {/* Press Contact */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-background">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Mail className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-4">
            {t('contact.title')}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 px-4">
            {t('contact.subtitle')}
          </p>
          
          <div className="space-y-3 sm:space-y-4 max-w-md mx-auto px-4">
            <div className="flex items-center justify-center gap-2 text-foreground flex-wrap">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
              <a href="mailto:press@studious.sh" className="text-base sm:text-lg font-medium hover:text-primary transition-colors">
                press@studious.sh
              </a>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t('contact.sl')}
            </p>
          </div>

          <div className="mt-8 sm:mt-10 md:mt-12 pt-8 sm:pt-10 md:pt-12 border-t border-border">
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-4">
              {t('contact.general')}
            </p>
            <a href="mailto:hello@studious.sh" className="text-primary hover:underline text-sm sm:text-base">
              hello@studious.sh
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

