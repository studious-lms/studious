"use client";

import { usePathname } from "next/navigation";
import { FloatingThemeToggle } from "@/components/ui/floating-theme-toggle";

export function ConditionalThemeToggle() {
  const pathname = usePathname();
  
  // Hide theme toggle on marketing pages
  const isMarketingPage = pathname === "/" || 
    pathname.startsWith("/about") || 
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/press") || 
    pathname.startsWith("/pricing") || 
    pathname.startsWith("/privacy-policy") ||
    pathname.startsWith("/program") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/terms-of-service") ||
    pathname.startsWith("/verify");
  
  if (isMarketingPage) {
    return null;
  }
  
  return <FloatingThemeToggle />;
}
