
"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import type { CalendarEvent } from "@/lib/types";
import { DayContent as RDPDayContent, type DayContentProps } from 'react-day-picker';
import { isSameDay } from 'date-fns';
import { addWeeks, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  events: CalendarEvent[];
  onDateSelect: (date: Date | undefined) => void;
  selectedDate?: Date;
  onSelectedDateChange: (date: Date | undefined) => void;
  // The 'view' prop is defined but not actively used to change the calendar's display range beyond month.
  // It's used for 'displayedDates' which doesn't directly control the <Calendar> component's range.
  // For now, we keep it as the error is not related to this.
  view?: 'day' | 'week' | 'month'; // Default to month if not provided, or handle in parent
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


export function CalendarView({ events, onDateSelect, selectedDate, onSelectedDateChange, view = 'month' }: CalendarViewProps) {
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
    return {
      eventsForDay: (date: Date) => events.filter(event => isSameDay(date, event.date)),
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
    if (view === 'month') {
      onSelectedDateChange(startOfMonth(newMonth));
    }
  };

  return (
    <div className="w-full">
      {/* This day-specific header is not fully aligned with month view operation,
          but kept as per original structure. Consider conditional rendering based on 'view'. */}
      {view === 'day' && selectedDate && (
        <div className="text-lg font-semibold text-center mb-4">{selectedDate.toDateString()}</div>
      )}
      <Calendar
        mode="single" // Always single for selection, 'view' prop was not used for this
        selected={selectedDate}
        onSelect={handleDayClick}
        month={month} 
        onMonthChange={handleMonthChange} 
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
        fixedWeeks={view === 'month'}
      />
    </div>
  );
}
