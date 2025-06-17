
"use client";

import { useState } from "react";
import type { CalendarEvent, CalendarDisplayMode } from "@/lib/types";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EMOJI_OPTIONS } from "@/lib/emojis";

interface EmojiSummaryProps {
  events: CalendarEvent[];
}

interface EmojiHourSummaryItem {
  hours: number;
  label: string; // Full label like "💻 Work"
}
interface EmojiHourSummary {
  [emoji: string]: EmojiHourSummaryItem;
}

export function EmojiSummary({ events }: EmojiSummaryProps) {
 const [view, setView] = useState<CalendarDisplayMode>("week");

  const filterEventsByView = (currentEvents: CalendarEvent[], currentView: CalendarDisplayMode): CalendarEvent[] => {
    const now = new Date();
    let startOfPeriod: Date;
    let endOfPeriod: Date;

    switch (currentView) {
      case "day":
        startOfPeriod = startOfDay(now);
        endOfPeriod = endOfDay(now);
        break;
      case "week":
        startOfPeriod = startOfWeek(now, { weekStartsOn: 1 }); 
        endOfPeriod = endOfWeek(now, { weekStartsOn: 1 }); 
        break;
      case "month":
        startOfPeriod = startOfMonth(now);
        endOfPeriod = endOfMonth(now);
        break;
      default:
        // If view is somehow invalid, default to showing all events for the current week to be safe
        startOfPeriod = startOfWeek(now, { weekStartsOn: 1 });
        endOfPeriod = endOfWeek(now, { weekStartsOn: 1 });
    }

    return currentEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= startOfPeriod && eventDate <= endOfPeriod;
    });
  };

  const filteredEvents = filterEventsByView(events, view);

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
        <CardDescription>{`Total scheduled hours for the current ${view}: ${totalHours.toFixed(1)} hrs`}</CardDescription>
      </CardHeader>
      <CardContent>
        {filteredEvents.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No events scheduled for this {view}.</p>
        ) : (
          <div className="space-y-2 pt-2">
            {Object.entries(emojiSummaryData)
              .sort(([, a], [, b]) => b.hours - a.hours) // Sort by hours descending
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
