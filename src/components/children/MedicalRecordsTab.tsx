"use client";

import React, { useState } from "react";
import { MedicalRecord, createMedicalRecord, resolveMedicalRecord } from "@/lib/actions/medical";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { HeartPulse, PlusCircle, Thermometer, Pill, AlertTriangle, Syringe, Clock, CheckCircle2, FileText, Ban } from "lucide-react";
import { toast } from "sonner";

export default function MedicalRecordsTab({ 
  childId, 
  initialRecords,
  medicalProfile
}: { 
  childId: number; 
  initialRecords: MedicalRecord[];
  medicalProfile: any;
}) {
  const [records, setRecords] = useState<MedicalRecord[]>(initialRecords);
  
  // New record state
  const [isAdding, setIsAdding] = useState(false);
  const [newType, setNewType] = useState('enfermedad');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState(new Date().toTimeString().substring(0, 5));
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resolve record state
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const pendingRecords = records.filter(r => r.status === 'pending');
  const resolvedRecords = records.filter(r => r.status === 'resolved');

  const getTypeInfo = (type: string) => {
    switch(type) {
      case 'fiebre': return { icon: Thermometer, color: 'text-rose-500', bg: 'bg-rose-100', label: 'Fiebre' };
      case 'enfermedad': return { icon: HeartPulse, color: 'text-amber-500', bg: 'bg-amber-100', label: 'Enfermedad (Gripe, etc)' };
      case 'golpe': return { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-100', label: 'Golpe / Lesión' };
      case 'alergia': return { icon: Ban, color: 'text-red-500', bg: 'bg-red-100', label: 'Reacción Alérgica / Comida' };
      case 'medicamento': return { icon: Pill, color: 'text-blue-500', bg: 'bg-blue-100', label: 'Medicamento suministrado' };
      default: return { icon: Syringe, color: 'text-purple-500', bg: 'bg-purple-100', label: 'Otro' };
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return toast.error("La descripción es requerida");
    
    setIsSubmitting(true);
    const res = await createMedicalRecord({
      childId,
      date: newDate,
      time: newTime,
      type: newType,
      description: newDesc
    });
    
    if (res.success) {
      toast.success("Registro médico añadido con éxito");
      setIsAdding(false);
      setNewDesc('');
      
      // Update local state optimistic
      setRecords([{
        id: Date.now(),
        childId,
        date: newDate,
        time: newTime,
        type: newType,
        description: newDesc,
        status: 'pending',
        createdAt: new Date().toISOString()
      }, ...records]);
    } else {
      toast.error(res.error || "Error al añadir registro");
    }
    setIsSubmitting(false);
  };

  const handleResolveSubmit = async () => {
    if (!resolvingId) return;
    setIsResolving(true);
    
    const res = await resolveMedicalRecord(resolvingId, resolveNotes);
    
    if (res.success) {
      toast.success("Caso cerrado exitosamente");
      setRecords(records.map(r => r.id === resolvingId ? {
        ...r, 
        status: 'resolved', 
        resolvedDate: new Date().toISOString().split('T')[0],
        resolutionNotes: resolveNotes
      } : r));
      setResolvingId(null);
      setResolveNotes('');
    } else {
      toast.error(res.error || "Error al cerrar el caso");
    }
    setIsResolving(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-rose-500" />
            Expediente Médico
          </h3>
          <p className="text-sm text-slate-500">Registra incidencias de salud, alergias o suministros de medicamentos.</p>
        </div>
        
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="bg-rose-600 hover:bg-rose-700 text-white gap-2">
            <PlusCircle className="h-4 w-4" /> Nuevo Registro
          </Button>
        )}
      </div>

      {/* Static Medical Profile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Alergias</p>
          <p className="font-semibold text-rose-700 text-sm">{medicalProfile?.allergies || 'Ninguna registrada'}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Condiciones Médicas</p>
          <p className="font-semibold text-amber-700 text-sm">{medicalProfile?.conditions || 'Ninguna registrada'}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Medicamentos Autorizados</p>
          <p className="font-semibold text-blue-700 text-sm">{medicalProfile?.authorizedMeds || 'Ninguno'}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Vacunas</p>
          <p className="font-semibold text-emerald-700 text-sm">{medicalProfile?.vaccines || 'No especificadas'}</p>
        </div>
      </div>

      {/* Add New Record Form */}
      {isAdding && (
        <div className="bg-white border rounded-xl p-5 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h4 className="font-semibold text-slate-800 mb-4 border-b pb-2">Añadir nueva incidencia</h4>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Incidencia</Label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={newType} 
                  onChange={e => setNewType(e.target.value)}
                >
                  <option value="enfermedad">Enfermedad (Gripe, Malestar...)</option>
                  <option value="fiebre">Fiebre</option>
                  <option value="golpe">Golpe / Lesión</option>
                  <option value="alergia">Reacción Alérgica / Comida</option>
                  <option value="medicamento">Suministro de Medicamento</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Hora</Label>
                <Input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Descripción de lo sucedido</Label>
              <textarea 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Ej. A Liam le dio gripe y le duele la cabeza..."
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                required
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Cancelar</Button>
              <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar y dejar pendiente'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Active Records */}
      {pendingRecords.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            Casos Pendientes de Recuperación ({pendingRecords.length})
          </h4>
          
          <div className="grid gap-3 sm:grid-cols-2">
            {pendingRecords.map(record => {
              const info = getTypeInfo(record.type);
              const TypeIcon = info.icon;
              return (
                <div key={record.id} className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${info.bg.replace('100', '400')}`}></div>
                  
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${info.bg}`}>
                        <TypeIcon className={`h-4 w-4 ${info.color}`} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{info.label}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-xs font-medium bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100">
                      <Clock className="h-3 w-3" />
                      {record.date} • {record.time}
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-700 leading-relaxed font-medium mb-4">{record.description}</p>
                  
                  <div className="flex justify-end pt-3 border-t border-rose-100">
                    <Button 
                      size="sm" 
                      onClick={() => setResolvingId(record.id)}
                      className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-0"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      Marcar como recuperado
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* History */}
      {resolvedRecords.length > 0 && (
        <div className="space-y-3 pt-6">
          <h4 className="font-semibold text-slate-800 text-sm">Historial Médico Resuelto</h4>
          
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Fecha y Tipo</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Resolución</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {resolvedRecords.map(record => {
                  const info = getTypeInfo(record.type);
                  const TypeIcon = info.icon;
                  return (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 align-top whitespace-nowrap">
                        <div className="flex items-center gap-2 mb-1">
                          <TypeIcon className={`h-4 w-4 ${info.color}`} />
                          <span className="font-semibold text-slate-700">{info.label}</span>
                        </div>
                        <span className="text-xs text-slate-500">{record.date} • {record.time}</span>
                      </td>
                      <td className="px-4 py-3 align-top text-slate-700 max-w-xs">
                        {record.description}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="text-xs text-emerald-600 font-semibold mb-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Recuperado el {record.resolvedDate}
                        </div>
                        {record.resolutionNotes && (
                          <div className="flex items-start gap-1.5 text-slate-600 text-sm mt-1.5 bg-slate-50 p-2 rounded-md border border-slate-100">
                            <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0 text-slate-400" />
                            <p className="italic">{record.resolutionNotes}</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {records.length === 0 && !isAdding && (
        <div className="text-center py-12 bg-slate-50 border border-dashed rounded-xl">
          <HeartPulse className="h-10 w-10 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No hay registros médicos en el expediente.</p>
          <p className="text-slate-400 text-sm mt-1">Aquí aparecerán todas las incidencias de salud del niño.</p>
        </div>
      )}

      {/* Resolve Dialog */}
      <Dialog open={!!resolvingId} onOpenChange={(open) => !open && setResolvingId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Finalizar Caso Médico</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-slate-600">
              Estás marcando este caso como resuelto. ¿Deseas agregar alguna observación final (opcional)?
            </p>
            <div className="space-y-2">
              <Label>Observación de recuperación (Ej. Llegó sano al otro día)</Label>
              <textarea 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Opcional..."
                value={resolveNotes}
                onChange={e => setResolveNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolvingId(null)}>Cancelar</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleResolveSubmit} disabled={isResolving}>
              {isResolving ? 'Guardando...' : 'Confirmar Recuperación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
