"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarDays, Stethoscope, PartyPopper, GraduationCap, MapPin, Clock, AlignLeft } from "lucide-react";
import DeleteEventButton from "@/components/dashboard/DeleteEventButton";

const eventIcons = [CalendarDays, Stethoscope, PartyPopper, GraduationCap];

export default function EventsList({ dbEvents }: { dbEvents: any[] }) {
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  if (dbEvents.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500 text-sm">
        <CalendarDays className="h-8 w-8 mx-auto text-slate-300 mb-2" />
        No hay eventos programados.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 pt-2">
        {dbEvents.map((event: any, idx: number) => {
          const dateObj = new Date(`${event.date}T12:00:00`);
          const day = dateObj.getDate().toString();
          const month = dateObj.toLocaleString('es-MX', { month: 'short' }).substring(0, 3);
          
          const EventIcon = eventIcons[idx % eventIcons.length];
          
          // Rotate colors
          const colors = [
            { bg: "bg-violet-50", text: "text-violet-700", accent: "bg-violet-500" },
            { bg: "bg-emerald-50", text: "text-emerald-700", accent: "bg-emerald-500" },
            { bg: "bg-amber-50", text: "text-amber-700", accent: "bg-amber-500" },
            { bg: "bg-blue-50", text: "text-blue-700", accent: "bg-blue-500" },
          ];
          const color = colors[idx % colors.length];

          const isBirthday = typeof event.id === 'string' && event.id.includes('bday');

          return (
            <div
              key={event.id}
              onClick={() => setSelectedEvent({ ...event, color, EventIcon, isBirthday, day, month })}
              className="group flex items-start gap-3 rounded-lg p-2.5 transition-colors duration-200 hover:bg-slate-50 relative cursor-pointer"
            >
              <div
                className={`flex h-13 w-13 shrink-0 flex-col items-center justify-center rounded-xl ${color.bg} transition-transform duration-200 group-hover:scale-105`}
                style={{ minWidth: '3.25rem', minHeight: '3.25rem' }}
              >
                <span className={`text-lg font-extrabold leading-none ${color.text}`}>
                  {day}
                </span>
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${color.text} opacity-80 mt-1`}>
                  {month}
                </span>
              </div>

              <div className="flex-1 min-w-0 pt-0.5 pr-6">
                <div className="flex items-center gap-1.5">
                  <EventIcon className={`h-3.5 w-3.5 shrink-0 ${color.text}`} />
                  <p className="text-sm font-semibold truncate text-slate-800">
                    {event.title}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {event.time} • {event.description}
                </p>
              </div>

              {!isBirthday && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <DeleteEventButton eventId={event.id} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-[425px]">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${selectedEvent.color.bg}`}>
                  <selectedEvent.EventIcon className={`h-8 w-8 ${selectedEvent.color.text}`} />
                </div>
                <DialogTitle className="text-center text-xl">{selectedEvent.title}</DialogTitle>
              </DialogHeader>
              
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <CalendarDays className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Fecha y Hora</p>
                    <p className="text-sm text-slate-800 font-semibold">{selectedEvent.day} {selectedEvent.month.toUpperCase()} - {selectedEvent.time}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <AlignLeft className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Detalles</p>
                    <p className="text-sm text-slate-800 mt-0.5 leading-relaxed">{selectedEvent.description}</p>
                  </div>
                </div>
                
                {selectedEvent.isBirthday && (
                  <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <PartyPopper className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="text-xs text-amber-600 font-medium">Cumpleaños</p>
                      <p className="text-sm text-amber-800 font-semibold">¡Felicítalo/a en su día especial!</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
