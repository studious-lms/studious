"use client";

import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  hasClassHeader?: boolean; // Indicates if page has class sidebar header
}

export function PageLayout({ children, className = "", hasClassHeader = false }: PageLayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className={`container mx-auto px-4 max-w-7xl ${
      isMobile 
        ? hasClassHeader 
          ? 'pt-20 pb-20' // Top padding for class header + bottom padding for bottom nav
          : 'py-4 pb-20' // Normal top padding + bottom padding for bottom nav
        : 'py-4'
    } ${className}`}>
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-lg">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center space-x-2">
          {children}
        </div>
      )}
    </div>
  );
}