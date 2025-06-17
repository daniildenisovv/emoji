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
  hours: z.coerce.number().min(0.1, "Hours must be at least 0.1").max(24, "Hours cannot exceed 24"),
  date: z.date(),
  description: z.string().max(500, "Description too long").optional(),
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
      hours: 1,
      date: selectedDate || new Date(),
      description: "",
    },
  });

  useEffect(() => {
    if (selectedDate) {
      form.reset({
        title: "",
        emoji: EMOJI_OPTIONS[0]?.value || "",
        hours: 1,
        date: selectedDate,
        description: "",
      });
    }
  }, [selectedDate, form, isOpen]);

  function onSubmit(data: EventFormValues) {
    onAddEvent(data);
    form.reset(); // Reset form after submission
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
            <div className="grid grid-cols-2 gap-4">
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
              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="2.5" {...field} />
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
