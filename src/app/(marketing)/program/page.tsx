"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle2,
  ArrowRight,
  Users,
  Heart,
  Send,
  Search,
  Clock,
  FileCheck,
  XCircle
} from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Footer } from "@/components/marketing/Footer";
import { useTranslations } from "next-intl";

export default function ProgramPage() {
  const t = useTranslations('program');
  const [searchId, setSearchId] = useState("");
  const [shouldSearch, setShouldSearch] = useState(false);

  // tRPC query for searching application
  const { data: application, isLoading, error } = trpc.marketing.searchSchoolDevelopementPrograms.useQuery(
    { id: searchId },
    { 
      enabled: shouldSearch && searchId.trim().length > 0,
      retry: false
    }
  );

  const handleCheckStatus = () => {
    if (searchId.trim()) {
      setShouldSearch(true);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "UNDER_REVIEW":
        return <Badge variant="outline" className="border-yellow-500/50 text-yellow-600 bg-yellow-50"><Clock className="h-3 w-3 mr-1" />Under Review</Badge>;
      case "APPROVED":
        return <Badge variant="outline" className="border-green-500/50 text-green-600 bg-green-50"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      case "PENDING":
        return <Badge variant="outline" className="border-blue-500/50 text-blue-600 bg-blue-50"><FileCheck className="h-3 w-3 mr-1" />Pending</Badge>;
      case "REJECTED":
        return <Badge variant="outline" className="border-red-500/50 text-red-600 bg-red-50"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Submitted</Badge>;
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section with Background Image */}
      <section className="pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 md:pb-24 px-4 sm:px-6 relative overflow-hidden">
        {/* Background Image - Cropped to show middle section */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <img 
            src="/marketing/school-program.png" 
            alt="Students and teacher in classroom" 
            className="w-full h-full object-cover object-center"
            style={{ objectPosition: 'center 40%' }}
          />
        </div>
        
        <div className="container mx-auto max-w-4xl text-center relative z-20">
          <Badge variant="outline" className="mb-4 sm:mb-6 px-3 sm:px-4 py-1 sm:py-1.5 border-white/30 text-white bg-white/10 backdrop-blur-sm text-sm">
            {t('hero.badge')}
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 tracking-tight leading-tight drop-shadow-lg px-4">
            {t('hero.title')}
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-md px-4">
            {t('hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Program Commitment */}
      <section className="py-10 sm:py-12 md:py-16 px-4 sm:px-6 bg-secondary/30">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">10%</div>
              <p className="text-sm sm:text-base text-muted-foreground">{t('commitment.revenue')}</p>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">Nov-Dec 2025</div>
              <p className="text-sm sm:text-base text-muted-foreground">{t('commitment.cohort')}</p>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">100%</div>
              <p className="text-sm sm:text-base text-muted-foreground">{t('commitment.free')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* About the Program */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-base sm:prose-lg max-w-none">
            <div className="space-y-6 sm:space-y-8 text-muted-foreground text-base sm:text-lg leading-relaxed">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">{t('about.mission.title')}</h2>
                <p>
                  {t('about.mission.body1')}
                </p>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">{t('about.aims.title')}</h2>
                <p>
                  {t('about.aims.body1')}
                </p>
                <p className="mt-4">
                  {t('about.aims.body2')}
                </p>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">{t('about.receive.title')}</h2>
                <p>
                  {t('about.receive.body1')}
                </p>
                <p className="mt-4">
                  {t('about.receive.body2')}
                </p>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">{t('about.qualifies.title')}</h2>
                <p>
                  {t('about.qualifies.body1')}
                </p>
                <p className="mt-4">
                  {t('about.qualifies.body2')}
                </p>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">{t('about.impact.title')}</h2>
                <p>
                  {t('about.impact.body1')}
                </p>
                <p className="mt-4">
                  {t('about.impact.body2')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application CTA & Status Checker */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-secondary/30">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Apply Card */}
            <div>
            <Card className="border border-border shadow-lg bg-background h-full">
              <CardHeader>
                <CardTitle className="text-2xl">{t('cta.apply.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {t('cta.apply.description')}
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t('cta.apply.item1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t('cta.apply.item2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t('cta.apply.item3')}</span>
                  </li>
                </ul>
                <Link href="/program/apply" className="block pt-4">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    {t('cta.apply.button')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
            </div>

            {/* Status Checker Card */}
            <Card className="border border-border shadow-lg bg-background">
              <CardHeader>
                <CardTitle className="text-2xl">{t('status.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {t('status.description')}
                </p>
                <div className="space-y-3">
                  <Label htmlFor="application-id">{t('status.inputLabel')}</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="application-id" 
                      placeholder={t('status.placeholder')} 
                      className="flex-1"
                      value={searchId}
                      onChange={(e) => {
                        setSearchId(e.target.value);
                        setShouldSearch(false); // Reset search when typing
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleCheckStatus()}
                    />
                    <Button 
                      variant="outline" 
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={handleCheckStatus}
                      disabled={isLoading}
                    >
                      {isLoading ? <Clock className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('status.help')}
                  </p>
                </div>

                {/* Search Results */}
                {shouldSearch && (
                  <div className="mt-6 pt-6 border-t border-border">
                    {isLoading ? (
                      <div className="text-center py-4">
                        <Clock className="h-8 w-8 text-primary mx-auto mb-2 animate-spin" />
                        <p className="text-sm text-muted-foreground">Searching...</p>
                      </div>
                    ) : application ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-foreground">{t('status.results.found')}</h4>
                          {getStatusBadge(application.status || "PENDING")}
                        </div>
                        
                        <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('status.results.school')}</span>
                            <span className="font-medium text-foreground">{application.name}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('status.results.location')}</span>
                            <span className="font-medium text-foreground">{application.city}, {application.country}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('status.results.submitted')}</span>
                            <span className="font-medium text-foreground">
                              {new Date(application.submittedAt || "").toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('status.results.contact')}</span>
                            <span className="font-medium text-foreground">{application.contactEmail}</span>
                          </div>
                        </div>

                        {application.status === "APPROVED" && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm text-green-800 font-medium mb-2">
                              {t('status.cards.approved.title')}
                            </p>
                            <p className="text-sm text-green-700">
                              {t('status.cards.approved.body')}
                            </p>
                          </div>
                        )}

                        {application.status === "UNDER_REVIEW" && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-sm text-yellow-800 font-medium mb-2">
                              {t('status.cards.underReview.title')}
                            </p>
                            <p className="text-sm text-yellow-700">
                              {t('status.cards.underReview.body')}
                            </p>
                          </div>
                        )}

                        {(!application.status || application.status === "PENDING") && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800 font-medium mb-2">
                              {t('status.cards.pending.title')}
                            </p>
                            <p className="text-sm text-blue-700">
                              {t('status.cards.pending.body')}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">{t('status.results.notFound.title')}</p>
                          <p className="text-sm text-muted-foreground">{t('status.results.notFound.body')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4 px-4">
            {t('contact.title')}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 px-4">
            {t('contact.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <a href="mailto:impact@studious.sh" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="border-border hover:bg-secondary w-full sm:w-auto">
                {t('contact.button')}
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      {Footer()}
    </div>
  );
}

