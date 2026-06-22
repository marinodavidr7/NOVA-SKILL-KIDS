'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardList, PlusCircle, Trash2, Calendar, UserCheck, UserX, Info, Loader2 } from 'lucide-react';
import { createParentReport, deleteParentReport } from '@/lib/actions/parentReports';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ParentReportsCardProps {
  reports: any[];
  parentId: number;
  events: any[]; // For the events dropdown
}

export default function ParentReportsCard({ reports, parentId, events }: ParentReportsCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Form State
  const [type, setType] = useState('Reunión');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventId, setEventId] = useState('none');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attended, setAttended] = useState('1'); // '1' = Yes, '0' = No

  const handleOpen = () => {
    setType('Reunión');
    setDate(new Date().toISOString().split('T')[0]);
    setEventId('none');
    setTitle('');
    setDescription('');
    setAttended('1');
    setIsOpen(true);
  };

  const handleEventChange = (val: string | null) => {
    setEventId(val || 'none');
    if (val !== 'none') {
      const selectedEvent = events.find(e => String(e.id) === val);
      if (selectedEvent) {
        setTitle(selectedEvent.title);
        setDate(selectedEvent.date);
      }
    } else {
      setTitle('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await createParentReport({
        parentId,
        eventId: eventId !== 'none' ? parseInt(eventId) : null,
        type,
        date,
        title,
        description,
        attended: type === 'Reunión' ? (attended === '1' ? true : false) : null
      });

      if (res.success) {
        toast.success('Registro guardado correctamente');
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || 'Error al guardar el registro');
      }
    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este registro?')) {
      const res = await deleteParentReport(id, parentId);
      if (res.success) {
        toast.success('Registro eliminado');
        router.refresh();
      } else {
        toast.error(res.error || 'Error al eliminar');
      }
    }
  };

  return (
    <>
      <Card className="border-0 shadow-sm border-t-4 border-t-violet-600 mt-6">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2 text-violet-700 font-bold">
            <ClipboardList className="h-5 w-5" />
            <span>Reuniones y Reportes</span>
          </div>
          <Button onClick={handleOpen} variant="outline" size="sm" className="h-8 text-violet-600 border-violet-200 hover:bg-violet-50">
            <PlusCircle className="h-4 w-4 mr-1" />
            Registrar
          </Button>
        </CardHeader>
        <CardContent>
          {reports.length > 0 ? (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="pt-1">
                      {report.type === 'Reunión' ? (
                        report.attended ? (
                          <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg" title="Asistió">
                            <UserCheck className="h-5 w-5" />
                          </div>
                        ) : (
                          <div className="bg-rose-100 text-rose-500 p-2 rounded-lg" title="No Asistió">
                            <UserX className="h-5 w-5" />
                          </div>
                        )
                      ) : (
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg" title="Reporte">
                          <Info className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{report.type}</span>
                        {report.type === 'Reunión' && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${report.attended ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {report.attended ? 'Asistió' : 'Ausente'}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-800">{report.title}</h4>
                      {report.description && (
                        <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">{report.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(report.date).toLocaleDateString()}</span>
                        {report.eventTitle && (
                          <span className="bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded ml-1 truncate max-w-[200px]" title={report.eventTitle}>
                            Evento: {report.eventTitle}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(report.id)} className="h-8 w-8 text-rose-500 hover:bg-rose-100" title="Eliminar registro">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>No hay reuniones o reportes registrados para este tutor.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Registrar Reunión o Reporte</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Registro</Label>
                <Select value={type} onValueChange={(v) => setType(v || '')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Reunión">Reunión</SelectItem>
                    <SelectItem value="Reporte">Reporte de Conducta/Notas</SelectItem>
                    <SelectItem value="Llamada">Llamada Telefónica</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
              </div>
            </div>

            {type === 'Reunión' && (
              <div className="space-y-2">
                <Label>Vincular a Evento del Calendario (Opcional)</Label>
                <Select value={eventId} onValueChange={handleEventChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Evento..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno / Reunión Privada</SelectItem>
                    {events.map(e => (
                      <SelectItem key={e.id} value={String(e.id)}>{e.title} ({new Date(e.date).toLocaleDateString()})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Título del Registro</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej. Reunión de Padres de Familia" required />
            </div>

            {type === 'Reunión' && (
              <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <Label className="mb-2 block text-slate-700">¿Asistió a la reunión?</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="attended" value="1" checked={attended === '1'} onChange={() => setAttended('1')} className="accent-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">Sí, asistió</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="attended" value="0" checked={attended === '0'} onChange={() => setAttended('0')} className="accent-rose-600" />
                    <span className="text-sm font-medium text-rose-700">No asistió</span>
                  </label>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Descripción o Notas Adicionales (Opcional)</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Detalles de lo conversado, acuerdos, etc." />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Guardar Registro
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
