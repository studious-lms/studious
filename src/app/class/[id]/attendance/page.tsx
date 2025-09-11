"use client";

import { useState } from "react";
import { format } from "date-fns";
import { PageLayout, PageHeader } from "@/components/ui/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { 
  Calendar as CalendarIcon, 
  Save, 
  UserCheck, 
  UserX, 
  Clock
} from "lucide-react";

const mockStudents = [
  { id: "1", name: "Alex Johnson", avatar: "", initials: "AJ" },
  { id: "2", name: "Sarah Chen", avatar: "", initials: "SC" },
  { id: "3", name: "Michael Rodriguez", avatar: "", initials: "MR" },
  { id: "4", name: "Emily Davis", avatar: "", initials: "ED" },
  { id: "5", name: "James Wilson", avatar: "", initials: "JW" },
  { id: "6", name: "Lisa Anderson", avatar: "", initials: "LA" },
  { id: "7", name: "David Brown", avatar: "", initials: "DB" },
  { id: "8", name: "Jennifer Taylor", avatar: "", initials: "JT" },
];

const mockSessions = [
  { id: "1", name: "Morning Session", time: "9:00 AM - 12:00 PM" },
  { id: "2", name: "Afternoon Session", time: "2:00 PM - 5:00 PM" },
  { id: "3", name: "Evening Session", time: "6:00 PM - 9:00 PM" },
];

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [attendance, setAttendance] = useState<Record<string, string>>(
    mockStudents.reduce((acc, student) => ({
      ...acc,
      [student.id]: "present" // Default to present
    }), {})
  );

  const updateAttendance = (studentId: string, status: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };


  const getStatusStats = () => {
    const stats = Object.values(attendance).reduce((acc, status) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      present: stats.present || 0,
      late: stats.late || 0,
      absent: stats.absent || 0,
      total: mockStudents.length
    };
  };

  const stats = getStatusStats();
  const showStudentRoster = selectedDate && selectedSession;

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">Track student attendance for each session</p>
        </div>
        
        <Button disabled={!showStudentRoster}>
          <Save className="h-4 w-4 mr-2" />
          Save Attendance
        </Button>
      </div>

      {/* Session Selection Row */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Date Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Select Session Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>

        {/* Session Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Select Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session.id)}
                  className={cn(
                    "w-full p-3 text-left rounded-md border transition-colors",
                    selectedSession === session.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <div className="text-sm font-medium">{session.name}</div>
                  <div className="text-xs opacity-80">{session.time}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Show stats and quick actions only when both date and session are selected */}
      {showStudentRoster && (
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Attendance Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Session Summary</CardTitle>
              <p className="text-xs text-muted-foreground">
                {selectedDate?.toLocaleDateString()} - {mockSessions.find(s => s.id === selectedSession)?.name}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-950">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">{stats.present}</div>
                  <p className="text-xs">Present</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950">
                  <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{stats.late}</div>
                  <p className="text-xs">Late</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-950">
                  <div className="text-lg font-bold text-red-600 dark:text-red-400">{stats.absent}</div>
                  <p className="text-xs">Absent</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted">
                  <div className="text-lg font-bold">{stats.total}</div>
                  <p className="text-xs">Total</p>
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <div className="flex justify-between text-xs">
                  <span>Attendance Rate</span>
                  <span className="font-medium">
                    {Math.round(((stats.present + stats.late) / stats.total) * 100)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  const newAttendance = {...attendance};
                  mockStudents.forEach(student => {
                    newAttendance[student.id] = "present";
                  });
                  setAttendance(newAttendance);
                }}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Mark All Present
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  const newAttendance = {...attendance};
                  mockStudents.forEach(student => {
                    newAttendance[student.id] = "absent";
                  });
                  setAttendance(newAttendance);
                }}
              >
                <UserX className="h-4 w-4 mr-2" />
                Mark All Absent
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                View History
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Student Roster - only show when both date and session are selected */}
      {showStudentRoster && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Student Roster</CardTitle>
            <p className="text-xs text-muted-foreground">
              Click the status buttons to mark attendance for each student
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {mockStudents.map((student) => (
                <div key={student.id} className="p-3 rounded-lg border hover:shadow-sm transition-shadow">
                  <div className="flex items-center space-x-2 mb-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={student.avatar} alt={student.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                        {student.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{student.name}</h4>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-1">
                    <Button
                      variant={attendance[student.id] === "present" ? "default" : "outline"}
                      size="sm"
                      className="text-xs py-1 h-7"
                      onClick={() => updateAttendance(student.id, "present")}
                    >
                      Present
                    </Button>
                    <Button
                      variant={attendance[student.id] === "late" ? "default" : "outline"}
                      size="sm"
                      className="text-xs py-1 h-7"
                      onClick={() => updateAttendance(student.id, "late")}
                    >
                      Late
                    </Button>
                    <Button
                      variant={attendance[student.id] === "absent" ? "destructive" : "outline"}
                      size="sm"
                      className="text-xs py-1 h-7"
                      onClick={() => updateAttendance(student.id, "absent")}
                    >
                      Absent
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prompt to select date and session */}
      {!showStudentRoster && (
        <Card className="text-center py-8">
          <CardContent>
            <CalendarIcon className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-base font-medium mb-2">Select Session Details</h3>
            <p className="text-sm text-muted-foreground">
              Choose a date and session above to view and manage student attendance
            </p>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}