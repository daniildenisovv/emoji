
"use client";

import { useState } from "react";
import type { CalendarEvent, CalendarDisplayMode } from "@/lib/types";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay, format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EMOJI_OPTIONS } from "@/lib/emojis";

interface EmojiSummaryProps {
  events: CalendarEvent[];
  selectedDate: Date | undefined;
}

interface EmojiHourSummaryItem {
  hours: number;
  label: string; 
}
interface EmojiHourSummary {
  [emoji: string]: EmojiHourSummaryItem;
}

export function EmojiSummary({ events, selectedDate }: EmojiSummaryProps) {
 const [view, setView] = useState<CalendarDisplayMode>("week");

  const filterEventsByView = (currentEvents: CalendarEvent[], currentView: CalendarDisplayMode, referenceDate: Date): CalendarEvent[] => {
    let startOfPeriod: Date;
    let endOfPeriod: Date;

    switch (currentView) {
      case "day":
        startOfPeriod = startOfDay(referenceDate);
        endOfPeriod = endOfDay(referenceDate);
        break;
      case "week":
        startOfPeriod = startOfWeek(referenceDate, { weekStartsOn: 1 }); 
        endOfPeriod = endOfWeek(referenceDate, { weekStartsOn: 1 }); 
        break;
      case "month":
        startOfPeriod = startOfMonth(referenceDate);
        endOfPeriod = endOfMonth(referenceDate);
        break;
      default:
        startOfPeriod = startOfWeek(referenceDate, { weekStartsOn: 1 });
        endOfPeriod = endOfWeek(referenceDate, { weekStartsOn: 1 });
    }

    return currentEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= startOfPeriod && eventDate <= endOfPeriod;
    });
  };

  const effectiveDate = selectedDate || new Date();
  const filteredEvents = filterEventsByView(events, view, effectiveDate);

  const emojiSummaryData = filteredEvents.reduce<EmojiHourSummary>((acc, event) => {
    const emojiKey = event.emoji;
    const emojiOption = EMOJI_OPTIONS.find(opt => opt.value === emojiKey);

    if (!acc[emojiKey]) {
      acc[emojiKey] = {
        hours: 0,
        label: emojiOption ? emojiOption.label : emojiKey, 
      };
    }
    acc[emojiKey].hours += event.hours;
    return acc;
  }, {});

  const totalHours = filteredEvents.reduce((sum, event) => sum + event.hours, 0);
  
  const getPeriodString = (currentView: CalendarDisplayMode, refDate: Date): string => {
    switch (currentView) {
      case "day":
        return `for ${format(refDate, 'PPP')}`;
      case "week":
        const start = startOfWeek(refDate, { weekStartsOn: 1 });
        const end = endOfWeek(refDate, { weekStartsOn: 1 });
        if (format(start, 'MMM') === format(end, 'MMM')) {
          return `for week of ${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
        }
        return `for week of ${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
      case "month":
        return `for ${format(refDate, 'MMMM yyyy')}`;
      default:
        return "";
    }
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-headline">Summary</CardTitle>
          <Select value={view} onValueChange={(value: CalendarDisplayMode) => setView(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardDescription>{`Total hours ${getPeriodString(view, effectiveDate)}: ${totalHours.toFixed(1)} hrs`}</CardDescription>
      </CardHeader>
      <CardContent>
        {filteredEvents.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No events scheduled for this {view} {getPeriodString(view, effectiveDate).replace('for ', '')}.</p>
        ) : (
          <div className="space-y-2 pt-2">
            {Object.entries(emojiSummaryData)
              .sort(([, a], [, b]) => b.hours - a.hours) 
              .map(([emoji, data]) => (
              <div key={emoji} className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-b-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg" aria-hidden="true">{emoji}</span>
                  <span>{(data.label).replace(emoji, '').trim()}</span>
                </div>
                <span className="font-medium text-base">{data.hours.toFixed(1)} hrs</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
