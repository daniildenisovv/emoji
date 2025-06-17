"use client";

import type { CalendarEvent } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EMOJI_OPTIONS } from "@/lib/emojis";

interface EmojiSummaryProps {
  events: CalendarEvent[];
}

interface EmojiHourSummary {
  [emoji: string]: {
    hours: number;
    label: string;
  };
}

export function EmojiSummary({ events }: EmojiSummaryProps) {
  const summary = events.reduce<EmojiHourSummary>((acc, event) => {
    if (!acc[event.emoji]) {
      const emojiOption = EMOJI_OPTIONS.find(opt => opt.value === event.emoji);
      acc[event.emoji] = { hours: 0, label: emojiOption ? emojiOption.label.split(" ")[1] || "Event" : "Event" };
    }
    acc[event.emoji].hours += event.hours;
    return acc;
  }, {});

  const sortedSummary = Object.entries(summary).sort(([, a], [, b]) => b.hours - a.hours);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Emoji Hour Summary</CardTitle>
        <CardDescription>Total scheduled hours by emoji category.</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedSummary.length === 0 ? (
          <p className="text-muted-foreground">No events scheduled yet. Add some events to see your summary!</p>
        ) : (
          <ul className="space-y-3">
            {sortedSummary.map(([emoji, data]) => (
              <li key={emoji} className="flex items-center justify-between p-3 bg-muted/50 rounded-md shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">{emoji}</span>
                  <span className="font-medium text-foreground">{data.label}</span>
                </div>
                <span className="font-semibold text-primary">{data.hours.toFixed(1)} hrs</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
