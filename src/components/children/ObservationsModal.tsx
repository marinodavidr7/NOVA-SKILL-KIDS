"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquare, User } from "lucide-react";

export default function ObservationsModal({ parsedEvals }: { parsedEvals: any[] }) {
  const [open, setOpen] = useState(false);
  
  const evaluationsWithObs = parsedEvals.filter(ev => ev.observations);
  
  if (evaluationsWithObs.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button variant="outline" className="w-full text-indigo-700 border-indigo-200 hover:bg-indigo-50 mt-2 rounded-xl border-dashed">
            <MessageSquare className="w-4 h-4 mr-2" />
            Ver Historial de Observaciones ({evaluationsWithObs.length})
          </Button>
        }
      />
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-indigo-900 font-bold">Historial de Observaciones</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {evaluationsWithObs.map(ev => (
            <div key={ev.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 bg-white shadow-sm border border-slate-100 px-2.5 py-1 rounded-md">
                  🗓️ {new Date(ev.date).toLocaleDateString()}
                </span>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <span className="bg-slate-200 p-1 rounded-full"><User className="h-3 w-3" /></span>
                  Evaluado por: {ev.evaluator}
                </span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed bg-white p-3.5 rounded-lg border border-slate-100 shadow-sm">
                {ev.observations}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
