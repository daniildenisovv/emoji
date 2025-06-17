
"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import type { CalendarEvent } from "@/lib/types";
import { DayPicker, DayContent as RDPDayContent, type DayContentProps } from 'react-day-picker';
import { isSameDay } from 'date-fns';
import { addWeeks, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  events: CalendarEvent[];
  onDateSelect: (date: Date | undefined) => void;
  selectedDate?: Date;
  onSelectedDateChange: (date: Date | undefined) => void;
 view: 'day' | 'week' | 'month';
}

function CustomDayContent(props: DayContentProps) {
  const dayEvents = (props.activeModifiers.eventsForDay || []) as CalendarEvent[];
  
  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center">
      <RDPDayContent {...props} />
      {dayEvents.length > 0 && (
        <div className={cn(
          "absolute -bottom-1.5 md:bottom-0 left-1/2 -translate-x-1/2 flex space-x-px",
           // Make emojis slightly larger on hovered/selected day cell
          (props.activeModifiers.selected || props.activeModifiers.hovered) && "scale-110" 
          )}
          aria-hidden="true"
        >
          {dayEvents.slice(0, props.activeModifiers.selected || props.activeModifiers.hovered ? 3 : 2).map(event => (
            <span key={event.id} className="text-[7px] md:text-[9px] leading-none">
              {event.emoji}
            </span>
          ))}
           {dayEvents.length > (props.activeModifiers.selected || props.activeModifiers.hovered ? 3 : 2) && (
             <span className="text-[7px] md:text-[9px] leading-none text-muted-foreground">+{dayEvents.length - (props.activeModifiers.selected || props.activeModifiers.hovered ? 3 : 2)}</span>
           )}
        </div>
      )}
    </div>
  );
}


export function CalendarView({ events, onDateSelect, selectedDate, onSelectedDateChange, view }: CalendarViewProps) {
  const [month, setMonth] = React.useState<Date>(selectedDate || new Date());

  const displayedDates = React.useMemo(() => {
    if (!selectedDate) return [];
    switch (view) {
      case 'day':
        return [selectedDate];
      case 'week': {
        const start = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday as the start of the week
        const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
      }
      case 'month': {
        const start = startOfMonth(selectedDate);
        const end = endOfMonth(selectedDate);
        return eachDayOfInterval({ start, end });
      }
    }
  }, [selectedDate, view]);

  const modifiers = React.useMemo(() => {
    // Use the eventsForDay modifier to filter events for each day.
    // This is a more standard way to use react-day-picker modifiers.
    // The CustomDayContent component will access the events via activeModifiers.eventsForDay.

    return {
      eventsForDay: (date: Date) => events.filter(event => isSameDay(date, event.date)),
      ...modifiersOutput, // This might not be the standard way, eventsForDay is safer
    };
  }, [events]);
  
  const handleDayClick = (date: Date | undefined) => {
    if(date) {
      onDateSelect(date);
      onSelectedDateChange(date);
    }
  };

  const handleMonthChange = (newMonth: Date) => {
    setMonth(newMonth);
    // When changing month in month view, select the first day of the new month
    if (view === 'month') {
      onSelectedDateChange(startOfMonth(newMonth));
    }
  };

  return (
    <div className="w-full">
      {view === 'day' && selectedDate && (
        <div className="text-lg font-semibold text-center mb-4">{selectedDate.toDateString()}</div>
      )}
      <Calendar
        mode={view === 'month' ? "single" : "single"} // Keep single mode for selection, adjust display range with focus
        selected={selectedDate}
        onSelect={handleDayClick}
        month={month} // Use state month for calendar navigation
        onMonthChange={handleMonthChange} // Handle month changes for navigation
        className="p-0 w-full [&_button]:h-10 [&_button]:w-10 md:[&_button]:h-12 md:[&_button]:w-12 [&_td]:h-10 [&_td]:w-10 md:[&_td]:h-14 md:[&_td]:w-14"
        classNames={{
          day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90",
          day_today: "bg-accent/50 text-accent-foreground",
          cell: "relative",
        }}
        components={{
          DayContent: CustomDayContent,
        }}
        modifiers={modifiers}
        showOutsideDays
        fixedWeeks={view === 'month'} // Fixed weeks only for month view
      />
    </div>
  );
}
