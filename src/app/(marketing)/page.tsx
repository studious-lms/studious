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
  CheckCircle2,
  Shield,
  Clock,
  GraduationCap,
  School,
  Laptop
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { EarlyAccessModal } from "@/components/marketing/EarlyAccessModal";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations('marketing');
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
      <section className="pt-28 sm:pt-36 md:pt-44 pb-16 sm:pb-20 md:pb-28 px-4 sm:px-6 bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-primary font-medium text-sm uppercase tracking-wide mb-4">
              {t('hero.badge')}
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight leading-tight">
              {t('hero.title1')}
              <br />
              <span className="text-primary">{t('hero.title2')}</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-12 text-base font-medium"
                onClick={() => setShowEarlyAccess(true)}
              >
                {t('hero.requestEarlyAccess')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground px-8 h-12 text-base"
                onClick={() => router.push('https://www.youtube.com/watch?v=RYae8MkEEjI')}
              >
                <Play className="mr-2 h-4 w-4" />
                {t('hero.watchDemo')}
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="mt-16 sm:mt-20 rounded-lg overflow-hidden border border-border shadow-sm">
            <img src="/light:hero.png" alt={t('hero.altDashboard')} className="w-full h-auto block dark:hidden" />
            <img src="/dark:hero.png" alt={t('hero.altDashboard')} className="w-full h-auto hidden dark:block" />
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('problem.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="p-6 rounded-lg border border-border bg-card">
              <Zap className="h-8 w-8 text-primary mb-4 mx-auto" />
              <p className="text-muted-foreground">
                {t('problem.issue1')}
              </p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <Users className="h-8 w-8 text-primary mb-4 mx-auto" />
              <p className="text-muted-foreground">
                {t('problem.issue2')}
              </p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <Bot className="h-8 w-8 text-primary mb-4 mx-auto" />
              <p className="text-muted-foreground">
                {t('problem.issue3')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Response Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-secondary/30 border-y border-border">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('response.title1')} <span className="text-primary">{t('response.title2')}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('response.subtitle')}
          </p>
        </div>
      </section>

      {/* Feature Showcase - Simple alternating layout */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-background">
        <div className="container mx-auto max-w-5xl space-y-20 sm:space-y-24">
          {/* Feature 1: AI-Powered Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-3">
                <Bot className="h-4 w-4" />
                AI-Powered
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                {t('features.ai.title')}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t('features.ai.description')}
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Auto-generate worksheets and quizzes
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Intelligent grading assistance
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Personalized student feedback
                </li>
              </ul>
            </div>
            <div className="order-first lg:order-last">
              <img className="dark:hidden block aspect-[16/9] rounded-lg bg-secondary border border-border flex items-center justify-center"
                src="services/light:worksheet-ai.png" alt="Worksheet AI Preview" />
              <img className="dark:block hidden aspect-[16/9] rounded-lg bg-secondary border border-border flex items-center justify-center"
                src="services/dark:worksheet-ai.png" alt="Worksheet AI Preview" />
            </div>
          </div>

          {/* Feature 2: Class Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <img className="dark:block hidden aspect-[16/9] rounded-lg bg-secondary border border-border flex items-center justify-center"
                src="services/dark:classes.png" alt="Calendar Preview" />
              <img className="dark:hidden block aspect-[16/9] rounded-lg bg-secondary border border-border flex items-center justify-center"
                src="services/light:classes.png" alt="Calendar Preview" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-3">
                <BookOpen className="h-4 w-4" />
                Class Management
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                {t('features.classManagement.title')}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t('features.classManagement.description')}
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Unlimited classes and students
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Real-time collaboration
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Attendance tracking & analytics
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 3: Smart Calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-3">
                <Calendar className="h-4 w-4" />
                Scheduling
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                {t('features.calendar.title')}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t('features.calendar.description')}
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Unified class schedules
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Assignment deadlines at a glance
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Export to Google, Apple, Outlook
                </li>
              </ul>
            </div>
            <div className="order-first lg:order-last">
              <img className="dark:block hidden aspect-[16/9] rounded-lg bg-secondary border border-border flex items-center justify-center"
                src="services/dark:agenda.png" alt="Calendar Preview" />
              <img className="dark:hidden block aspect-[16/9] rounded-lg bg-secondary border border-border flex items-center justify-center"
                src="services/light:agenda.png" alt="Calendar Preview" />
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section id="features" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-secondary/30 border-y border-border">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
              {t('features.title')}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <Bot className="h-6 w-6 text-primary mb-2" />
                <CardTitle className="text-lg">{t('features.ai.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('features.ai.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <BookOpen className="h-6 w-6 text-primary mb-2" />
                <CardTitle className="text-lg">{t('features.classManagement.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('features.classManagement.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <FileText className="h-6 w-6 text-primary mb-2" />
                <CardTitle className="text-lg">{t('features.assignments.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('features.assignments.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <Calendar className="h-6 w-6 text-primary mb-2" />
                <CardTitle className="text-lg">{t('features.calendar.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('features.calendar.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <BarChart3 className="h-6 w-6 text-primary mb-2" />
                <CardTitle className="text-lg">{t('features.analytics.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('features.analytics.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <MessageCircle className="h-6 w-6 text-primary mb-2" />
                <CardTitle className="text-lg">{t('features.communication.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('features.communication.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-primary">
        <div className="container mx-auto max-w-3xl text-center">
          <blockquote className="text-xl sm:text-2xl md:text-3xl font-medium text-primary-foreground leading-relaxed">
            "{t('quote.text')}"
          </blockquote>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-background border-b border-border">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">500+</div>
              <p className="text-sm text-muted-foreground">Schools</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">25K+</div>
              <p className="text-sm text-muted-foreground">Students</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">22+</div>
              <p className="text-sm text-muted-foreground">Languages</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">99.9%</div>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-secondary/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
              {t('pricing.title')}
            </h2>
            <p className="text-muted-foreground">
              {t('pricing.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Starter Plan */}
            <Card className="border border-border bg-card">
              <CardHeader className="space-y-3">
                <CardTitle className="text-xl">{t('pricing.starter.title')}</CardTitle>
                <div>
                  <div className="text-4xl font-bold text-foreground">{t('pricing.starter.price')}</div>
                  <p className="text-sm text-muted-foreground mt-1">{t('pricing.starter.note')}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('pricing.starter.perk1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('pricing.starter.perk2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('pricing.starter.perk3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('pricing.starter.perk4')}</span>
                  </li>
                </ul>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowEarlyAccess(true)}
                >
                  {t('pricing.starter.button')}
                </Button>
              </CardContent>
            </Card>

            {/* School Plan - Featured */}
            <Card className="border-2 border-primary bg-card relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground text-xs">
                  {t('pricing.mostPopular')}
                </Badge>
              </div>
              <CardHeader className="space-y-3">
                <CardTitle className="text-xl">{t('pricing.school.title')}</CardTitle>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">{t('pricing.school.price')}</span>
                    <span className="text-muted-foreground text-sm">{t('pricing.school.priceUnit')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{t('pricing.school.note')}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('pricing.school.perk1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('pricing.school.perk2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('pricing.school.perk3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('pricing.school.perk4')}</span>
                  </li>
                </ul>
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => setShowEarlyAccess(true)}
                >
                  {t('pricing.school.button')}
                </Button>
              </CardContent>
            </Card>

            {/* Institution Plan */}
            <Card className="border border-border bg-card">
              <CardHeader className="space-y-3">
                <CardTitle className="text-xl">{t('pricing.institution.title')}</CardTitle>
                <div>
                  <div className="text-4xl font-bold text-foreground">{t('pricing.institution.price')}</div>
                  <p className="text-sm text-muted-foreground mt-1">{t('pricing.institution.note')}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('pricing.institution.perk1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('pricing.institution.perk2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('pricing.institution.perk3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('pricing.institution.perk4')}</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full" onClick={() => setShowEarlyAccess(true)}>
                  {t('pricing.institution.button')}
                </Button>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8" dangerouslySetInnerHTML={{ __html: t('pricing.earlyBird') }} />
        </div>
      </section>

      {/* School Development Program */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-background border-y border-border">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div>
              <p className="text-primary font-medium text-sm uppercase tracking-wide mb-3">
                {t('schoolProgram.badge')}
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t('schoolProgram.title')}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t('schoolProgram.subtitle')}
              </p>
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{t('schoolProgram.feature1Title')}</p>
                    <p className="text-sm text-muted-foreground">{t('schoolProgram.feature1Description')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{t('schoolProgram.feature2Title')}</p>
                    <p className="text-sm text-muted-foreground">{t('schoolProgram.feature2Description')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{t('schoolProgram.feature3Title')}</p>
                    <p className="text-sm text-muted-foreground">{t('schoolProgram.feature3Description')}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/program/apply">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    {t('schoolProgram.applyNow')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/program">
                  <Button variant="ghost" className="text-muted-foreground">
                    {t('schoolProgram.learnMore')}
                  </Button>
                </Link>
              </div>
            </div>

            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg">{t('schoolProgram.eligibilityTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground text-sm mb-2">{t('schoolProgram.qualifyingTitle')}</h4>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t('schoolProgram.qualify1')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t('schoolProgram.qualify2')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t('schoolProgram.qualify3')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t('schoolProgram.qualify4')}</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">{t('schoolProgram.commitmentTitle')}</strong> {t('schoolProgram.commitment')}
                  </p>
                </div>

                <div className="bg-secondary rounded-lg p-4">
                  <p className="text-sm font-medium text-foreground mb-1">
                    {t('schoolProgram.launchTitle')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('schoolProgram.launch')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Future Developments Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-secondary/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
              {t('futureDevelopments.title')}
            </h2>
            <p className="text-muted-foreground">
              {t('futureDevelopments.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <Users className="h-6 w-6 text-primary mb-2" />
                <CardTitle className="text-lg">{t('futureDevelopments.sustainable.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('futureDevelopments.sustainable.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <TrendingUp className="h-6 w-6 text-primary mb-2" />
                <CardTitle className="text-lg">{t('futureDevelopments.features.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('futureDevelopments.features.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <Zap className="h-6 w-6 text-primary mb-2" />
                <CardTitle className="text-lg">{t('futureDevelopments.launch.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('futureDevelopments.launch.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-background">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t('cta.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
              onClick={() => setShowEarlyAccess(true)}
            >
              {t('cta.requestAccess')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="px-8">
              {t('cta.partnerWithUs')}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            {t('cta.tagline')}
          </p>
        </div>
      </section>

      <Footer />

      <EarlyAccessModal open={showEarlyAccess} onOpenChange={setShowEarlyAccess} />
    </div>
  );
}
