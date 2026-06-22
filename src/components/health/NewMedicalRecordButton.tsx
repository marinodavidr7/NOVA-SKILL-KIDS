"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { PlusCircle, Loader2 } from "lucide-react";
import { createMedicalRecord } from "@/lib/actions/medical";
import { toast } from "sonner";

interface ChildItem {
  id: number;
  firstName: string;
  lastName: string;
}

export default function NewMedicalRecordButton({
  childrenList,
}: {
  childrenList: ChildItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [newType, setNewType] = useState("enfermedad");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newTime, setNewTime] = useState(new Date().toTimeString().substring(0, 5));
  const [newDesc, setNewDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChildId) return toast.error("Debe seleccionar un niño/a");
    if (!newDesc.trim()) return toast.error("La descripción es requerida");

    setIsSubmitting(true);
    try {
      const res = await createMedicalRecord({
        childId: parseInt(selectedChildId),
        date: newDate,
        time: newTime,
        type: newType,
        description: newDesc,
      });

      if (res.success) {
        toast.success("Expediente / incidencia médica añadida con éxito");
        setIsOpen(false);
        setNewDesc("");
        setSelectedChildId("");
      } else {
        toast.error(res.error || "Error al registrar la incidencia");
      }
    } catch (err) {
      toast.error("Error al conectar con el servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-rose-600 hover:bg-rose-700 text-white gap-2 font-semibold shadow-sm rounded-xl px-4 py-2 text-sm transition-all"
      >
        <PlusCircle className="h-4.5 w-4.5" /> Registrar Incidencia / Expediente
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl bg-white border border-slate-100 p-6 shadow-2xl">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-xl font-bold text-slate-800 tracking-tight">
              Registrar Incidencia de Salud
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              Ingresa los detalles médicos del niño/a para incorporarlos a su expediente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Selección de Niño */}
            <div className="space-y-1.5">
              <Label htmlFor="childId" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Seleccionar Niño / Niña
              </Label>
              <select
                id="childId"
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                required
              >
                <option value="">-- Selecciona un niño/a --</option>
                {childrenList.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.firstName} {child.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Fecha */}
              <div className="space-y-1.5">
                <Label htmlFor="date" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Fecha
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full h-10"
                  required
                />
              </div>

              {/* Hora */}
              <div className="space-y-1.5">
                <Label htmlFor="time" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Hora
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full h-10"
                  required
                />
              </div>
            </div>

            {/* Tipo de Incidencia */}
            <div className="space-y-1.5">
              <Label htmlFor="type" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tipo de Incidencia
              </Label>
              <select
                id="type"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                required
              >
                <option value="enfermedad">Enfermedad (Gripe, etc.)</option>
                <option value="fiebre">Fiebre</option>
                <option value="golpe">Golpe / Lesión</option>
                <option value="alergia">Reacción Alérgica / Comida</option>
                <option value="medicamento">Medicamento suministrado</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            {/* Descripción */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Descripción / Detalles
              </Label>
              <textarea
                id="description"
                placeholder="Describe los síntomas, temperatura, medicamentos aplicados o detalles de la lesión..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className="rounded-lg text-slate-500 hover:bg-slate-100"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Registrando...
                  </>
                ) : (
                  "Registrar en Expediente"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
