export interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  emoji: string;
  hours: number;
  description?: string;
}
