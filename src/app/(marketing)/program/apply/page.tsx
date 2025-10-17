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

export default function ApplyPage() {
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
      toast.success("Application submitted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to submit application: " + error.message);
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
        
        <section className="pt-32 pb-20 px-6">
          <div className="container mx-auto max-w-2xl text-center">
            <div className="mb-8">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Application Submitted!
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Thank you for applying to the Studious School Development Program
              </p>
            </div>

            <Card className="border border-border shadow-lg">
              <CardContent className="pt-8 pb-8 space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Your Application ID</p>
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <p className="text-2xl font-mono font-bold text-primary">{applicationId}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Save this ID to check your application status
                  </p>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-left">
                  <h3 className="font-semibold text-foreground mb-2">What Happens Next?</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>You'll receive a confirmation email at {formData.contactEmail}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Our team will review your application within 5-7 business days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>We'll notify you via email once a decision is made</span>
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3 pt-4">
                  <Link href="/program" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Back to Program
                    </Button>
                  </Link>
                  <Link href="/" className="flex-1">
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      Return Home
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
      <section className="pt-32 pb-12 px-6 bg-gradient-to-b from-background via-secondary/30 to-background">
        <div className="container mx-auto max-w-5xl">
          <Link href="/program" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Program Overview
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Apply to the School Development Program
          </h1>
          <p className="text-lg text-muted-foreground">
            Complete the form below to apply for free access to Studious LMS. We review all applications within 5-7 business days.
          </p>
        </div>
      </section>

      {/* Application Form */}
      <section className="pb-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <Card className="border border-border shadow-lg">
            <CardContent className="pt-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* School Information */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-foreground border-b border-border pb-3">
                    School Information
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
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
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-foreground border-b border-border pb-3">
                    Contact Information
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
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
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-foreground border-b border-border pb-3">
                    Eligibility Information
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="qualification">Why does your school qualify for this program? *</Label>
                    <Textarea 
                      id="qualification" 
                      placeholder="Please describe your school's situation (e.g., Title I status, non-profit status, economic challenges, location in underserved area, etc.)"
                      className="min-h-[140px]"
                      value={formData.qualification}
                      onChange={(e) => updateField('qualification', e.target.value)}
                      required 
                    />
                    <p className="text-xs text-muted-foreground">
                      Please be as specific as possible about your school's financial situation and why you need support.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="how-help">How would Studious help your school and students? *</Label>
                    <Textarea 
                      id="how-help" 
                      placeholder="Tell us about your current challenges and how you plan to use Studious to improve education at your school"
                      className="min-h-[140px]"
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
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-foreground border-b border-border pb-3">
                    Additional Information
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="additional">Anything else we should know?</Label>
                    <Textarea 
                      id="additional" 
                      placeholder="Share any additional context about your school, students, or application"
                      className="min-h-[100px]"
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
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={createApplication.isPending}
                  >
                    {createApplication.isPending ? "Submitting..." : "Submit Application"}
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    By submitting this form, you agree to our application review process. We'll respond within 5-7 business days.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Help Section */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Need help with your application?
            </p>
            <p className="text-sm text-muted-foreground">
              Email us at <a href="mailto:impact@studious.sh" className="text-primary hover:underline font-medium">impact@studious.sh</a>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-secondary border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Studious" className="w-7 h-7" />
                <span className="text-xl font-semibold text-foreground">Studious</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Modern learning management for the next generation of education.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="/program" className="text-sm text-muted-foreground hover:text-foreground transition-colors">School Program</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/#team" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Team</Link></li>
                <li><Link href="/press" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Press</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Contact</h3>
              <ul className="space-y-2">
                <li><a href="mailto:hello@studious.sh" className="text-sm text-muted-foreground hover:text-foreground transition-colors">hello@studious.sh</a></li>
                <li><a href="mailto:press@studious.sh" className="text-sm text-muted-foreground hover:text-foreground transition-colors">press@studious.sh</a></li>
                <li><a href="mailto:impact@studious.sh" className="text-sm text-muted-foreground hover:text-foreground transition-colors">impact@studious.sh</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Studious LMS. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

