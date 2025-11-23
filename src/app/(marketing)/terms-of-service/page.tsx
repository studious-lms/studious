"use client";

import { useState, useEffect } from "react";
import { PageLayout } from "@/components/ui/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { ArrowUp, ChevronRight } from "lucide-react";
import { NavbarPopup } from "@/components/marketing/NavbarPopup";

export default function TermsOfService() {
    const t = useTranslations('marketing.termsOfService');
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const sections = [
        'acceptance',
        'descriptionOfService',
        'userAccounts',
        'acceptableUse',
        'educationalContent',
        'aiFeatures',
        'privacy',
        'feesAndPayment',
        'termination',
        'disclaimers',
        'limitationOfLiability',
        'indemnification',
        'governingLaw',
        'changesToTerms',
        'contactUs'
    ];

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <PageLayout className="min-h-screen bg-background">
            {/* Navigation Bar - Full Width at Top */}
            <div className="w-full px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-4">
                <NavbarPopup />
            </div>

            <div className="w-full py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-4xl">
                    {/* Title */}
                    <div id="top" className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12">
                        <div className="space-y-2">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">{t('title')}</h1>
                        </div>
                    </div>

                    {/* Terms of Service Content */}
                    <Card className="p-6 sm:p-8 md:p-10 shadow-sm">
                        <CardHeader className="pb-6 sm:pb-8 border-b">
                            <CardTitle className="text-xl sm:text-2xl md:text-3xl mb-2">{t('title')}</CardTitle>
                            <p className="text-sm text-muted-foreground">{t('lastUpdated')}</p>
                        </CardHeader>
                        <CardContent className="space-y-6 sm:space-y-8 pt-6 sm:pt-8">
                            {/* Table of Contents */}
                            <div className="bg-muted/50 rounded-lg p-4 sm:p-6 mb-8 border">
                                <h2 className="text-base sm:text-lg font-semibold mb-4">{t('tableOfContents')}</h2>
                                <nav className="space-y-2">
                                    {sections.map((section, index) => (
                                        <button
                                            key={section}
                                            onClick={() => scrollToSection(section)}
                                            className="w-full text-left flex items-center gap-2 text-sm sm:text-base text-foreground hover:text-primary transition-colors py-2 px-2 rounded-md hover:bg-muted/50"
                                        >
                                            <span className="text-muted-foreground font-mono text-xs">{String(index + 1).padStart(2, '0')}</span>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                            <span>{t(`sections.${section}.title`)}</span>
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            <div className="prose prose-sm sm:prose-base max-w-none">
                                {/* Acceptance of Terms */}
                                <section id="acceptance" className="mb-10 sm:mb-12 scroll-mt-8">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-foreground border-b pb-2">{t('sections.acceptance.title')}</h2>
                                    <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">{t('sections.acceptance.content')}</p>
                                </section>

                                {/* Description of Service */}
                                <section id="descriptionOfService" className="mb-10 sm:mb-12 scroll-mt-8">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-foreground border-b pb-2">{t('sections.descriptionOfService.title')}</h2>
                                    <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">{t('sections.descriptionOfService.content')}</p>
                                </section>

                                {/* User Accounts */}
                                <section id="userAccounts" className="mb-10 sm:mb-12 scroll-mt-8">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-foreground border-b pb-2">{t('sections.userAccounts.title')}</h2>
                                    <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">{t('sections.userAccounts.content')}</p>
                                </section>

                                {/* Acceptable Use */}
                                <section id="acceptableUse" className="mb-10 sm:mb-12 scroll-mt-8">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-foreground border-b pb-2">{t('sections.acceptableUse.title')}</h2>
                                    <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">{t('sections.acceptableUse.content')}</p>
                                </section>

                                {/* Educational Content */}
                                <section id="educationalContent" className="mb-10 sm:mb-12 scroll-mt-8">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-foreground border-b pb-2">{t('sections.educationalContent.title')}</h2>
                                    <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">{t('sections.educationalContent.content')}</p>
                                </section>

                                {/* AI Features */}
                                <section id="aiFeatures" className="mb-10 sm:mb-12 scroll-mt-8">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-foreground border-b pb-2">{t('sections.aiFeatures.title')}</h2>
                                    <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">{t('sections.aiFeatures.content')}</p>
                                </section>

                                {/* Privacy */}
                                <section id="privacy" className="mb-10 sm:mb-12 scroll-mt-8">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-foreground border-b pb-2">{t('sections.privacy.title')}</h2>
                                    <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">{t('sections.privacy.content')}</p>
                                </section>

                                {/* Fees and Payment */}
                                <section id="feesAndPayment" className="mb-10 sm:mb-12 scroll-mt-8">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-foreground border-b pb-2">{t('sections.feesAndPayment.title')}</h2>
                                    <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">{t('sections.feesAndPayment.content')}</p>
                                </section>

                                {/* Termination */}
                                <section id="termination" className="mb-10 sm:mb-12 scroll-mt-8">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-foreground border-b pb-2">{t('sections.termination.title')}</h2>
                                    <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">{t('sections.termination.content')}</p>
                                </section>

                                {/* Disclaimers */}
                                <section id="disclaimers" className="mb-10 sm:mb-12 scroll-mt-8">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-foreground border-b pb-2">{t('sections.disclaimers.title')}</h2>
                                    <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">{t('sections.disclaimers.content')}</p>
                                </section>

                                {/* Limitation of Liability */}
                                <section id="limitationOfLiability" className="mb-10 sm:mb-12 scroll-mt-8">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-foreground border-b pb-2">{t('sections.limitationOfLiability.title')}</h2>
                                    <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">{t('sections.limitationOfLiability.content')}</p>
                                </section>

                                {/* Indemnification */}
                                <section id="indemnification" className="mb-10 sm:mb-12 scroll-mt-8">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-foreground border-b pb-2">{t('sections.indemnification.title')}</h2>
                                    <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">{t('sections.indemnification.content')}</p>
                                </section>

                                {/* Governing Law */}
                                <section id="governingLaw" className="mb-10 sm:mb-12 scroll-mt-8">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-foreground border-b pb-2">{t('sections.governingLaw.title')}</h2>
                                    <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">{t('sections.governingLaw.content')}</p>
                                </section>

                                {/* Changes to Terms */}
                                <section id="changesToTerms" className="mb-10 sm:mb-12 scroll-mt-8">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-foreground border-b pb-2">{t('sections.changesToTerms.title')}</h2>
                                    <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">{t('sections.changesToTerms.content')}</p>
                                </section>

                                {/* Contact Us */}
                                <section id="contactUs" className="mb-10 sm:mb-12 scroll-mt-8">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-foreground border-b pb-2">{t('sections.contactUs.title')}</h2>
                                    <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">{t('sections.contactUs.content')}</p>
                                </section>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Floating Back to Top Button */}
            {showBackToTop && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:bottom-8 bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110 z-50"
                    aria-label="Back to top"
                >
                    <ArrowUp className="w-5 h-5" />
                </button>
            )}
        </PageLayout>
    );
}
