"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { EarlyAccessModal } from "./EarlyAccessModal";
import { useState } from "react";

export function Navbar() {
  const [showEarlyAccess, setShowEarlyAccess] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Studious" className="w-7 h-7" />
              <span className="text-lg font-semibold text-foreground">Studious</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/program" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                School Program
              </Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/press" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Press
              </Link>
              <div className="h-4 w-px bg-border" />
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => setShowEarlyAccess(true)}
              >
                Request Early Access
              </Button>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Menu className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>
          
          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
              <div className="px-6 py-4 space-y-4">
                <Link 
                  href="/pricing" 
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link 
                  href="/program" 
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  School Program
                </Link>
                <Link 
                  href="/about" 
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  href="/press" 
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Press
                </Link>
                <div className="pt-4 border-t border-border">
                  <Link 
                    href="/login" 
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Button 
                    size="sm" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => {
                      setShowEarlyAccess(true);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Request Early Access
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <EarlyAccessModal open={showEarlyAccess} onOpenChange={setShowEarlyAccess} />
    </>
  );
}

