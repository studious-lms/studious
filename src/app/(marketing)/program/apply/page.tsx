"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, ArrowLeft, CheckCircle } from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Footer } from "@/components/marketing/Footer";
import { useTranslations } from "next-intl";

export default function ApplyPage() {
  const t = useTranslations('apply');
  const [formData, setFormData] = useState({
    schoolName: "",
    schoolType: "",
    address: "",
    city: "",
    country: "",
    numberOfStudents: "",
    numberOfTeachers: "",
    website: "",
    contactName: "",
    contactRole: "",
    contactEmail: "",
    contactPhone: "",
    qualification: "",
    howHelp: "",
    additional: ""
  });
  
  const [applicationId, setApplicationId] = useState<string | null>(null);

  const createApplication = trpc.marketing.createSchoolDevelopementProgram.useMutation({
    onSuccess: (data) => {
      setApplicationId(data.id);
      toast.success(t('toasts.submitted'));
    },
    onError: (error) => {
      toast.error(t('errors.submitFailed', { message: error.message }));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createApplication.mutate({
      name: formData.schoolName,
      type: formData.schoolType,
      address: formData.address,
      city: formData.city,
      country: formData.country,
      numberOfStudents: parseInt(formData.numberOfStudents) || 0,
      numberOfTeachers: parseInt(formData.numberOfTeachers) || 0,
      website: formData.website || undefined,
      contactName: formData.contactName || undefined,
      contactRole: formData.contactRole || undefined,
      contactEmail: formData.contactEmail || undefined,
      contactPhone: formData.contactPhone || undefined,
      eligibilityInformation: formData.qualification || undefined,
      whyHelp: formData.howHelp || undefined,
      additionalInformation: formData.additional || undefined,
    });
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Show success screen after submission
  if (applicationId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6">
          <div className="container mx-auto max-w-2xl text-center">
            <div className="mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-4">
                {t('success.title')}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 px-4">
                {t('success.subtitle')}
              </p>
            </div>

            <Card className="border border-border shadow-lg">
              <CardContent className="pt-6 sm:pt-8 pb-6 sm:pb-8 space-y-4 sm:space-y-6">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">{t('success.applicationId')}</p>
                  <div className="bg-secondary/50 rounded-lg p-3 sm:p-4">
                    <p className="text-xl sm:text-2xl font-mono font-bold text-primary break-all">{applicationId}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('success.saveId')}
                  </p>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-left">
                  <h3 className="font-semibold text-foreground mb-2">{t('success.nextSteps.title')}</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{t('success.nextSteps.item1', { email: formData.contactEmail })}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{t('success.nextSteps.item2')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{t('success.nextSteps.item3')}</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Link href="/program" className="flex-1">
                    <Button variant="outline" className="w-full">
                      {t('success.backToProgram')}
                    </Button>
                  </Link>
                  <Link href="/" className="flex-1">
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      {t('success.returnHome')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 sm:pt-28 md:pt-32 pb-8 sm:pb-10 md:pb-12 px-4 sm:px-6 bg-gradient-to-b from-background via-secondary/30 to-background">
        <div className="container mx-auto max-w-5xl">
          <Link href="/program" className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 sm:mb-6">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            Back to Program Overview
          </Link>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4 px-4">
            Apply to the School Development Program
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground px-4">
            Complete the form below to apply for free access to Studious LMS. We review all applications within 5-7 business days.
          </p>
        </div>
      </section>

      {/* Application Form */}
      <section className="pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl">
          <Card className="border border-border shadow-lg">
            <CardContent className="pt-6 sm:pt-8 pb-6 sm:pb-8">
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                {/* School Information */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground border-b border-border pb-2 sm:pb-3">
                    School Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="school-name">School Name *</Label>
                      <Input 
                        id="school-name" 
                        placeholder="Enter your school name" 
                        value={formData.schoolName}
                        onChange={(e) => updateField('schoolName', e.target.value)}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="school-type">School Type *</Label>
                      <Input 
                        id="school-type" 
                        placeholder="e.g., Public, Non-profit, etc." 
                        value={formData.schoolType}
                        onChange={(e) => updateField('schoolType', e.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">School Address *</Label>
                    <Input 
                      id="address" 
                      placeholder="Full address" 
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      required 
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input 
                        id="city" 
                        placeholder="City" 
                        value={formData.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Input 
                        id="country" 
                        placeholder="Country" 
                        value={formData.country}
                        onChange={(e) => updateField('country', e.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="students">Number of Students *</Label>
                      <Input 
                        id="students" 
                        type="number" 
                        placeholder="e.g., 500" 
                        value={formData.numberOfStudents}
                        onChange={(e) => updateField('numberOfStudents', e.target.value)}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teachers">Number of Teachers *</Label>
                      <Input 
                        id="teachers" 
                        type="number" 
                        placeholder="e.g., 25" 
                        value={formData.numberOfTeachers}
                        onChange={(e) => updateField('numberOfTeachers', e.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">School Website (if available)</Label>
                    <Input 
                      id="website" 
                      type="url" 
                      placeholder="https://yourschool.edu" 
                      value={formData.website}
                      onChange={(e) => updateField('website', e.target.value)}
                    />
                  </div>
                </div>

                {/* Contact Person */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground border-b border-border pb-2 sm:pb-3">
                    Contact Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name">Full Name *</Label>
                      <Input 
                        id="contact-name" 
                        placeholder="Your full name" 
                        value={formData.contactName}
                        onChange={(e) => updateField('contactName', e.target.value)}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Your Role *</Label>
                      <Input 
                        id="role" 
                        placeholder="e.g., Principal, Administrator" 
                        value={formData.contactRole}
                        onChange={(e) => updateField('contactRole', e.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="you@school.edu" 
                        value={formData.contactEmail}
                        onChange={(e) => updateField('contactEmail', e.target.value)}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="+1 (555) 123-4567" 
                        value={formData.contactPhone}
                        onChange={(e) => updateField('contactPhone', e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                </div>

                {/* Eligibility Information */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground border-b border-border pb-2 sm:pb-3">
                    Eligibility Information
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="qualification" className="text-sm sm:text-base">Why does your school qualify for this program? *</Label>
                    <Textarea 
                      id="qualification" 
                      placeholder="Please describe your school's situation (e.g., Title I status, non-profit status, economic challenges, location in underserved area, etc.)"
                      className="min-h-[120px] sm:min-h-[140px] text-sm sm:text-base"
                      value={formData.qualification}
                      onChange={(e) => updateField('qualification', e.target.value)}
                      required 
                    />
                    <p className="text-xs text-muted-foreground">
                      Please be as specific as possible about your school's financial situation and why you need support.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="how-help" className="text-sm sm:text-base">How would Studious help your school and students? *</Label>
                    <Textarea 
                      id="how-help" 
                      placeholder="Tell us about your current challenges and how you plan to use Studious to improve education at your school"
                      className="min-h-[120px] sm:min-h-[140px] text-sm sm:text-base"
                      value={formData.howHelp}
                      onChange={(e) => updateField('howHelp', e.target.value)}
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documentation">Supporting Documentation</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload relevant documentation (e.g., non-profit certificate, Title I status, financial statements, official school documents)
                    </p>
                    <Input id="documentation" type="file" accept=".pdf,.doc,.docx" className="cursor-pointer" />
                    <p className="text-xs text-muted-foreground">
                      Note: File upload will be available soon. For now, you can email documents to impact@studious.sh
                    </p>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground border-b border-border pb-2 sm:pb-3">
                    Additional Information
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="additional" className="text-sm sm:text-base">Anything else we should know?</Label>
                    <Textarea 
                      id="additional" 
                      placeholder="Share any additional context about your school, students, or application"
                      className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                      value={formData.additional}
                      onChange={(e) => updateField('additional', e.target.value)}
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 sm:h-auto"
                    disabled={createApplication.isPending}
                  >
                    {createApplication.isPending ? "Submitting..." : "Submit Application"}
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4 text-center px-2">
                    By submitting this form, you agree to our application review process. We'll respond within 5-7 business days.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Help Section */}
          <div className="mt-8 sm:mt-10 md:mt-12 text-center px-4">
            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
              Need help with your application?
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Email us at <a href="mailto:impact@studious.sh" className="text-primary hover:underline font-medium">impact@studious.sh</a>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

