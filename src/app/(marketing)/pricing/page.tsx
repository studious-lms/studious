"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2,
  ArrowRight,
  Shield,
  Lock,
  Server,
  Headphones,
  Zap,
  Globe
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
      <section className="pt-28 sm:pt-36 md:pt-44 pb-12 sm:pb-16 px-4 sm:px-6 bg-background">
        <div className="container mx-auto max-w-3xl text-center">
          <p className="text-primary font-medium text-sm uppercase tracking-wide mb-4">
            {t('pricingStatement1')}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            {t('pricingStatement2')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {t('pricingStatement3')}
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-8 sm:py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter Plan */}
            <Card className="border border-border bg-card">
              <CardHeader className="space-y-3">
                <CardTitle className="text-lg">{t('pricingStarterTitle')}</CardTitle>
                <div>
                  <div className="text-3xl font-bold text-foreground">{t('pricingStarterPrice')}</div>
                  <p className="text-xs text-muted-foreground mt-1">{t('pricingStarterNote')}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('pricingStarterDescription')}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{t('pricingStarterPerk1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{t('pricingStarterPerk2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{t('pricingStarterPerk3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{t('pricingStarterPerk4')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{t('pricingStarterPerk5')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{t('pricingStarterPerk6')}</span>
                  </li>
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowEarlyAccess(true)}
                >
                  {t('pricingStarterLink')}
                </Button>
              </CardContent>
            </Card>

            {/* School Plan - Featured */}
            <Card className="border-2 border-primary bg-card relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground text-xs">
                  {t('mostPopular')}
                </Badge>
              </div>
              <CardHeader className="space-y-3">
                <CardTitle className="text-lg">{t('pricingSchoolTitle')}</CardTitle>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">$5</span>
                    <span className="text-muted-foreground text-sm">{t('priceUnit')}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t('pricingSchoolPriceNote')}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('pricingSchoolNote')}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{t('pricingSchoolPerk1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{t('pricingSchoolPerk2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{t('pricingSchoolPerk3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{t('pricingSchoolPerk4')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{t('pricingSchoolPerk5')}</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => setShowEarlyAccess(true)}
                >
                  {t('pricingSchoolLink')}
                </Button>
              </CardContent>
            </Card>

            {/* Institution Plan */}
            <Card className="border border-border bg-card">
              <CardHeader className="space-y-3">
                <CardTitle className="text-lg">Institution</CardTitle>
                <div>
                  <div className="text-3xl font-bold text-foreground">Custom</div>
                  <p className="text-xs text-muted-foreground mt-1">Tailored to your needs</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  For large schools & universities (1,000+ students)
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Everything in School plan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">24/7 priority support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Unlimited storage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Custom training & onboarding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Cheaper per-user expenses</span>
                  </li>
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setShowEarlyAccess(true)}
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            🎉 Early adopters receive <span className="font-medium text-foreground">3 months free</span> on annual plans + dedicated onboarding support
          </p>
        </div>
      </section>

      {/* Included in All Plans */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-secondary/30 border-y border-border">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Included in all plans
            </h2>
            <p className="text-muted-foreground">
              Enterprise-grade security and reliability
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-sm text-foreground">GDPR Compliant</h3>
                <p className="text-xs text-muted-foreground">International data protection</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-sm text-foreground">Encryption</h3>
                <p className="text-xs text-muted-foreground">Bank-level security</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Server className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-sm text-foreground">99.9% Uptime</h3>
                <p className="text-xs text-muted-foreground">Reliable infrastructure</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Headphones className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-sm text-foreground">Support</h3>
                <p className="text-xs text-muted-foreground">Email and chat available</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-sm text-foreground">22+ Languages</h3>
                <p className="text-xs text-muted-foreground">Global localization</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-sm text-foreground">Fast Performance</h3>
                <p className="text-xs text-muted-foreground">Modern infrastructure</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* School Development Program */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div>
              <p className="text-primary font-medium text-sm uppercase tracking-wide mb-3">
                {tMarketing('schoolProgram.badge')}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                {tMarketing('schoolProgram.title')}
              </h2>
              <p className="text-muted-foreground mb-6">
                {tMarketing('schoolProgram.subtitle')}
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-foreground">{tMarketing('schoolProgram.feature1Title')}</p>
                    <p className="text-xs text-muted-foreground">{tMarketing('schoolProgram.feature1Description')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-foreground">{tMarketing('schoolProgram.feature2Title')}</p>
                    <p className="text-xs text-muted-foreground">{tMarketing('schoolProgram.feature2Description')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-foreground">{tMarketing('schoolProgram.feature3Title')}</p>
                    <p className="text-xs text-muted-foreground">{tMarketing('schoolProgram.feature3Description')}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/program/apply">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    {tMarketing('schoolProgram.applyNow')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/program">
                  <Button variant="ghost" className="text-muted-foreground">
                    {tMarketing('schoolProgram.learnMore')}
                  </Button>
                </Link>
              </div>
            </div>
            
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg">{tMarketing('schoolProgram.eligibilityTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-foreground mb-2">{tMarketing('schoolProgram.qualifyingTitle')}</h4>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
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
                
                <div className="bg-secondary rounded-lg p-4">
                  <p className="text-sm font-medium text-foreground mb-1">
                    {tMarketing('schoolProgram.launchTitle')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tMarketing('schoolProgram.launch')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-secondary/30 border-y border-border">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Frequently Asked Questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="item-1" className="border border-border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-sm text-left hover:no-underline">
                Can I try Studious before committing to a paid plan?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Yes! The Starter plan is completely free and gives you access to core features. You can also start a 14-day free trial of the School plan with no credit card required.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-sm text-left hover:no-underline">
                What happens if I exceed my student limit?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                We'll notify you when you're approaching your limit. You can easily upgrade to the next tier, and we'll only charge you for the prorated difference.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-sm text-left hover:no-underline">
                Do you offer discounts for non-profit schools?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Yes! We offer 50% discounts for registered non-profit educational institutions. Contact our sales team with your documentation to apply.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border border-border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-sm text-left hover:no-underline">
                Can I cancel my subscription at any time?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Absolutely. You can cancel anytime from your account settings. Your data will remain accessible for 30 days after cancellation.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border border-border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-sm text-left hover:no-underline">
                What payment methods do you accept?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                We accept all major credit cards (Visa, Mastercard, American Express), bank transfers for annual plans, and purchase orders for Institution tier.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border border-border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-sm text-left hover:no-underline">
                Is there a setup fee or hidden costs?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                No hidden fees, ever. The price you see is what you pay. Institution tier customers may opt for paid onboarding services, but this is optional.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-3">Still have questions?</p>
            <Button variant="outline" size="sm" asChild>
              <a href="mailto:hello@studious.sh">
                Contact Support
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      
      <EarlyAccessModal open={showEarlyAccess} onOpenChange={setShowEarlyAccess} />
    </div>
  );
}
