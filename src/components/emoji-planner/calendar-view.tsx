
"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import type { CalendarEvent } from "@/lib/types";
import { DayPicker, DayContent as RDPDayContent, type DayContentProps } from 'react-day-picker';
import { isSameDay } from 'date-fns';
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  events: CalendarEvent[];
  onDateSelect: (date: Date | undefined) => void;
  selectedDate?: Date;
  onSelectedDateChange: (date: Date | undefined) => void;
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


export function CalendarView({ events, onDateSelect, selectedDate, onSelectedDateChange }: CalendarViewProps) {
  const [month, setMonth] = React.useState<Date>(selectedDate || new Date());

  const modifiers = React.useMemo(() => {
    const eventModifiers: Record<string, CalendarEvent[]> = {};
    events.forEach(event => {
      const dayKey = event.date.toDateString();
      if (!eventModifiers[dayKey]) {
        eventModifiers[dayKey] = [];
      }
      eventModifiers[dayKey].push(event);
    });
    
    const modifiersOutput: Record<string, any> = {};
    Object.keys(eventModifiers).forEach(dayKey => {
      // A bit of a hack: react-day-picker modifiers are usually booleans or Date objects.
      // We pass the events themselves to be accessible in CustomDayContent via activeModifiers.
      modifiersOutput[dayKey] = eventModifiers[dayKey]; 
    });

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

  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={handleDayClick}
      month={month}
      onMonthChange={setMonth}
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
      modifiersClassNames={{
         // You could add specific classes for days with events if needed here
      }}
      showOutsideDays
      fixedWeeks
    />
  );
}
