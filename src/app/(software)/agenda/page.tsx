"use client";

import { PageLayout, PageHeader } from "@/components/ui/page-layout";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { CreateEventButton, EventPreviewModal } from "@/components/modals";
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
import { trpc } from "@/lib/trpc";
import { useEffect, useState, useMemo } from "react";
import { useTranslations } from 'next-intl';

export default function Agenda() {
  const t = useTranslations('agenda');
  const tViews = useTranslations('agenda.views');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  // Get start of current week (stable calculation)
  const weekStart = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek.toISOString();
  }, []);

  const { data: events } = trpc.agenda.get.useQuery({
    weekStart,
  });

  // Memoize formatted events to prevent unnecessary re-renders
  const formattedEvents = useMemo(() => {
    if (!events) return [];
    
    const classEvents = events.events?.class || [];
    const personalEvents = events.events?.personal || [];
    const joinedEvents = [...classEvents, ...personalEvents];
    
    return joinedEvents.map(event => ({
      id: event.id,
      title: event.name || t('untitledEvent'),
      start: new Date(event.startTime),
      end: new Date(event.endTime),
      color: event.color || '#3B82F6',
      location: event.location || undefined,
      onClick: () => {
        setSelectedEvent(event.id);
        setPreviewModalOpen(true);
      },
    }));
  }, [events, t]);

  console.log('Events data:', events);
  console.log('Formatted events:', formattedEvents);

  return (
    <PageLayout>
      <PageHeader
        title={t('title')}
        description={t('description')}
      />

      <Calendar events={formattedEvents}>
        <div className="h-[calc(100vh-200px)] flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <CalendarViewTrigger className="aria-[current=true]:bg-accent" view="day">
              {tViews('day')}
            </CalendarViewTrigger>
            <CalendarViewTrigger view="week" className="aria-[current=true]:bg-accent">
              {tViews('week')}
            </CalendarViewTrigger>
            <CalendarViewTrigger view="month" className="aria-[current=true]:bg-accent">
              {tViews('month')}
            </CalendarViewTrigger>
            <CalendarViewTrigger view="year" className="aria-[current=true]:bg-accent">
              {tViews('year')}
            </CalendarViewTrigger>

            <span className="flex-1" />

            <CalendarCurrentDate />

            <CalendarPrevTrigger>
              <ChevronLeft size={20} />
              <span className="sr-only">{t('previous')}</span>
            </CalendarPrevTrigger>

            <CalendarTodayTrigger>{t('today')}</CalendarTodayTrigger>

            <CalendarNextTrigger>
              <ChevronRight size={20} />
              <span className="sr-only">{t('next')}</span>
            </CalendarNextTrigger>

            <CreateEventButton>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t('addEvent')}
              </Button>
            </CreateEventButton>
          </div>

          <div className="flex-1 overflow-auto relative">
            <CalendarDayView />
            <CalendarWeekView />
            <CalendarMonthView />
            <CalendarYearView />
          </div>
        </div>
        </Calendar>

        {/* Event Preview Modal */}
        {selectedEvent && (
          <EventPreviewModal
            open={previewModalOpen}
            onOpenChange={setPreviewModalOpen}
            event={
              (events?.events?.class?.find(event => event.id === selectedEvent) || 
               events?.events?.personal?.find(event => event.id === selectedEvent)) as any
            }
          />
        )}
      </PageLayout>
    );
  }
