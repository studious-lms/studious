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
import { Footer } from "@/components/marketing/Footer";
import { useTranslations } from "next-intl"

export default function PricingPage() {
  const [showEarlyAccess, setShowEarlyAccess] = useState(false);
  const t = useTranslations('pricing');
  const tMarketing = useTranslations('marketing');


  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-14 md:pb-16 px-4 sm:px-6 bg-gradient-to-b from-background via-secondary/30 to-background">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge variant="outline" className="mb-4 sm:mb-6 px-3 sm:px-4 py-1 sm:py-1.5 border-primary/20 text-primary text-sm">
            {t('pricingStatement1')}
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 tracking-tight px-4">
            {t('pricingStatement2')}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            {t('pricingStatement3')}
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-8 sm:py-10 md:py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <Card className="border-2 border-border hover:border-primary/50 transition-all flex flex-col h-full">
              <CardHeader className="space-y-4">
                <CardTitle className="text-2xl">{t('pricingStarterTitle')}</CardTitle>
                <div>
                  <div className="text-5xl font-bold text-foreground">{t('pricingStarterPrice')}</div>
                  <p className="text-sm text-muted-foreground mt-2">{t('pricingStarterNote')}</p>
          </div>
                <p className="text-muted-foreground">
                  {t('pricingStarterDescription')}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 space-y-6">
                <ul className="space-y-3 flex-1">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricingStarterPerk1')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricingStarterPerk2')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricingStarterPerk3')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricingStarterPerk4')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricingStarterPerk5')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricingStarterPerk6')}</span>
                  </li>
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full mt-auto"
                  onClick={() => setShowEarlyAccess(true)}
                >
                  {t('pricingStarterLink')}
                </Button>
              </CardContent>
            </Card>

            {/* School Plan - Featured */}
            <Card className="border-2 border-primary shadow-2xl relative md:scale-105 flex flex-col h-full">
              <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm">
                  {t('mostPopular')}
                </Badge>
              </div>
              <CardHeader className="space-y-4">
                <CardTitle className="text-2xl">{t('pricingSchoolTitle')}</CardTitle>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-foreground">$5</span>
                    <span className="text-muted-foreground">{t('priceUnit')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{t('pricingSchoolPriceNote')}</p>
                </div>
                <p className="text-muted-foreground">
                  {t('pricingSchoolNote')}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 space-y-6">
                <ul className="space-y-3 flex-1">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricingSchoolPerk1')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricingSchoolPerk2')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricingSchoolPerk3')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricingSchoolPerk4')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricingSchoolPerk5')}</span>
                  </li>
                  {/* <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricingSchoolPerk6')}</span>
                  </li> */}
                </ul>
                <Button 
                  className="w-full mt-auto bg-primary hover:bg-primary/90"
                  onClick={() => setShowEarlyAccess(true)}
                >
                  {t('pricingSchoolLink')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Institution Plan */}
            <Card className="border-2 border-border hover:border-primary/50 transition-all flex flex-col h-full">
              <CardHeader className="space-y-4">
                <CardTitle className="text-2xl">{t('pricingInstitutionTitle')}</CardTitle>
                <div>
                  <div className="text-5xl font-bold text-foreground">{t('pricingInstitutionPrice')}</div>
                  <p className="text-sm text-muted-foreground mt-2">{t('pricingInstitutionNote')}</p>
                </div>
                <p className="text-muted-foreground">
                  {t('pricingInstitutionDescription')}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 space-y-6">
                <ul className="space-y-3 flex-1">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricingInstitutionPerk1')}</span>
                  </li>
                  {/* <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Custom integrations (SIS, LTI, SSO)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Dedicated account manager</span>
                  </li> */}
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricingInstitutionPerk2')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricingInstitutionPerk3')}</span>
                  </li>
                  {/* <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">On-premise deployment option</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">99.9% uptime SLA</span>
                  </li> */}
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricingInstitutionPerk4')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('pricingInstitutionPerk5')}</span>
                    </li>
                </ul>
                <Button variant="outline" className="w-full mt-auto" onClick={() => setShowEarlyAccess(true)}>
                  {t('pricingInstitutionLink')}
                </Button>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-muted-foreground mt-8 sm:mt-10 md:mt-12 text-base sm:text-lg px-4" dangerouslySetInnerHTML={{ __html: t('earlyBird') }} />
        </div>
      </section>

      {/* School Development Program */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-br from-primary/5 via-background to-primary/5 border-y border-primary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6">
              <Badge variant="outline" className="border-primary/30 text-primary text-sm sm:text-base">
                {tMarketing('schoolProgram.badge')}
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                {tMarketing('schoolProgram.title')}
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
                {tMarketing('schoolProgram.subtitle')}
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">{tMarketing('schoolProgram.feature1Title')}</p>
                    <p className="text-sm text-muted-foreground">{tMarketing('schoolProgram.feature1Description')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">{tMarketing('schoolProgram.feature2Title')}</p>
                    <p className="text-sm text-muted-foreground">{tMarketing('schoolProgram.feature2Description')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">{tMarketing('schoolProgram.feature3Title')}</p>
                    <p className="text-sm text-muted-foreground">{tMarketing('schoolProgram.feature3Description')}</p>
                  </div>
                </div>
              </div>
              <div className="pt-4 flex flex-col sm:flex-row gap-3 sm:gap-3">
                <Link href="/program/apply" className="w-full sm:w-auto">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                    {tMarketing('schoolProgram.applyNow')}
                    <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                  </Button>
                </Link>
                <Link href="/program" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="border-border hover:bg-secondary w-full sm:w-auto">
                    {tMarketing('schoolProgram.learnMore')}
                  </Button>
                </Link>
              </div>
            </div>
            
            <Card className="border-2 border-primary/20 bg-card shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">{tMarketing('schoolProgram.eligibilityTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">{tMarketing('schoolProgram.qualifyingTitle')}</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{tMarketing('schoolProgram.qualify1')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{tMarketing('schoolProgram.qualify2')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{tMarketing('schoolProgram.qualify3')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{tMarketing('schoolProgram.qualify4')}</span>
                    </li>
                  </ul>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">{tMarketing('schoolProgram.commitmentTitle')}</strong> {tMarketing('schoolProgram.commitment')}
                  </p>
                </div>
                
                <div className="bg-primary/5 rounded-lg p-4">
                  <p className="text-sm font-medium text-foreground mb-2">
                    {tMarketing('schoolProgram.launchTitle')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {tMarketing('schoolProgram.launch')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Included in All Plans */}
      {/* <section className="py-20 px-6 bg-secondary/30">
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
      </section> */}

      {/* FAQ Section */}
      {/* <section className="py-20 px-6 bg-background">
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
      </section> */}

      {/* Footer */}
      <Footer />
      
      <EarlyAccessModal open={showEarlyAccess} onOpenChange={setShowEarlyAccess} />
    </div>
  );
}
