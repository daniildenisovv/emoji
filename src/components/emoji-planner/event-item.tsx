"use client";

import type { CalendarEvent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { CardDescription } from '../ui/card';

interface EventItemProps {
  event: CalendarEvent;
  onDelete: (eventId: string) => void;
}

export function EventItem({ event, onDelete }: EventItemProps) {
  return (
    <div className="flex items-start justify-between py-3 px-1 border-b last:border-b-0 hover:bg-muted/30 transition-colors rounded-sm group">
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-1" aria-hidden="true">{event.emoji}</span>
        <div>
          <p className="font-semibold text-base leading-tight">{event.title}</p>
          <p className="text-sm text-muted-foreground">{event.hours} hour(s)</p>
          {event.description && <CardDescription className="text-xs mt-1">{event.description}</CardDescription>}
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => onDelete(event.id)} 
        aria-label={`Delete event ${event.title}`}
        className="opacity-50 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
