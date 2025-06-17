
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CalendarEvent } from "@/lib/types";
import { EMOJI_OPTIONS } from "@/lib/emojis";
import { useEffect } from "react";
import { format } from "date-fns";

const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  emoji: z.string().min(1, "Emoji is required"),
  date: z.date(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  description: z.string().max(500, "Description too long").optional(),
}).refine(data => {
  if (!data.date || !data.startTime || !data.endTime) return true; // Validation handled by individual fields

  const startDateTime = new Date(data.date);
  const [startHours, startMinutes] = data.startTime.split(':').map(Number);
  startDateTime.setHours(startHours, startMinutes, 0, 0);

  const endDateTime = new Date(data.date);
  const [endHours, endMinutes] = data.endTime.split(':').map(Number);
  endDateTime.setHours(endHours, endMinutes, 0, 0);

  return endDateTime.getTime() > startDateTime.getTime();
}, {
  message: "End time must be after start time",
  path: ["endTime"], 
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface AddEventFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddEvent: (event: Omit<CalendarEvent, "id">) => void;
  selectedDate: Date | undefined;
}

export function AddEventForm({
  isOpen,
  onOpenChange,
  onAddEvent,
  selectedDate,
}: AddEventFormProps) {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      emoji: EMOJI_OPTIONS[0]?.value || "",
      date: selectedDate || new Date(),
      startTime: "09:00",
      endTime: "10:00",
      description: "",
    },
  });

  useEffect(() => {
    if (selectedDate) {
      form.reset({
        title: "",
        emoji: EMOJI_OPTIONS[0]?.value || "",
        date: selectedDate,
        startTime: "09:00",
        endTime: "10:00",
        description: "",
      });
    }
  }, [selectedDate, form, isOpen]);

  function onSubmit(data: EventFormValues) {
    const { date, startTime, endTime, title, emoji, description } = data;

    const startDateTime = new Date(date);
    const [startHoursNum, startMinutesNum] = startTime.split(':').map(Number);
    startDateTime.setHours(startHoursNum, startMinutesNum, 0, 0);

    const endDateTime = new Date(date);
    const [endHoursNum, endMinutesNum] = endTime.split(':').map(Number);
    endDateTime.setHours(endHoursNum, endMinutesNum, 0, 0);

    const durationMs = endDateTime.getTime() - startDateTime.getTime();
    const calculatedHours = durationMs / (1000 * 60 * 60);

    onAddEvent({
      title,
      emoji,
      date,
      startTime,
      endTime,
      hours: parseFloat(calculatedHours.toFixed(1)),
      description,
    });
    form.reset(); 
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Add New Event</DialogTitle>
          {selectedDate && (
            <DialogDescription>
              For date: {format(selectedDate, "PPP")}
            </DialogDescription>
          )}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Team Meeting" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emoji"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emoji</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an emoji" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EMOJI_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Discuss project updates..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Event</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
