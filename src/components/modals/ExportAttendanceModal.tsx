"use client";

import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Users, SearchX } from "lucide-react";
import { toast } from "sonner";
import { RouterOutputs } from "@/lib/trpc";
import { EmptyState } from "@/components/ui/empty-state";

type Student = RouterOutputs["class"]["get"]["class"]["students"][number];
type AttendanceRecord = RouterOutputs["attendance"]["get"][number];
type Event = RouterOutputs["event"]["get"]["event"];

interface ExportAttendanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
  events: Event[];
  attendanceData: AttendanceRecord[];
  className?: string;
}

// Lazy load xlsx
const loadXLSX = async () => {
  try {
    const xlsx = await import("xlsx");
    return xlsx as any;
  } catch {
    return null;
  }
};

export function ExportAttendanceModal({
  open,
  onOpenChange,
  students,
  events,
  attendanceData,
  className,
}: ExportAttendanceModalProps) {
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [studentSearchQuery, setStudentSearchQuery] = useState("");

  // Initialize with all students selected when modal opens
  useEffect(() => {
    if (open) {
      setSelectedStudentIds(new Set(students.map(s => s.id)));
    }
  }, [open, students]);

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    if (!studentSearchQuery.trim()) return students;
    const query = studentSearchQuery.toLowerCase();
    return students.filter(student => 
      student.username.toLowerCase().includes(query) ||
      student.profile?.displayName?.toLowerCase().includes(query)
    );
  }, [students, studentSearchQuery]);

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const selectAllStudents = () => {
    setSelectedStudentIds(new Set(filteredStudents.map(s => s.id)));
  };

  const deselectAllStudents = () => {
    setSelectedStudentIds(new Set());
  };

  const handleExport = async () => {
    const XLSX = await loadXLSX();
    
    if (!XLSX) {
      toast.error('xlsx library is not installed. Please install it: npm install xlsx');
      return;
    }

    if (selectedStudentIds.size === 0) {
      toast.error('Please select at least one student to export');
      return;
    }

    // Get selected students
    const selectedStudents = students.filter(s => selectedStudentIds.has(s.id));
    
    // Sort events by date
    const sortedEvents = [...events].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    // Build headers: Student Name, then each event name
    const headers = [
      'Student Name',
      'Username',
      ...sortedEvents.map(event => {
        const eventDate = format(new Date(event.startTime), "MMM d, yyyy");
        return `${event.name || 'Untitled'} (${eventDate})`;
      })
    ];

    // Build rows: one per selected student
    const rows = selectedStudents.map(student => {
      const row: (string | number)[] = [
        student.profile?.displayName || student.username,
        student.username,
      ];

      // For each event, get the student's attendance status
      sortedEvents.forEach(event => {
        const record = attendanceData.find(r => r.event?.id === event.id);
        let status = '';
        
        if (record) {
          if (record.present.some(s => s.id === student.id)) {
            status = 'Present';
          } else if (record.late.some(s => s.id === student.id)) {
            status = 'Late';
          } else if (record.absent.some(s => s.id === student.id)) {
            status = 'Absent';
          } else {
            status = 'Not Taken';
          }
        } else {
          status = 'Not Taken';
        }
        
        row.push(status);
      });

      return row;
    });

    // Create worksheet
    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    const columnWidths = [
      { wch: 20 }, // Student Name
      { wch: 15 }, // Username
      ...sortedEvents.map(() => ({ wch: 25 })) // Event columns
    ];
    worksheet['!cols'] = columnWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${className || 'class'}_attendance_${timestamp}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, filename);
    
    toast.success(`Exported attendance for ${selectedStudents.length} student(s)`);
    onOpenChange(false);
    setSelectedStudentIds(new Set());
    setStudentSearchQuery("");
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedStudentIds(new Set());
    setStudentSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Attendance
          </DialogTitle>
          <DialogDescription>
            Select students to include in the attendance export. The export will include all events with each student's attendance status.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Search and Select All */}
          <div className="space-y-2">
            <Input
              placeholder="Search students..."
              value={studentSearchQuery}
              onChange={(e) => setStudentSearchQuery(e.target.value)}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {selectedStudentIds.size} of {filteredStudents.length} selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllStudents}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deselectAllStudents}
                >
                  Deselect All
                </Button>
              </div>
            </div>
          </div>

          {/* Student List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredStudents.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="No students found"
                description="Try adjusting your search query"
                className="py-6"
              />
            ) : (
              filteredStudents.map((student) => {
                const isSelected = selectedStudentIds.has(student.id);
                return (
                  <div
                    key={student.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => toggleStudentSelection(student.id)}
                  >
                    <Checkbox 
                      checked={isSelected} 
                      onClick={(e) => e.stopPropagation()}
                      onCheckedChange={() => toggleStudentSelection(student.id)}
                    />
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">
                        {student.profile?.displayName || student.username}
                      </div>
                      {student.profile?.displayName && (
                        <div className="text-sm text-muted-foreground">
                          @{student.username}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport}
            disabled={selectedStudentIds.size === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export ({selectedStudentIds.size} student{selectedStudentIds.size !== 1 ? 's' : ''})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

