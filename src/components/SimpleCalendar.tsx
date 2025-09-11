"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, addMonths, subMonths, isSameDay, isToday, startOfMonth, endOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  description?: string;
  type: "class" | "assignment" | "meeting";
}

interface SimpleCalendarProps {
  events?: Event[];
  initialView?: "week" | "month";
}

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Physics Lab Session",
    start: "2024-01-15T14:00",
    end: "2024-01-15T16:00",
    location: "Lab Room 301",
    description: "Advanced Physics lab session",
    type: "class"
  },
  {
    id: "2", 
    title: "Assignment Due: Lab Report #3",
    start: "2024-01-15T23:59",
    end: "2024-01-15T23:59",
    description: "Submit lab report for Advanced Physics",
    type: "assignment"
  },
  {
    id: "3",
    title: "Parent-Teacher Conference", 
    start: "2024-01-16T15:00",
    end: "2024-01-16T16:00",
    location: "Room 205",
    type: "meeting"
  },
  {
    id: "4",
    title: "Math Quiz",
    start: "2024-01-17T10:00", 
    end: "2024-01-17T11:00",
    location: "Room 101",
    type: "class"
  },
  {
    id: "5",
    title: "Essay Submission",
    start: "2024-01-18T23:59",
    end: "2024-01-18T23:59", 
    description: "Submit English essay",
    type: "assignment"
  }
];

export default function SimpleCalendar({ events = mockEvents, initialView = "week" }: SimpleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"week" | "month">(initialView);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "class": return "bg-primary text-primary-foreground";
      case "assignment": return "bg-destructive text-destructive-foreground";
      case "meeting": return "bg-secondary text-secondary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    if (view === "week") {
      setCurrentDate(direction === "next" ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
    } else {
      setCurrentDate(direction === "next" ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return isSameDay(eventDate, date);
    });
  };

  const WeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="grid grid-cols-7 gap-4">
        {days.map(day => {
          const dayEvents = getEventsForDate(day);
          return (
            <Card 
              key={day.toISOString()} 
              className={cn(
                "min-h-[200px] cursor-pointer transition-colors",
                isToday(day) && "ring-2 ring-primary",
                isSameDay(day, selectedDate) && "bg-accent"
              )}
              onClick={() => setSelectedDate(day)}
            >
              <CardContent className="p-3">
                <div className="text-center mb-2">
                  <div className="text-xs text-muted-foreground">
                    {format(day, "EEE")}
                  </div>
                  <div className={cn("text-sm font-medium", isToday(day) && "text-primary")}>
                    {format(day, "d")}
                  </div>
                </div>
                <div className="space-y-1">
                  {dayEvents.map(event => (
                    <div key={event.id} className={cn("p-2 rounded text-xs", getEventTypeColor(event.type))}>
                      <div className="font-medium truncate">{event.title}</div>
                      {event.start.includes("T") && (
                        <div className="flex items-center text-xs opacity-80">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(event.start), "HH:mm")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const MonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="space-y-4">
        {/* Month Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
          
          {/* Days */}
          {days.map(day => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = day >= monthStart && day <= monthEnd;
            
            return (
              <Card 
                key={day.toISOString()} 
                className={cn(
                  "h-24 cursor-pointer transition-colors",
                  !isCurrentMonth && "opacity-50",
                  isToday(day) && "ring-2 ring-primary",
                  isSameDay(day, selectedDate) && "bg-accent"
                )}
                onClick={() => setSelectedDate(day)}
              >
                <CardContent className="p-2 h-full">
                  <div className={cn(
                    "text-sm font-medium mb-1",
                    isToday(day) && "text-primary"
                  )}>
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div key={event.id} className={cn("w-full h-1 rounded", 
                        event.type === "class" ? "bg-primary" :
                        event.type === "assignment" ? "bg-destructive" : "bg-secondary"
                      )} />
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground">+{dayEvents.length - 2}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Events for selected date */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Events for {format(selectedDate, "MMMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getEventsForDate(selectedDate).length > 0 ? (
              <div className="space-y-3">
                {getEventsForDate(selectedDate).map(event => (
                  <div key={event.id} className="p-3 rounded-lg border">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className={getEventTypeColor(event.type)}>
                        {event.type}
                      </Badge>
                      <div className="flex-1">
                        <h4 className="font-medium">{event.title}</h4>
                        <div className="text-sm text-muted-foreground space-y-1 mt-1">
                          {event.start.includes("T") && (
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {format(new Date(event.start), "HH:mm")}
                              {event.end !== event.start && ` - ${format(new Date(event.end), "HH:mm")}`}
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {event.location}
                            </div>
                          )}
                          {event.description && (
                            <p className="text-xs">{event.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No events for this date</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateDate("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateDate("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <h2 className="text-xl font-semibold">
          {view === "week" 
            ? `Week of ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "MMM d, yyyy")}`
            : format(currentDate, "MMMM yyyy")
          }
        </h2>
        
        <div className="flex items-center border rounded-lg">
          <Button 
            variant={view === "week" ? "default" : "ghost"} 
            size="sm"
            onClick={() => setView("week")}
            className="rounded-r-none"
          >
            Week
          </Button>
          <Button 
            variant={view === "month" ? "default" : "ghost"} 
            size="sm"
            onClick={() => setView("month")}
            className="rounded-l-none"
          >
            Month
          </Button>
        </div>
      </div>

      {/* Calendar Content */}
      {view === "week" ? <WeekView /> : <MonthView />}
    </div>
  );
}