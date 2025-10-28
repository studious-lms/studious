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
import { Footer } from "@/components/marketing/Footer";
import { useTranslations } from "next-intl"

export default function AboutPage() {
  const [showEarlyAccess, setShowEarlyAccess] = useState(false);
  const t = useTranslations('about');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-14 md:pb-16 px-4 sm:px-6 bg-gradient-to-b from-background via-secondary/30 to-background">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge variant="outline" className="mb-4 sm:mb-6 px-3 sm:px-4 py-1 sm:py-1.5 border-primary/20 text-primary text-sm">
            {t('titleStatement1')}
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 tracking-tight px-4">
            {t('titleStatement2')}
            <br className="hidden sm:block" />
            <span className="block sm:inline"> <span className="text-primary">{t('titleStatement3')}</span></span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
            {t('titleStatement4')}
          </p>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-base sm:prose-lg max-w-none">
            <div className="space-y-4 sm:space-y-6 text-muted-foreground text-base sm:text-lg leading-relaxed">
              <p>
                <span className="text-foreground font-semibold">{t('problemParagraph1')}</span> {t('problemParagraph2')}
              </p>
              <p>
                {t('problemDetailParagraph')}
              </p>
              <p className="text-foreground font-medium text-xl">
                {t('betterWay')}
              </p>
              <p>
                {t('solutionParagraph1')} <span className="text-foreground font-semibold">{t('solutionParagraph2')}</span> {t('solutionParagraph3')}
              </p>
              <p>
                {t('launchParagraph')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-secondary/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-4">
              {t('journey1')}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">
              {t('journey2')}
            </p>
          </div>

          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            {/* 2023 Beginning */}
            <div className="flex gap-4 sm:gap-6 md:gap-8">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="w-px h-full bg-border mt-3 sm:mt-4"></div>
              </div>
              <div className="pb-8 sm:pb-10 md:pb-12 flex-1">
                <Badge variant="outline" className="mb-2 sm:mb-3 text-xs sm:text-sm">{t('journeyBeginningDate')}</Badge>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{t('journeyBeginning1')}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {t('journeyBeginning2')}
                </p>
              </div>
            </div>

            {/* October 17, 2025 - Public Launch */}
            <div className="flex gap-4 sm:gap-6 md:gap-8">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary border-2 border-primary flex items-center justify-center flex-shrink-0">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                </div>
                <div className="w-px h-full bg-border mt-3 sm:mt-4"></div>
              </div>
              <div className="pb-8 sm:pb-10 md:pb-12 flex-1">
                <Badge className="mb-2 sm:mb-3 bg-primary text-primary-foreground text-xs sm:text-sm">{t('journeyBetaLaunchDate')}</Badge>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{t('journeyBetaLaunch1')}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {t('journeyBetaLaunch2')}
                </p>
              </div>
            </div>

            {/* November 2025 - Pilot Schools */}
            <div className="flex gap-4 sm:gap-6 md:gap-8">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="w-px h-full bg-border mt-3 sm:mt-4"></div>
              </div>
              <div className="pb-8 sm:pb-10 md:pb-12 flex-1">
                <Badge variant="outline" className="mb-2 sm:mb-3 text-xs sm:text-sm">{t('journeyPilotSchoolsDate')}</Badge>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{t('journeyPilotSchools1')}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {t('journeyPilotSchools2')}
                </p>
              </div>
            </div>

            {/* December 2025 - Beta Complete */}
            <div className="flex gap-4 sm:gap-6 md:gap-8">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="w-px h-full bg-border mt-3 sm:mt-4"></div>
              </div>
              <div className="pb-8 sm:pb-10 md:pb-12 flex-1">
                <Badge variant="outline" className="mb-2 sm:mb-3 text-xs sm:text-sm">{t('journeyBetaCompleteDate')}</Badge>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{t('journeyBetaComplete1')}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {t('journeyBetaComplete2')}
                </p>
              </div>
            </div>

            {/* January 2026 - School Development Program */}
            <div className="flex gap-4 sm:gap-6 md:gap-8">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center flex-shrink-0">
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <Badge variant="outline" className="mb-2 sm:mb-3 text-xs sm:text-sm">{t('journeySDPDate')}</Badge>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{t('journeySDP1')}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {t('journeySDP2')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-primary">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-4 sm:mb-6 px-4">
            {t('missionStatement1')}
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-primary-foreground/90 leading-relaxed px-4">
            {t('missionStatement2')}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 sm:mb-6 px-4">
            {t('joinAppeal1')}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 sm:mb-10 px-4">
            {t('joinAppeal2')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 md:px-10 h-12 sm:h-14 w-full sm:w-auto"
              onClick={() => setShowEarlyAccess(true)}
            >
              {t('requestEarlyAccess')}
              <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
            </Button>
            <Link href="/press" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="border-border hover:bg-secondary px-6 sm:px-8 md:px-10 h-12 sm:h-14 w-full">
                {t('pressKit')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      {Footer()}
      
      <EarlyAccessModal open={showEarlyAccess} onOpenChange={setShowEarlyAccess} />
    </div>
  );
}

