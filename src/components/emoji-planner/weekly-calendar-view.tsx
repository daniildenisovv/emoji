
"use client";

import type { CalendarEvent } from '@/lib/types';
import { 
  addDays, 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  parse, 
  differenceInMinutes,
  isToday
} from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useMemo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface WeeklyCalendarViewProps {
  events: CalendarEvent[];
  initialDate: Date;
  onEventClick?: (event: CalendarEvent) => void;
  onWeekChange?: (newWeekStartDate: Date) => void; 
}

const HOUR_HEIGHT_PX = 60; 
const DAY_HEADER_HEIGHT_PX = 50;
const TIME_COLUMN_WIDTH_PX = 50;

export function WeeklyCalendarView({ events, initialDate, onEventClick, onWeekChange }: WeeklyCalendarViewProps) {
  const [currentDateInView, setCurrentDateInView] = useState(initialDate);

  useEffect(() => {
    setCurrentDateInView(initialDate);
  }, [initialDate]);

  const currentWeekStart = useMemo(() => startOfWeek(currentDateInView, { weekStartsOn: 1 }), [currentDateInView]);

  const daysOfWeek = useMemo(() => {
    const start = currentWeekStart;
    const end = endOfWeek(start, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentWeekStart]);

  const timeSlots = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
  }, []);

  const handlePrevWeek = () => {
    const newDate = addDays(currentWeekStart, -7);
    setCurrentDateInView(newDate);
    if (onWeekChange) onWeekChange(startOfWeek(newDate, { weekStartsOn: 1 }));
  };

  const handleNextWeek = () => {
    const newDate = addDays(currentWeekStart, 7);
    setCurrentDateInView(newDate);
    if (onWeekChange) onWeekChange(startOfWeek(newDate, { weekStartsOn: 1 }));
  };

  const getEventPositionAndDimensions = (event: CalendarEvent) => {
    if (!event.startTime || !event.endTime) return null;

    const eventDate = new Date(event.date);
    const dayIndex = daysOfWeek.findIndex(day => isSameDay(day, eventDate));
    if (dayIndex === -1) return null; 

    try {
      const startTimeObj = parse(event.startTime, 'HH:mm', eventDate);
      const endTimeObj = parse(event.endTime, 'HH:mm', eventDate);
      
      const startOfDayForEvent = startOfWeek(eventDate, { weekStartsOn: 1 }); // Use startOfWeek to align
      startOfDayForEvent.setHours(0,0,0,0);
      // Adjust startTimeObj to be on the correct day for calculations if it spans midnight (not handled here but good to note)
      const minutesFromGridTop = differenceInMinutes(startTimeObj, new Date(startTimeObj).setHours(0,0,0,0));
      const durationMinutes = differenceInMinutes(endTimeObj, startTimeObj);

      if (durationMinutes <= 0) return null; // Invalid duration

      const top = (minutesFromGridTop / 60) * HOUR_HEIGHT_PX;
      const height = (durationMinutes / 60) * HOUR_HEIGHT_PX;

      return {
        top,
        height,
        dayIndex,
      };
    } catch (error) {
      console.error("Error parsing event times:", event, error);
      return null;
    }
  };

  return (
    <Card className="shadow-lg w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="font-headline text-lg md:text-xl">
          {format(currentWeekStart, 'MMMM yyyy')}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevWeek} aria-label="Previous week">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextWeek} aria-label="Next week">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div 
            className="grid relative min-w-[750px] md:min-w-full" 
            style={{ 
              gridTemplateColumns: `${TIME_COLUMN_WIDTH_PX}px repeat(7, 1fr)`,
              gridTemplateRows: `${DAY_HEADER_HEIGHT_PX}px repeat(24, ${HOUR_HEIGHT_PX}px)`
            }}
          >
            {/* Empty corner */}
            <div className="sticky left-0 z-20 bg-background border-r border-b"></div>
            
            {/* Day Headers */}
            {daysOfWeek.map(day => (
              <div 
                key={day.toISOString()} 
                className={cn(
                  "text-center py-1 border-b border-r font-medium text-sm sticky top-0 z-10 bg-background/90 backdrop-blur-sm",
                  isToday(day) && "bg-accent/20"
                )}
              >
                <div>{format(day, 'EEE')}</div>
                <div className={cn("text-xs", isToday(day) ? "text-primary font-semibold" : "text-muted-foreground")}>{format(day, 'd')}</div>
              </div>
            ))}

            {/* Time Column */}
            {timeSlots.map((time, hourIndex) => (
              <div 
                key={time} 
                className="sticky left-0 z-10 bg-background border-r text-[10px] text-muted-foreground text-right pr-1 pt-0.5"
                style={{ gridRowStart: hourIndex + 2 }} // +2 because headers are row 1
              >
                {format(parse(time, 'HH:mm', new Date()), 'ha')}
              </div>
            ))}
            
            {/* Grid Cells for events and lines */}
            {daysOfWeek.map((day, dayIndex) => (
              <div 
                key={`col-${day.toISOString()}`}
                className="col-start-${dayIndex + 2} row-start-2 row-span-24 relative" 
                style={{ gridColumnStart: dayIndex + 2 }}
              >
                {/* Vertical line */}
                {dayIndex < 6 && <div className="absolute top-0 bottom-0 right-0 w-px bg-border"></div>}
                {/* Event rendering will be absolutely positioned within this column relative to the whole grid area */}
              </div>
            ))}
            
            {/* Horizontal Hour Lines */}
            {timeSlots.map((_, hourIndex) => (
                 <div 
                    key={`hr-line-${hourIndex}`}
                    className="col-start-1 col-span-8 border-b"
                    style={{ gridRowStart: hourIndex + 2, zIndex: 0 }}
                 ></div>
            ))}


            {/* Absolutely Positioned Events Layer */}
            {/* This container spans across all day columns and time rows for placing events */}
            <div 
                className="col-start-2 col-span-7 row-start-2 row-span-24 relative"
                style={{ gridColumnStart: 2, gridColumnEnd: 9, gridRowStart: 2, gridRowEnd: 26}}
            >
              {events.map(event => {
                const pos = getEventPositionAndDimensions(event);
                if (!pos) return null;

                return (
                  <div
                    key={event.id}
                    className={cn(
                        "absolute rounded-md p-1 text-[10px] md:text-xs overflow-hidden border cursor-pointer shadow-sm",
                        "bg-primary/20 border-primary/50 hover:bg-primary/30 text-primary-foreground"
                    )}
                    style={{
                      top: `${pos.top}px`,
                      height: `${Math.max(pos.height, HOUR_HEIGHT_PX / 3)}px`, // min height for visibility
                      left: `calc(${(pos.dayIndex / 7) * 100}% + 1px)`, 
                      width: `calc(${(1 / 7) * 100}% - 2px)`, 
                      zIndex: 10, 
                    }}
                    onClick={() => onEventClick && onEventClick(event)}
                    title={`${event.title} (${event.startTime} - ${event.endTime})`}
                  >
                    <div className="font-semibold truncate">{event.emoji} {event.title}</div>
                    {(pos.height > 30 || event.startTime) && <div className="truncate">{event.startTime} - {event.endTime}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

