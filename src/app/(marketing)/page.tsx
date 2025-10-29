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
      <section className="pt-20 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 bg-gradient-to-b from-background via-secondary/30 to-background relative overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center">
            <Badge variant="outline" className="mb-4 sm:mb-6 px-3 sm:px-4 py-1 sm:py-1.5 border-primary/20 text-primary text-xs sm:text-sm">
              {t('hero.badge')}
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-foreground mb-4 sm:mb-6 tracking-tight px-2">
              {t('hero.title1')}
                <br className="hidden sm:block" />
              <span className="text-primary"> {t('hero.title2')}</span>
              </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-4">
              {t('hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center px-4 sm:px-0">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 h-11 sm:h-12 text-sm sm:text-base font-medium w-full sm:w-auto"
                onClick={() => setShowEarlyAccess(true)}
              >
                {t('hero.requestEarlyAccess')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-border hover:bg-secondary px-6 sm:px-8 h-11 sm:h-12 text-sm sm:text-base font-medium w-full sm:w-auto" onClick={() => router.push('https://www.youtube.com/watch?v=RYae8MkEEjI')}>
                <Play className="mr-2 h-4 w-4" />
                {t('hero.watchDemo')}
              </Button>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="mt-12 sm:mt-16 md:mt-20 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border border-border relative">
            <img src="/hero-light.png" alt={t('hero.altDashboard')} className="w-full h-auto block dark:hidden" />
            <img src="/hero-dark.png" alt={t('hero.altDashboard')} className="w-full h-auto hidden dark:block" />
            <div className="absolute inset-x-0 bottom-0 h-20 sm:h-32 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-secondary/50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground px-4">
              {t('problem.title')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12 px-4 sm:px-0">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto">
                  <Zap className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-base sm:text-lg">
                  {t('problem.issue1')}
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-base sm:text-lg">
                  {t('problem.issue2')}
                </p>
              </div>
              <div className="space-y-3 sm:col-span-2 md:col-span-1">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto">
                  <Bot className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-base sm:text-lg">
                  {t('problem.issue3')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Response Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-background">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6 px-4 leading-tight">
            {t('response.title1')}
            <br className="hidden sm:block" />
            <span className="block sm:inline"> {t('response.title2')}</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            {t('response.subtitle')}
          </p>
        </div>
      </section>

      {/* Key Features Table */}
      <section id="features" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4 px-4">
              {t('features.title')}
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              {t('features.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="border border-border hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{t('features.ai.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('features.ai.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{t('features.classManagement.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('features.classManagement.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{t('features.assignments.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('features.assignments.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{t('features.calendar.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('features.calendar.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{t('features.analytics.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('features.analytics.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{t('features.communication.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('features.communication.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-primary">
        <div className="container mx-auto max-w-4xl text-center">
          <blockquote className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-primary-foreground leading-relaxed px-4">
            {t('quote.text')}
          </blockquote>
              </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4 px-4">
              {t('pricing.title')}
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground px-4">
              {t('pricing.subtitle')}
            </p>
              </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto px-4 sm:px-0">
            {/* Starter Plan */}
            <Card className="border-2 border-border hover:border-primary/50 transition-all flex flex-col h-full">
              <CardHeader className="space-y-4">
                <CardTitle className="text-2xl">{t('pricing.starter.title')}</CardTitle>
                <div>
                  <div className="text-5xl font-bold text-foreground">{t('pricing.starter.price')}</div>
                  <p className="text-sm text-muted-foreground mt-2">{t('pricing.starter.note')}</p>
            </div>
                <p className="text-muted-foreground">
                  {t('pricing.starter.description')}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 space-y-4">
                <ul className="space-y-3 flex-1">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricing.starter.perk1')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricing.starter.perk2')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricing.starter.perk3')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricing.starter.perk4')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricing.starter.perk5')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricing.starter.perk6')}</span>
                  </li>
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full mt-auto"
                  onClick={() => setShowEarlyAccess(true)}
                >
                  {t('pricing.starter.button')}
                </Button>
              </CardContent>
            </Card>

            {/* School Plan - Featured */}
            <Card className="border-2 border-primary shadow-2xl relative md:scale-105 flex flex-col h-full">
              <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm">
                  {t('pricing.mostPopular')}
                </Badge>
              </div>
              <CardHeader className="space-y-4">
                <CardTitle className="text-2xl">{t('pricing.school.title')}</CardTitle>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-foreground">{t('pricing.school.price')}</span>
                    <span className="text-muted-foreground">{t('pricing.school.priceUnit')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{t('pricing.school.note')}</p>
                </div>
                <p className="text-muted-foreground">
                  {t('pricing.school.description')}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 space-y-4">
                <ul className="space-y-3 flex-1">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricing.school.perk1')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricing.school.perk2')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricing.school.perk3')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricing.school.perk4')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricing.school.perk5')}</span>
                  </li>
                </ul>
                <Button 
                  className="w-full mt-auto bg-primary hover:bg-primary/90"
                  onClick={() => setShowEarlyAccess(true)}
                >
                  {t('pricing.school.button')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Institution Plan */}
            <Card className="border-2 border-border hover:border-primary/50 transition-all flex flex-col h-full">
              <CardHeader className="space-y-4">
                <CardTitle className="text-2xl">{t('pricing.institution.title')}</CardTitle>
                <div>
                  <div className="text-5xl font-bold text-foreground">{t('pricing.institution.price')}</div>
                  <p className="text-sm text-muted-foreground mt-2">{t('pricing.institution.note')}</p>
                </div>
                <p className="text-muted-foreground">
                  {t('pricing.institution.description')}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 space-y-4">
                <ul className="space-y-3 flex-1">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricing.institution.perk1')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricing.institution.perk2')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricing.institution.perk3')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricing.institution.perk4')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricing.institution.perk5')}</span>
                    </li>
                </ul>
                <Button variant="outline" className="w-full mt-auto" onClick={() => setShowEarlyAccess(true)}>
                  {t('pricing.institution.button')}
                </Button>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-muted-foreground mt-8 sm:mt-10 md:mt-12 text-base sm:text-lg px-4" dangerouslySetInnerHTML={{ __html: t('pricing.earlyBird') }} />
              </div>
      </section>
      
      {/* School Development Program */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-br from-primary/5 via-background to-primary/5 border-y border-primary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6">
              <Badge variant="outline" className="border-primary/30 text-primary text-sm sm:text-base">
                {t('schoolProgram.badge')}
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                {t('schoolProgram.title')}
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
                {t('schoolProgram.subtitle')}
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">{t('schoolProgram.feature1Title')}</p>
                    <p className="text-sm text-muted-foreground">{t('schoolProgram.feature1Description')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">{t('schoolProgram.feature2Title')}</p>
                    <p className="text-sm text-muted-foreground">{t('schoolProgram.feature2Description')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">{t('schoolProgram.feature3Title')}</p>
                    <p className="text-sm text-muted-foreground">{t('schoolProgram.feature3Description')}</p>
                  </div>
                </div>
              </div>
              <div className="pt-4 flex flex-col sm:flex-row gap-3 sm:gap-3">
                <Link href="/program/apply" className="w-full sm:w-auto">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                    {t('schoolProgram.applyNow')}
                    <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                  </Button>
                </Link>
                <Link href="/program" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="border-border hover:bg-secondary w-full sm:w-auto">
                    {t('schoolProgram.learnMore')}
                  </Button>
                </Link>
              </div>
            </div>
            
            <Card className="border-2 border-primary/20 bg-card shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">{t('schoolProgram.eligibilityTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">{t('schoolProgram.qualifyingTitle')}</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
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
                
                <div className="bg-primary/5 rounded-lg p-4">
                  <p className="text-sm font-medium text-foreground mb-2">
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
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6 px-4">
              {t('futureDevelopments.title')}
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground px-4">
              {t('futureDevelopments.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="border border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{t('futureDevelopments.cas.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {t('futureDevelopments.cas.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{t('futureDevelopments.features.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {t('futureDevelopments.features.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{t('futureDevelopments.launch.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {t('futureDevelopments.launch.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight px-4">
            {t('cta.title')}
            </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 sm:mb-10 md:mb-12 px-4">
            {t('cta.subtitle')}
            </p>
            
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 md:px-10 h-12 sm:h-14 text-sm sm:text-base font-medium w-full sm:w-auto"
              onClick={() => setShowEarlyAccess(true)}
            >
              {t('cta.requestAccess')}
              <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-border hover:bg-secondary px-6 sm:px-8 md:px-10 h-12 sm:h-14 text-sm sm:text-base font-medium w-full sm:w-auto">
              {t('cta.partnerWithUs')}
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-8">
            {t('cta.tagline')}
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
      
      <EarlyAccessModal open={showEarlyAccess} onOpenChange={setShowEarlyAccess} />
    </div>
  );
}