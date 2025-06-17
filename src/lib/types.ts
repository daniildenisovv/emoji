
export interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  emoji: string;
  hours: number; // This will be calculated from startTime and endTime
  startTime?: string; // e.g., "09:00"
  endTime?: string;   // e.g., "17:30"
  description?: string;
}

export type CalendarDisplayMode = 'day' | 'week' | 'month';
