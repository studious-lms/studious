"use client";

import { useState, useEffect } from "react";
import { PageLayout } from "@/components/ui/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { ArrowUp, ChevronRight } from "lucide-react";
import { NavbarPopup } from "@/components/marketing/NavbarPopup";

export default function PrivacyPolicy() {
    const t = useTranslations('marketing.privacyPolicy');
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const sections = [
        'introduction',
        'informationWeCollect',
        'howWeUseInformation',
        'informationSharing',
        'dataSecurity',
        'dataRetention',
        'yourRights',
        'childrenPrivacy',
        'internationalTransfers',
        'changesToPolicy',
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

            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-4xl">
                    {/* Privacy Policy Content */}
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
                                {/* Introduction */}
                                <section id="introduction" className="mb-10 sm:mb-12 scroll-mt-8">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-foreground border-b pb-2">{t('sections.introduction.title')}</h2>
                                    <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">{t('sections.introduction.content')}</p>
                                </section>

                                {/* Information We Collect */}
                                <section id="informationWeCollect" className="mb-10 sm:mb-12 scroll-mt-8">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-foreground border-b pb-2">{t('sections.informationWeCollect.title')}</h2>
                                    <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">{t('sections.informationWeCollect.content')}</p>
                                </section>

                                {/* How We Use Information */}
                                <section id="howWeUseInformation" className="mb-10 sm:mb-12 scroll-mt-8">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-foreground border-b pb-2">{t('sections.howWeUseInformation.title')}</h2>
                                    <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">{t('sections.howWeUseInformation.content')}</p>
                                </section>

                                {/* Information Sharing */}
                                <section id="informationSharing" className="mb-10 sm:mb-12 scroll-mt-8">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-foreground border-b pb-2">{t('sections.informationSharing.title')}</h2>
                                    <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">{t('sections.informationSharing.content')}</p>
                                </section>

                                {/* Data Security */}
                                <section id="dataSecurity" className="mb-10 sm:mb-12 scroll-mt-8">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-foreground border-b pb-2">{t('sections.dataSecurity.title')}</h2>
                                    <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">{t('sections.dataSecurity.content')}</p>
                                </section>

                                {/* Data Retention */}
                                <section id="dataRetention" className="mb-10 sm:mb-12 scroll-mt-8">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-foreground border-b pb-2">{t('sections.dataRetention.title')}</h2>
                                    <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">{t('sections.dataRetention.content')}</p>
                                </section>

                                {/* Your Rights */}
                                <section id="yourRights" className="mb-10 sm:mb-12 scroll-mt-8">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-foreground border-b pb-2">{t('sections.yourRights.title')}</h2>
                                    <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">{t('sections.yourRights.content')}</p>
                                </section>

                                {/* Children's Privacy */}
                                <section id="childrenPrivacy" className="mb-10 sm:mb-12 scroll-mt-8">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-foreground border-b pb-2">{t('sections.childrenPrivacy.title')}</h2>
                                    <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">{t('sections.childrenPrivacy.content')}</p>
                                </section>

                                {/* International Transfers */}
                                <section id="internationalTransfers" className="mb-10 sm:mb-12 scroll-mt-8">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-foreground border-b pb-2">{t('sections.internationalTransfers.title')}</h2>
                                    <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">{t('sections.internationalTransfers.content')}</p>
                                </section>

                                {/* Changes to Policy */}
                                <section id="changesToPolicy" className="mb-10 sm:mb-12 scroll-mt-8">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-foreground border-b pb-2">{t('sections.changesToPolicy.title')}</h2>
                                    <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">{t('sections.changesToPolicy.content')}</p>
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
                    aria-label={t('backToTop')}
                    title={t('backToTop')}
                >
                    <ArrowUp className="w-5 h-5" />
                </button>
            )}
        </PageLayout>
    );
}
