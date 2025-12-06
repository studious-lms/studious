"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PrimarySidebar } from "./primary-sidebar";
import { ClassSidebar } from "./class-sidebar";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: ReactNode;
  isAuthenticated?: boolean;
}

export function AppLayout({ children, isAuthenticated = false }: AppLayoutProps) {
  const pathname = usePathname();
  const appState = useSelector((state: RootState) => state.app);
  
  // Check if we're in a class route - updated for Next.js routes
  const classMatch = pathname.match(/^\/class\/([^\/]+)(?:\/|$)/);
  const classId = classMatch?.[1];

  const isInClass = Boolean(classId && classId !== "" && classId !== "undefined");

  const isMobile = useIsMobile();

  const showClassSidebar = isInClass && !pathname.includes('/worksheets/edit') && appState.user.loggedIn;

  // Don't show sidebars for auth pages
  if (!isAuthenticated || ["/login", "/signup", "/pricing"].includes(pathname)) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  // Calculate main content margin based on visible sidebars
  const getMainMargin = () => {
    if (isMobile) return 'ml-0';
    if (showClassSidebar) return 'ml-80'; // Class sidebar (20rem)
    if (appState.user.loggedIn) return 'ml-16'; // Primary sidebar only (4rem)
    return 'ml-0';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Primary Sidebar */}
      {appState.user.loggedIn && <PrimarySidebar isAuthenticated={isAuthenticated} />}
      
      {/* Class Sidebar (only show if in a class route) */}
      {showClassSidebar && <ClassSidebar classId={classId!} />}
      
      {/* Main Content */}
      <main className={`min-h-screen overflow-auto transition-all duration-200 ${getMainMargin()}`}>
        {children}
      </main>
    </div>
  );
}