"use client";

import { useState, useEffect, use } from "react";
import { updateEvaluation, getEvaluation } from '@/lib/actions/education';
import { getActiveChildren } from '@/lib/actions/attendance';
import { getEvalTemplates, getCentroSettings } from '@/lib/actions/settings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

export default function EditEvaluation({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const evaluationId = unwrappedParams.id;
  
  const [children, setChildren] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [centro, setCentro] = useState<any>({});
  const [results, setResults] = useState<any>({});
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedAreas, setExpandedAreas] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    Promise.all([
      getActiveChildren(),
      getEvalTemplates(),
      getEvaluation(evaluationId),
      getCentroSettings()
    ]).then(([childrenData, templatesData, evalData, centroData]) => {
      setChildren(childrenData);
      setTemplates(templatesData);
      setEvaluation(evalData);
      setCentro(centroData || {});
      if (evalData && evalData.results) {
        try {
          const parsed = typeof evalData.results === 'string' ? JSON.parse(evalData.results) : evalData.results;
          setResults(parsed || {});
        } catch(e) {
          console.error("Error parsing results", e);
        }
      }
      setLoading(false);
    });
  }, [evaluationId]);

  const handleScoreChange = (areaId: string, indicator: string, score: string) => {
    setResults((prev: any) => ({
      ...prev,
      [areaId]: {
        ...(prev[areaId] || {}),
        [indicator]: score
      }
    }));
  };

  const toggleArea = (id: string) => {
    setExpandedAreas(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-500">Cargando evaluación...</div>;
  }

  if (!evaluation) {
    return <div className="p-10 text-center text-rose-500">Evaluación no encontrada.</div>;
  }

  const handleSubmit = async (formData: FormData) => {
    await updateEvaluation(evaluationId, formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="flex items-center gap-4">
        <Link href={`/children/${evaluation.childId}`}>
          <Button variant="outline" size="sm" className="rounded-xl hidden sm:flex">Volver</Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Editar Evaluación de Desarrollo</h2>
          <p className="text-sm text-slate-500">Actualiza el progreso del niño en las diferentes áreas de desarrollo.</p>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-6">
        <input type="hidden" name="results" value={JSON.stringify(results)} />
        <input type="hidden" name="area" value={evaluation.area || "Desarrollo Integral"} />
        <input type="hidden" name="score" value={evaluation.score || "Evaluado"} />
        
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Niño(a)</Label>
                <select name="childId" defaultValue={evaluation.childId} className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all" required>
                  <option value="">Seleccione un niño...</option>
                  {children.map((c: any) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Fecha de Evaluación</Label>
                <Input type="date" name="date" required defaultValue={evaluation.date ? new Date(evaluation.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} className="rounded-xl bg-slate-50 border-slate-200 h-10" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-slate-700 font-semibold">Evaluador (Nombre del Docente)</Label>
                <Input name="evaluator" required defaultValue={evaluation.evaluator} className="rounded-xl bg-slate-50 border-slate-200 h-10" placeholder="Ej. Prof. Ana López" />
              </div>
            </div>
          </CardContent>
        </Card>

        {templates.map((area: any) => {
          const isExpanded = expandedAreas[area.id] === true;
          
          return (
            <Card key={area.id} className="border-0 shadow-sm overflow-hidden">
              <CardHeader 
                className="bg-slate-50 border-b border-slate-100 pb-4 cursor-pointer hover:bg-slate-100 transition-colors flex flex-row items-center justify-between"
                onClick={() => toggleArea(area.id)}
              >
                <CardTitle className="text-lg text-indigo-900">{area.name}</CardTitle>
                <div className="text-slate-400">
                  {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </CardHeader>
              {isExpanded && (
                <CardContent className="p-0 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="divide-y divide-slate-100">
                    {area.indicators.map((indicator: string, idx: number) => (
                      <div key={idx} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800">{indicator}</p>
                        </div>
                        <div className="flex bg-slate-100 rounded-lg p-1 shrink-0 w-full sm:w-auto">
                          {['Logrado', 'En Proceso', 'No Logrado'].map(score => {
                            const isSelected = results[area.id]?.[indicator] === score;
                            let activeClass = "bg-white shadow-sm text-slate-900 font-semibold";
                            if (isSelected && score === 'Logrado') activeClass = "bg-emerald-500 text-white shadow-sm font-bold";
                            if (isSelected && score === 'En Proceso') activeClass = "bg-amber-400 text-white shadow-sm font-bold";
                            if (isSelected && score === 'No Logrado') activeClass = "bg-rose-500 text-white shadow-sm font-bold";

                            return (
                              <button
                                key={score}
                                type="button"
                                onClick={() => handleScoreChange(area.id, indicator, score)}
                                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs rounded-md transition-all ${isSelected ? activeClass : 'text-slate-500 hover:text-slate-700 font-medium'}`}
                              >
                                {score}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">Observaciones Generales</Label>
              <textarea name="observations" defaultValue={evaluation.observations} className="w-full min-h-[120px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Escribe aquí cualquier nota o comentario adicional sobre el desarrollo del niño..." required={centro?.evaluationsRequireObservation !== false} />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Link href={`/children/${evaluation.childId}`}>
                <Button variant="outline" type="button" className="rounded-xl">Cancelar</Button>
              </Link>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8">Guardar Cambios</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
