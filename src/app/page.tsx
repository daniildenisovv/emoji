
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { CalendarEvent } from '@/lib/types';
import { AddEventForm } from '@/components/emoji-planner/add-event-form';
import { CalendarView } from '@/components/emoji-planner/calendar-view';
import { EmojiSummary } from '@/components/emoji-planner/emoji-summary';
import { EventItem } from '@/components/emoji-planner/event-item';
import { ThemeSwitcher } from '@/components/emoji-planner/theme-switcher';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format, isSameDay } from 'date-fns';
import { PlusCircle, Smile } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const EVENTS_STORAGE_KEY = 'emoji-planner-events';

export default function EmojiPlannerPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Indicate client-side rendering is active
    try {
      const storedEvents = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents).map((event: any) => ({
          ...event,
          date: new Date(event.date), 
        })));
      }
    } catch (error) {
      console.error("Failed to load events from localStorage:", error);
      toast({
        title: "Error loading data",
        description: "Could not load saved events. Your data might be corrupted.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    if(isClient) { // Only run on client after initial hydration
      try {
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
      } catch (error) {
        console.error("Failed to save events to localStorage:", error);
        toast({
          title: "Error saving data",
          description: "Could not save your latest changes.",
          variant: "destructive",
        });
      }
    }
  }, [events, toast, isClient]);

  const handleAddEvent = useCallback((newEventData: Omit<CalendarEvent, 'id'>) => {
    const newEventWithId: CalendarEvent = { ...newEventData, id: crypto.randomUUID() };
    setEvents(prevEvents => [...prevEvents, newEventWithId].sort((a,b) => a.date.getTime() - b.date.getTime()));
    setIsAddEventDialogOpen(false);
    toast({
      title: "Event Added",
      description: `"${newEventData.title}" scheduled successfully.`,
    });
  }, [toast]);

  const handleDeleteEvent = useCallback((eventId: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
    toast({
      title: "Event Deleted",
      description: "The event has been removed.",
    });
  }, [toast]);

  const handleDateSelectForCalendar = useCallback((date: Date | undefined) => {
    setSelectedDate(date);
  }, []);
  
  const handleOpenAddEventDialog = (date?: Date) => {
    setSelectedDate(date || new Date());
    setIsAddEventDialogOpen(true);
  };

  const eventsForSelectedDate = selectedDate && isClient
    ? events.filter(event => isSameDay(event.date, selectedDate))
    : [];

  if (!isClient) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background text-foreground">
        <Smile className="h-16 w-16 animate-pulse text-primary" />
        <p className="text-xl font-headline mt-4">Loading Emoji Planner...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Smile className="h-8 w-8 text-primary mr-2" />
          <h1 className="text-2xl md:text-3xl font-bold">Emoji Planner</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleOpenAddEventDialog(selectedDate)} className="hidden md:inline-flex">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Event
            </Button>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-6 px-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8 space-y-6 lg:space-y-0">
          
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg overflow-hidden">
              <CardContent className="p-2 md:p-4">
                <CalendarView 
                  events={events} 
                  onDateSelect={handleDateSelectForCalendar} 
                  selectedDate={selectedDate}
                  onSelectedDateChange={setSelectedDate}
                />
              </CardContent>
            </Card>

            {selectedDate && (
              <Card className="shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="font-headline text-xl">Events for {format(selectedDate, 'PPP')}</CardTitle>
                      <CardDescription>Manage your events for the selected day.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleOpenAddEventDialog(selectedDate)}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {eventsForSelectedDate.length > 0 ? (
                    <div className="space-y-2">
                      {eventsForSelectedDate.map(event => (
                        <EventItem key={event.id} event={event} onDelete={handleDeleteEvent} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No events for this day. Click "Add" to schedule one!</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6 lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto"> {/* Sticky sidebar for summary */}
            <Button onClick={() => handleOpenAddEventDialog(selectedDate)} className="w-full md:hidden flex items-center justify-center gap-2 py-3 text-base">
              <PlusCircle className="h-5 w-5" /> Add New Event
            </Button>
            <EmojiSummary events={events} selectedDate={selectedDate} />
          </div>
        </div>
      </main>

      <AddEventForm
        isOpen={isAddEventDialogOpen}
        onOpenChange={setIsAddEventDialogOpen}
        onAddEvent={handleAddEvent}
        selectedDate={selectedDate}
      />
    </div>
  );
}
