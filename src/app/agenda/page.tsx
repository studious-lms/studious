import { PageLayout, PageHeader } from "@/components/ui/page-layout";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { CreateEventModal } from "@/components/modals";
import {
  Calendar,
  CalendarCurrentDate,
  CalendarDayView,
  CalendarMonthView,
  CalendarNextTrigger,
  CalendarPrevTrigger,
  CalendarTodayTrigger,
  CalendarViewTrigger,
  CalendarWeekView,
  CalendarYearView,
  type CalendarEvent,
} from "@/components/ui/full-calendar";

// Mock events data for the calendar
const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Physics Lab Session",
    start: new Date(2025, 2, 15, 10, 0),
    end: new Date(2025, 2, 15, 12, 0),
    color: "blue",
  },
  {
    id: "2",
    title: "Quiz: Chapter 8", 
    start: new Date(2025, 2, 18, 14, 0),
    end: new Date(2025, 2, 18, 15, 0),
    color: "default",
  },
  {
    id: "3",
    title: "Office Hours",
    start: new Date(2025, 2, 20, 16, 0),
    end: new Date(2025, 2, 20, 18, 0),
    color: "green",
  },
  {
    id: "4",
    title: "Midterm Exam",
    start: new Date(2025, 2, 22, 9, 0),
    end: new Date(2025, 2, 22, 11, 0),
    color: "default",
  },
  {
    id: "5",
    title: "Guest Lecture: Quantum Computing",
    start: new Date(2025, 2, 25, 13, 0),
    end: new Date(2025, 2, 25, 14, 30),
    color: "purple",
  },
  {
    id: "6",
    title: "Study Group Session",
    start: new Date(2025, 2, 26, 15, 0),
    end: new Date(2025, 2, 26, 17, 0),
    color: "default",
  },
  {
    id: "7",
    title: "Lab Report Due",
    start: new Date(2025, 2, 28, 23, 59),
    end: new Date(2025, 2, 28, 23, 59),
    color: "default",
  },
  {
    id: "8",
    title: "Field Trip: Science Museum",
    start: new Date(2025, 3, 2, 9, 0),
    end: new Date(2025, 3, 2, 16, 0),
    color: "default",
  },
  {
    id: "9",
    title: "Project Presentations",
    start: new Date(2025, 3, 5, 10, 0),
    end: new Date(2025, 3, 5, 12, 0),
    color: "pink",
  },
  {
    id: "10",
    title: "Final Exam Review",
    start: new Date(2025, 3, 8, 14, 0),
    end: new Date(2025, 3, 8, 16, 0),
    color: "default",
  }
];

export default function Agenda() {
  return (
    <PageLayout>
      <PageHeader
        title="Agenda"
        description="View your schedule and upcoming events with comprehensive calendar views"
      />

      <Calendar events={mockEvents}>
        <div className="h-[calc(100vh-200px)] flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <CalendarViewTrigger className="aria-[current=true]:bg-accent" view="day">
              Day
            </CalendarViewTrigger>
            <CalendarViewTrigger view="week" className="aria-[current=true]:bg-accent">
              Week
            </CalendarViewTrigger>
            <CalendarViewTrigger view="month" className="aria-[current=true]:bg-accent">
              Month
            </CalendarViewTrigger>
            <CalendarViewTrigger view="year" className="aria-[current=true]:bg-accent">
              Year
            </CalendarViewTrigger>

            <span className="flex-1" />

            <CalendarCurrentDate />

            <CalendarPrevTrigger>
              <ChevronLeft size={20} />
              <span className="sr-only">Previous</span>
            </CalendarPrevTrigger>

            <CalendarTodayTrigger>Today</CalendarTodayTrigger>

            <CalendarNextTrigger>
              <ChevronRight size={20} />
              <span className="sr-only">Next</span>
            </CalendarNextTrigger>

            <CreateEventModal>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </CreateEventModal>
          </div>

          <div className="flex-1 overflow-auto relative">
            <CalendarDayView />
            <CalendarWeekView />
            <CalendarMonthView />
            <CalendarYearView />
          </div>
        </div>
      </Calendar>
    </PageLayout>
  );
}
