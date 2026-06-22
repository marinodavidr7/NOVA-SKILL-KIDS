'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserMinus, Calendar as CalendarIcon, FileText, Archive, FileQuestion, Search, Upload, X, Loader2, CheckCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { getActiveChildrenForDischarge, getDischargedChildren, registerDischarge } from '@/lib/actions/children';

interface Child {
  id: number;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  classroomName: string | null;
}

interface DischargedChild {
  id: number;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  classroomName: string | null;
  dismissalReason: string | null;
  dismissalDate: string | null;
  dismissalReport: string | null;
}

export default function DischargesPage() {
  const [activeChildren, setActiveChildren] = useState<Child[]>([]);
  const [dischargedChildren, setDischargedChildren] = useState<DischargedChild[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  // Form states
  const [dismissalReason, setDismissalReason] = useState('');
  const [dismissalDate, setDismissalDate] = useState('');
  const [dismissalReport, setDismissalReport] = useState('');
  const [dismissalFile, setDismissalFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [active, discharged] = await Promise.all([
        getActiveChildrenForDischarge(),
        getDischargedChildren()
      ]);
      setActiveChildren(active);
      setDischargedChildren(discharged);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar los datos de los niños');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectChild = (child: Child) => {
    setSelectedChild(child);
    setDismissalReason('');
    setDismissalDate(new Date().toISOString().split('T')[0]); // Default to today's date
    setDismissalReport('');
    setDismissalFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDismissalFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissalFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCancel = () => {
    setSelectedChild(null);
    setDismissalReason('');
    setDismissalDate('');
    setDismissalReport('');
    setDismissalFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild) return;

    if (!dismissalReason) {
      toast.error('Por favor seleccione un motivo de salida');
      return;
    }

    if (!dismissalDate) {
      toast.error('Por favor ingrese la fecha de egreso');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('dismissalReason', dismissalReason);
      formData.append('dismissalDate', dismissalDate);
      formData.append('dismissalReport', dismissalReport);
      if (dismissalFile) {
        formData.append('dismissalFile', dismissalFile);
      }

      await registerDischarge(selectedChild.id, formData);
      toast.success(`Egreso registrado correctamente para ${selectedChild.firstName} ${selectedChild.lastName}`);
      
      // Reset form and reload
      setSelectedChild(null);
      setDismissalReason('');
      setDismissalDate('');
      setDismissalReport('');
      setDismissalFile(null);
      await loadData();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error al registrar el egreso del niño');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredChildren = activeChildren.filter(child => {
    const fullName = `${child.firstName} ${child.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || 
           (child.classroomName && child.classroomName.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'graduacion': return 'Graduación / Cambio de etapa';
      case 'mudanza': return 'Mudanza familiar';
      case 'economico': return 'Motivos económicos';
      case 'insatisfaccion': return 'Insatisfacción con el servicio';
      case 'salud': return 'Motivos de salud';
      case 'otros': return 'Otros';
      default: return reason;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/20">
            <UserMinus className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Egreso del Niño</h1>
            <p className="text-sm text-slate-500 mt-1">
              Registro de salida, informes finales y archivo histórico.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Active Children Selector */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Buscar niño..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 rounded-xl border-slate-200"
                />
              </div>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Seleccione un niño</p>
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mb-2" />
                    <span className="text-xs">Cargando niños...</span>
                  </div>
                ) : filteredChildren.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No se encontraron niños activos
                  </div>
                ) : (
                  filteredChildren.map((child) => (
                    <div
                      key={child.id}
                      onClick={() => handleSelectChild(child)}
                      className={`p-3 border rounded-xl flex items-center gap-3 cursor-pointer transition-all ${
                        selectedChild?.id === child.id
                          ? 'border-rose-500 bg-rose-50/40 ring-1 ring-rose-500/30'
                          : 'border-slate-100 hover:bg-slate-50 transition-colors'
                      }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={child.photoUrl || undefined} className="object-cover" />
                        <AvatarFallback className="bg-slate-100 text-slate-700 font-semibold text-sm">
                          {child.firstName[0]}{child.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm truncate ${selectedChild?.id === child.id ? 'text-rose-900' : 'text-slate-800'}`}>
                          {child.firstName} {child.lastName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">Aula: {child.classroomName || 'Sin asignar'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Discharge Form */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200 shadow-sm h-full">
            <CardContent className="p-6">
              {!selectedChild ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                    <UserMinus className="h-8 w-8 text-slate-300" />
                  </div>
                  <div>
                    <h4 className="text-slate-700 font-semibold">Seleccione un niño</h4>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      Haga clic en un niño de la lista de la izquierda para comenzar el formulario de egreso oficial.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Selected child header card */}
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <Avatar className="h-12 w-12 border border-white shadow-sm">
                      <AvatarImage src={selectedChild.photoUrl || undefined} className="object-cover" />
                      <AvatarFallback className="bg-slate-200 text-slate-700 font-semibold">
                        {selectedChild.firstName[0]}{selectedChild.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">Niño Seleccionado</span>
                      <h3 className="font-bold text-slate-800 text-base mt-0.5">
                        {selectedChild.firstName} {selectedChild.lastName}
                      </h3>
                      <p className="text-xs text-slate-500">Aula: {selectedChild.classroomName || 'Sin asignar'}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-slate-400" />
                      Formulario de Egreso
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-slate-700 font-medium flex items-center gap-2">
                          <FileQuestion className="h-4 w-4 text-slate-400" /> Motivo de salida
                        </Label>
                        <select 
                          value={dismissalReason}
                          onChange={(e) => setDismissalReason(e.target.value)}
                          required
                          className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Seleccione el motivo...</option>
                          <option value="graduacion">Graduación / Cambio de etapa</option>
                          <option value="mudanza">Mudanza familiar</option>
                          <option value="economico">Motivos económicos</option>
                          <option value="insatisfaccion">Insatisfacción con el servicio</option>
                          <option value="salud">Motivos de salud</option>
                          <option value="otros">Otros</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-700 font-medium flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-slate-400" /> Fecha de egreso
                        </Label>
                        <Input 
                          type="date" 
                          value={dismissalDate}
                          onChange={(e) => setDismissalDate(e.target.value)}
                          required
                          className="rounded-xl border-slate-200" 
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-slate-700 font-medium flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-400" /> Informe final
                        </Label>
                        <textarea 
                          value={dismissalReport}
                          onChange={(e) => setDismissalReport(e.target.value)}
                          required
                          className="flex min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                          placeholder="Redacte el informe final sobre el desarrollo, comportamiento y observaciones del niño durante su estancia..."
                        ></textarea>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-slate-700 font-medium flex items-center gap-2">
                          <Archive className="h-4 w-4 text-slate-400" /> Archivo histórico
                        </Label>
                        
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden" 
                        />
                        
                        {!dismissalFile ? (
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-slate-700">Adjuntar documentos al archivo histórico</p>
                            <p className="text-xs text-slate-500 mt-1">Haga clic para explorar archivos (PDF, DOCX, Imágenes)</p>
                          </div>
                        ) : (
                          <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-2 bg-rose-100 rounded-lg text-rose-600 shrink-0">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-800 truncate">{dismissalFile.name}</p>
                                <p className="text-xs text-slate-400">{(dismissalFile.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <Button 
                              type="button"
                              variant="ghost" 
                              size="icon"
                              onClick={handleRemoveFile}
                              className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full h-8 w-8"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end gap-3 mt-6">
                      <Button type="button" variant="outline" onClick={handleCancel} className="rounded-xl">Cancelar</Button>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Registrando...
                          </>
                        ) : (
                          <>
                            <UserMinus className="h-4 w-4" />
                            Registrar Egreso
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Discharged Children History Section */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Archive className="h-5 w-5 text-slate-400" />
              Historial de Niños Egresados
            </h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              {dischargedChildren.length} egresos
            </span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <span className="text-sm">Cargando historial...</span>
            </div>
          ) : dischargedChildren.length === 0 ? (
            <div className="text-center py-12 text-slate-400 border border-dashed border-slate-100 rounded-xl bg-slate-50/50">
              <CheckCircle2 className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium">No hay egresos registrados</p>
              <p className="text-xs text-slate-500 mt-1">Todos los niños matriculados continúan activos en el centro.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-sm text-slate-500">
                <thead className="bg-slate-50 text-xs text-slate-700 uppercase font-semibold border-b border-slate-100">
                  <tr>
                    <th scope="col" className="px-6 py-4">Niño</th>
                    <th scope="col" className="px-6 py-4">Aula Anterior</th>
                    <th scope="col" className="px-6 py-4">Fecha de Egreso</th>
                    <th scope="col" className="px-6 py-4">Motivo de Salida</th>
                    <th scope="col" className="px-6 py-4">Informe / Archivos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {dischargedChildren.map((child) => (
                    <tr key={child.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={child.photoUrl || undefined} className="object-cover" />
                            <AvatarFallback className="bg-slate-100 text-slate-700 font-semibold text-xs">
                              {child.firstName[0]}{child.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{child.firstName} {child.lastName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {child.classroomName || 'Sin asignar'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {child.dismissalDate ? new Date(child.dismissalDate).toLocaleDateString('es-DO', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          timeZone: 'UTC'
                        }) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100/50">
                          {getReasonLabel(child.dismissalReason || '')}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-xs text-slate-600 line-clamp-2 italic" title={child.dismissalReport || ''}>
                          {child.dismissalReport || 'Sin informe registrado'}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

