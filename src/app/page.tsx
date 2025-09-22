"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/ui/app-layout";
import { 
  BookOpen, 
  FileText, 
  BarChart3, 
  Calendar, 
  MessageCircle, 
  Bot,
  Sparkles
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const appState = useSelector((state: RootState) => state.app);
  const router = useRouter();

  useEffect(() => {
    if (appState.user.loggedIn) {
      router.push('/home');
    }
  }, [appState.user.loggedIn, router]);
  
  return (
    <AppLayout isAuthenticated={appState.user.loggedIn}>
      <div className="min-h-screen overflow-hidden bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-background to-muted/20">
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center mb-20">
            {/* Logo with glow effect */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                <img src="/logo.png" alt="Studious Logo" className="w-20 h-20 relative z-10" />
              </div>
            </div>
            
            {/* Main headline with sparkles */}
            <div className="relative">
              <Sparkles className="absolute -top-4 -left-4 h-6 w-6 text-primary animate-pulse" />
              <Sparkles className="absolute -top-2 right-8 h-4 w-4 text-primary/60 animate-pulse delay-300" />
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-foreground mb-8 leading-tight">
                The Future of
                <br />
                <span className="text-primary">
                  Education
                </span>
                <br />
                is Here
              </h1>
            </div>
            
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
              <span className="font-semibold text-foreground">Studious</span> revolutionizes learning management with cutting-edge AI, 
              intuitive design, and powerful analytics. Transform your educational experience today.
            </p>
            
            {/* CTA Buttons with enhanced styling */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link href="/signup">
                <Button size="lg" className="px-12 py-4 text-xl font-semibold shadow-2xl hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="px-12 py-4 text-xl font-semibold border-2 hover:bg-muted/50 transition-all duration-300">
                  Sign In
                </Button>
              </Link>
            </div>
            
          </div>
          
          {/* Hero Image Placeholder */}
          <div className="relative max-w-6xl mx-auto">
            <div className="relative bg-gradient-to-r from-muted/50 to-muted/30 rounded-2xl p-8 shadow-2xl backdrop-blur-sm border">
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-12 w-12 text-primary" />
                  </div>
                  <p className="text-muted-foreground font-medium">Dashboard Preview Coming Soon</p>
                </div>
              </div>
            </div>
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-semibold">
              <Sparkles className="mr-2 h-4 w-4" />
              Powerful Features
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Everything You Need to
              <span className="block text-primary">Excel in Education</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover the comprehensive suite of tools designed to revolutionize your teaching and learning experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            <Card className="group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 transform hover:-translate-y-2 border-2 hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold">Class Management</CardTitle>
                <CardDescription className="text-base">
                  Create and organize classes with unprecedented ease
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Set up classes, manage enrollment, and organize your curriculum in one central, intuitive location with advanced organizational tools.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 transform hover:-translate-y-2 border-2 hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold">Assignment Tracking</CardTitle>
                <CardDescription className="text-base">
                  Streamline assignment creation and submission workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Create assignments, set due dates, and track student submissions with detailed rubrics and automated grading capabilities.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 transform hover:-translate-y-2 border-2 hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold">Advanced Analytics</CardTitle>
                <CardDescription className="text-base">
                  Comprehensive grading and performance insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Track student progress with AI-powered analytics, generate detailed reports, and provide data-driven feedback for optimal learning outcomes.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 transform hover:-translate-y-2 border-2 hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold">Smart Calendar</CardTitle>
                <CardDescription className="text-base">
                  Never miss important academic milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Integrated calendar system with intelligent scheduling, automated reminders, and seamless synchronization across all your devices.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 transform hover:-translate-y-2 border-2 hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold">Real-time Communication</CardTitle>
                <CardDescription className="text-base">
                  Stay connected with your entire academic community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Built-in chat system, announcements, and collaborative tools to keep everyone informed, engaged, and connected in real-time.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 transform hover:-translate-y-2 border-2 hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold">AI-Powered Labs</CardTitle>
                <CardDescription className="text-base">
                  Next-generation learning with artificial intelligence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Leverage cutting-edge AI tools for content generation, personalized feedback, and enhanced learning experiences that adapt to each student.
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Feature Image Placeholder */}
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-gradient-to-r from-muted/30 to-muted/20 rounded-3xl p-12 border-2 border-muted/50">
              <div className="aspect-[16/9] bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="h-16 w-16 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Features in Action</h3>
                  <p className="text-muted-foreground text-lg">Interactive demo and screenshots coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 bg-gradient-to-r from-primary via-primary to-primary/90 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-6 py-3 text-base font-semibold bg-white/20 text-white border-white/30">
              <Sparkles className="mr-2 h-5 w-5" />
              Join the Revolution
            </Badge>
            <h2 className="text-6xl font-extrabold text-white mb-8 leading-tight">
              Ready to Transform
              <br />
              <span className="text-white/90">Your Teaching?</span>
            </h2>
            <p className="text-2xl text-white/90 mb-12 leading-relaxed">
              Join thousands of educators who are already using <span className="font-bold text-white">Studious</span> to revolutionize their teaching experience and unlock their students' full potential.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="px-12 py-4 text-xl font-bold shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:scale-105 bg-white text-primary hover:bg-white/90">
                  Start Your Free Trial
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="px-12 py-4 text-xl font-semibold border-2 border-white text-white hover:bg-white hover:text-primary transition-all duration-300">
                  Sign In Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-muted py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              <img src="/logo.png" alt="Studious Logo" className="w-8 h-8" />
              <span className="text-xl font-bold text-foreground">Studious</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-muted-foreground mb-2">
                &copy; 2025 Studious. Built for educators, by educators.
              </p>
              <p className="text-sm text-muted-foreground">
                Empowering the future of education, one classroom at a time.
              </p>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </AppLayout>
  );
}