"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BookOpen, 
  FileText, 
  BarChart3, 
  FolderOpen, 
  Users, 
  UserCheck, 
  FlaskConical, 
  FileCheck, 
  Settings,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetAllClassesQuery, useGetClassQuery } from "@/lib/api";
import { Skeleton } from "./skeleton";

const classNavigationItems = [
  { href: "", label: "Overview", icon: BookOpen },
  { href: "/assignments", label: "Assignments", icon: FileText },
  { href: "/grades", label: "Grades", icon: BarChart3 },
  { href: "/files", label: "Files", icon: FolderOpen },
  { href: "/attendance", label: "Attendance", icon: UserCheck },
  { href: "/labs", label: "Labs", icon: FlaskConical },
  { href: "/members", label: "Members", icon: Users },
  { href: "/syllabus", label: "Syllabus", icon: FileCheck },
  { href: "/settings", label: "Settings", icon: Settings },
];

// Mock classes data - in real app this would come from props or API
const mockClasses = [
  { id: "1", title: "Mathematics 101", section: "Section A", subject: "Mathematics", color: "#3B82F6" },
  { id: "2", title: "Physics 201", section: "Section B", subject: "Physics", color: "#10B981" },
  { id: "3", title: "Chemistry 101", section: "Section C", subject: "Chemistry", color: "#F59E0B" },
  { id: "4", title: "Biology 301", section: "Section A", subject: "Biology", color: "#EF4444" },
];

interface ClassSidebarProps {
  classId: string;
}

export function ClassSidebar({ classId }: ClassSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const { data: allClasses, isLoading, error } = useGetAllClassesQuery();
  const classes = allClasses?.teacherInClass.concat(allClasses?.studentInClass);

  const { data: classData, isLoading: isClassLoading, error: isClassError } = useGetClassQuery(classId!);
  const className = classData?.class;

  if (!classId) {
    console.log("❌ No classId - returning null");
    return null;
  }

  console.log("✅ ClassSidebar will render");

  const handleClassChange = (newClassId: string) => {
    router.push(`/class/${newClassId}`);
  };

  const isActive = (path: string) => {
    const fullPath = `/class/${classId}${path}`;
    return pathname === fullPath;
  };

  return (
    <div className="w-64 h-screen bg-card border-r flex flex-col fixed left-16 top-0 z-30">
      {/* Class Header */}
      <div className="px-4 py-2">
        
        <div className="space-y-1">
          <Select value={classId} onValueChange={handleClassChange}>
            <SelectTrigger className="w-full text-left px-4 focus:outline-none focus:ring-0 border-none hover:bg-accent transition-colors duration-200">
              <SelectValue>
                {isClassLoading && <div className="flex flex-row space-x-3">
                  <Skeleton className="w-3 h-3 rounded-full flex-shrink-0" />
                  <Skeleton className="w-20 h-3 rounded-full flex-shrink-0" /> 
                  </div>}
                {className && !isClassLoading && (
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: className.color || "#000000" }}
                    />
                    <div className="min-w-0 flex-1 text-left">
                      <div className="font-medium truncate text-left">{className.name}</div>
                      <div className="text-xs text-muted-foreground truncate text-left">{className.section} • {className.subject}</div>
                    </div>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="w-64 bg-popover border shadow-md">
               {classes?.map((cls) => (
                <SelectItem key={cls.id} value={cls.id} className="cursor-pointer">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: cls.color || "#000000" }}
                    />
                    <div className="min-w-0 flex-1 text-left">
                      <div className="font-medium truncate text-left">{cls.name}</div>
                      <div className="text-xs text-muted-foreground truncate text-left">{cls.section} • {cls.subject}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Separator */}
      <div className="border-b border-border/60 mx-4"></div>

      {/* Class Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {classNavigationItems.map((item) => {
          const Icon = item.icon;
          const href = `/class/${classId}${item.href}`;
          
          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex items-center space-x-3 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105",
                isActive(item.href)
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* Class Invite Code */}
      <div className="p-4 border-t mt-auto">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Class Invite Code</label>
          <div className="flex items-center justify-between p-2 bg-muted rounded-md hover:bg-muted/60 transition-colors duration-200">
            <code className="text-sm font-mono">PHY101-2024</code>
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:scale-110 transition-transform duration-200" title="Copy code">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:scale-110 transition-transform duration-200" title="Regenerate code">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                  <path d="M21 3v5h-5"></path>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                  <path d="M3 21v-5h5"></path>
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}