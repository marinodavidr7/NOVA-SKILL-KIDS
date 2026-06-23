"use client";

import React, { useState, useEffect } from 'react';
import { getSubjects, createSubject, updateSubject, deleteSubject, createRubric, deleteRubric, Subject, Rubric } from '@/lib/actions/curriculum';
import { BookOpen, ArrowLeft, Plus, Trash2, Edit2, ChevronDown, Target } from 'lucide-react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AcademicPlanningPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSubject, setExpandedSubject] = useState<number | null>(null);
  
  // Subject Form State
  const [isSubjectSheetOpen, setIsSubjectSheetOpen] = useState(false);
  const [subjectForm, setSubjectForm] = useState<Subject>({ name: '', description: '', icon: '📚', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' });
  
  // Rubric Form State
  const [isRubricSheetOpen, setIsRubricSheetOpen] = useState(false);
  const [rubricForm, setRubricForm] = useState<Rubric>({ subject_id: 0, name: '', weight: 10, description: '' });

  const ICONS = ['📚', '🔢', '🎨', '🔬', '💻', '🏃', '🌍', '🎵', '🗣️', '🧪'];
  const COLORS = [
    'bg-indigo-100 text-indigo-700 border-indigo-200',
    'bg-emerald-100 text-emerald-700 border-emerald-200',
    'bg-rose-100 text-rose-700 border-rose-200',
    'bg-amber-100 text-amber-700 border-amber-200',
    'bg-sky-100 text-sky-700 border-sky-200',
    'bg-purple-100 text-purple-700 border-purple-200',
  ];

  const COLOR_MAPPING: Record<string, string> = {
    'bg-indigo-100': 'bg-indigo-500',
    'bg-emerald-100': 'bg-emerald-500',
    'bg-rose-100': 'bg-rose-500',
    'bg-amber-100': 'bg-amber-500',
    'bg-sky-100': 'bg-sky-500',
    'bg-purple-100': 'bg-purple-500',
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const data = await getSubjects();
    setSubjects(data);
    setIsLoading(false);
  };

  const handleSaveSubject = async () => {
    if (!subjectForm.name) return;
    if (subjectForm.id) {
      await updateSubject(subjectForm.id, subjectForm);
    } else {
      await createSubject(subjectForm);
    }
    setIsSubjectSheetOpen(false);
    loadData();
  };

  const handleDeleteSubject = async (id: number) => {
    if (confirm('¿Eliminar esta materia y todas sus rúbricas?')) {
      await deleteSubject(id);
      loadData();
    }
  };

  const handleSaveRubric = async () => {
    if (!rubricForm.name) return;
    await createRubric(rubricForm);
    setIsRubricSheetOpen(false);
    loadData();
  };

  const handleDeleteRubric = async (id: number) => {
    if (confirm('¿Eliminar esta rúbrica?')) {
      await deleteRubric(id);
      loadData();
    }
  };

  const openNewSubject = () => {
    setSubjectForm({ name: '', description: '', icon: '📚', color: COLORS[0] });
    setIsSubjectSheetOpen(true);
  };

  const openNewRubric = (subjectId: number) => {
    setRubricForm({ subject_id: subjectId, name: '', weight: 10, description: '' });
    setIsRubricSheetOpen(true);
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Cargando planificación...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-slate-50/80 to-slate-100/50 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-[85rem] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Section */}
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-sm border border-slate-200/60 group">
          {/* Decorative background blur */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors duration-700"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl group-hover:bg-rose-500/20 transition-colors duration-700"></div>

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
            <div className="flex items-start gap-5">
              <Link href="/academic" className="p-3 mt-1 bg-white hover:bg-slate-50 text-slate-600 hover:text-indigo-600 rounded-2xl shadow-sm border border-slate-100 transition-all hover:scale-105 active:scale-95 group/btn">
                <ArrowLeft className="w-5 h-5 group-hover/btn:-translate-x-1 transition-transform" />
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-md shadow-indigo-500/20">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                    Planificación Curricular
                  </h1>
                </div>
                <p className="mt-3 text-slate-500 text-lg max-w-2xl leading-relaxed">
                  Diseña el plan de estudios, asigna materias y define las rúbricas de evaluación con precisión.
                </p>
              </div>
            </div>

            <Button onClick={openNewSubject} className="group relative bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-500/25 h-14 px-8 transition-all hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md w-full md:w-auto">
              <Plus className="w-5 h-5 mr-2 transition-transform group-hover:rotate-90" /> 
              <span className="font-semibold text-base">Nueva Materia</span>
            </Button>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {subjects.map((subject) => {
            const isExpanded = expandedSubject === subject.id;
            const totalWeight = subject.rubrics?.reduce((acc, r) => acc + r.weight, 0) || 0;
            
            const bgClass = subject.color?.split(' ')[0] || 'bg-slate-100';
            const iconBg = COLOR_MAPPING[bgClass] || 'bg-slate-500';
            
            return (
              <div 
                key={subject.id} 
                className={`group/card flex flex-col bg-white rounded-[2rem] border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 ${isExpanded ? 'ring-2 ring-indigo-500/50 shadow-lg' : 'hover:-translate-y-1'}`}
              >
                {/* Card Header (Subject Info) */}
                <div className={`relative p-8 border-b border-slate-100/50 overflow-hidden transition-colors ${isExpanded ? 'bg-slate-50/50' : 'bg-white'}`}>
                  {/* Decorative blob */}
                  <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10 blur-2xl transition-all group-hover/card:scale-150 ${iconBg}`}></div>
                  
                  <div className="relative flex justify-between items-start z-10">
                    <div className={`flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 ${bgClass.replace('100', '50')} transition-transform group-hover/card:scale-105 group-hover/card:-rotate-3`}>
                      <span className="text-3xl filter drop-shadow-sm">{subject.icon}</span>
                    </div>
                    
                    <div className="flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                      <button 
                        onClick={() => { setSubjectForm(subject); setIsSubjectSheetOpen(true); }} 
                        className="p-2.5 bg-white hover:bg-slate-50 rounded-xl text-slate-500 hover:text-indigo-600 shadow-sm border border-slate-100 transition-all hover:scale-105"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteSubject(subject.id!)} 
                        className="p-2.5 bg-white hover:bg-rose-50 rounded-xl text-slate-500 hover:text-rose-600 shadow-sm border border-slate-100 transition-all hover:scale-105"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-6 relative z-10">
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight group-hover/card:text-indigo-900 transition-colors">{subject.name}</h3>
                    <p className="text-slate-500 mt-2 line-clamp-2 text-sm leading-relaxed">{subject.description || 'Sin descripción detallada.'}</p>
                  </div>
                </div>
                
                {/* Rubrics Section */}
                <div className="flex-1 flex flex-col bg-white">
                  <button 
                    className="w-full px-8 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors group/rubric" 
                    onClick={() => setExpandedSubject(isExpanded ? null : subject.id!)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${isExpanded ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400 group-hover/rubric:text-indigo-500'} transition-colors`}>
                        <Target className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">Rúbricas ({subject.rubrics?.length || 0})</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                        totalWeight === 100 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' 
                          : 'bg-amber-50 text-amber-700 border-amber-200/50'
                      }`}>
                        {totalWeight}% Total
                      </span>
                      <div className={`p-1 rounded-full transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-slate-100' : 'bg-transparent'}`}>
                        <ChevronDown className={`w-4 h-4 ${isExpanded ? 'text-slate-600' : 'text-slate-400 group-hover/rubric:text-slate-600'}`} />
                      </div>
                    </div>
                  </button>

                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-8 pt-0 space-y-3">
                      {subject.rubrics?.map((rubric, idx) => (
                        <div 
                          key={rubric.id} 
                          className="group/item relative flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all duration-300"
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          <div className="pr-4">
                            <p className="text-sm font-bold text-slate-800">{rubric.name}</p>
                            {rubric.description && (
                              <p className="text-xs text-slate-500 mt-1 line-clamp-1">{rubric.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-4 pl-4 border-l border-slate-200/60">
                            <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{rubric.weight}%</span>
                            <button 
                              onClick={() => handleDeleteRubric(rubric.id!)} 
                              className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              title="Eliminar rúbrica"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <Button 
                        onClick={(e) => { e.stopPropagation(); openNewRubric(subject.id!); }} 
                        variant="outline" 
                        className="w-full mt-4 h-12 border-dashed border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-500 hover:text-indigo-600 rounded-2xl transition-all group/add"
                      >
                        <Plus className="w-4 h-4 mr-2 transition-transform group-hover/add:rotate-90" /> 
                        <span className="font-medium">Añadir Nuevo Criterio</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {subjects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 px-6 bg-white/50 backdrop-blur-sm rounded-[2rem] border-2 border-slate-200/50 border-dashed group hover:border-indigo-300 transition-colors">
            <div className="p-6 bg-indigo-50/50 rounded-full group-hover:scale-110 group-hover:bg-indigo-50 transition-all duration-500">
              <BookOpen className="w-16 h-16 text-indigo-300 group-hover:text-indigo-500 transition-colors" />
            </div>
            <h3 className="mt-6 text-2xl font-bold text-slate-800">No hay materias configuradas</h3>
            <p className="mt-3 text-slate-500 max-w-md text-center text-lg">
              Comienza a estructurar tu plan de estudios agregando las asignaturas y definiendo sus criterios de evaluación.
            </p>
            <Button onClick={openNewSubject} className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 px-8 shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-1">
              <Plus className="w-5 h-5 mr-2" />
              Crear Primera Materia
            </Button>
          </div>
        )}

      </div>

      {/* Subject Sheet */}
      <Sheet open={isSubjectSheetOpen} onOpenChange={setIsSubjectSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-hidden w-full p-0 flex flex-col h-full bg-white/60 backdrop-blur-xl border-l border-white/20 shadow-2xl">
          {/* Header */}
          <div className="relative p-6 sm:p-8 bg-white/40 border-b border-slate-100/50 backdrop-blur-md z-10">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500"></div>
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold tracking-tight text-slate-800">
                {subjectForm.id ? "Editar Materia" : "Nueva Materia"}
              </SheetTitle>
              <SheetDescription className="text-slate-500 text-base mt-1">
                Configura los detalles y la apariencia de esta asignatura.
              </SheetDescription>
            </SheetHeader>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-8 scrollbar-thin scrollbar-thumb-slate-200">
            
            {/* Form Fields */}
            <div className="space-y-6">
              <div className="space-y-2.5">
                <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Nombre de la materia</Label>
                <div className="relative">
                  <Input 
                    id="name" 
                    value={subjectForm.name} 
                    onChange={e => setSubjectForm({...subjectForm, name: e.target.value})} 
                    placeholder="Ej. Matemáticas Avanzadas" 
                    className="h-12 pl-4 rounded-xl border-slate-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all text-base shadow-sm" 
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="description" className="text-sm font-semibold text-slate-700">Descripción (Opcional)</Label>
                <Textarea 
                  id="description" 
                  value={subjectForm.description} 
                  onChange={e => setSubjectForm({...subjectForm, description: e.target.value})} 
                  placeholder="Escribe un breve resumen de los objetivos de la materia..." 
                  className="min-h-[100px] p-4 rounded-xl border-slate-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all text-base resize-none shadow-sm" 
                />
              </div>
            </div>

            {/* Icon Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-slate-700">Icono representativo</Label>
                <span className="text-2xl">{subjectForm.icon}</span>
              </div>
              <div className="grid grid-cols-5 gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                {ICONS.map(icon => (
                  <button 
                    key={icon} 
                    onClick={() => setSubjectForm({...subjectForm, icon})} 
                    className={`aspect-square text-2xl flex items-center justify-center rounded-xl transition-all duration-300 ${subjectForm.icon === icon ? 'bg-white shadow-md ring-2 ring-indigo-500/50 scale-110 z-10' : 'hover:bg-white hover:shadow-sm hover:scale-105 text-slate-500 hover:text-slate-900'}`}
                  >
                    <span className="drop-shadow-sm">{icon}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                Color de acento
              </Label>
              <div className="flex flex-wrap gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                {COLORS.map(colorClass => {
                  const isSelected = subjectForm.color === colorClass;
                  const bgClass = colorClass.split(' ')[0];
                  const circleBgClass = COLOR_MAPPING[bgClass] || 'bg-slate-500';
                  
                  return (
                    <button 
                      key={colorClass} 
                      onClick={() => setSubjectForm({...subjectForm, color: colorClass})} 
                      className={`relative w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center shadow-sm hover:scale-110 hover:shadow-md ${circleBgClass} ${isSelected ? 'scale-110 ring-4 ring-offset-2 ring-slate-100' : ''}`}
                    >
                      {isSelected && <div className="w-3 h-3 bg-white rounded-full shadow-inner" />}
                    </button>
                  )
                })}
              </div>
            </div>
            
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100/50 bg-white/40 backdrop-blur-md shrink-0">
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsSubjectSheetOpen(false)} 
                className="rounded-xl flex-1 h-12 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveSubject} 
                className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white rounded-xl shadow-md shadow-indigo-500/20 transition-all font-medium"
              >
                {subjectForm.id ? "Guardar Cambios" : "Crear Materia"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Rubric Sheet */}
      <Sheet open={isRubricSheetOpen} onOpenChange={setIsRubricSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-hidden w-full p-0 flex flex-col h-full bg-white/60 backdrop-blur-xl border-l border-white/20 shadow-2xl">
          <div className="relative p-6 sm:p-8 bg-white/40 border-b border-slate-100/50 backdrop-blur-md z-10">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold tracking-tight text-slate-800">Nueva Rúbrica</SheetTitle>
              <SheetDescription className="text-slate-500 text-base mt-1">Añade un nuevo criterio de evaluación con su peso porcentual correspondiente.</SheetDescription>
            </SheetHeader>
          </div>
          <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-8 scrollbar-thin scrollbar-thumb-slate-200">
            <div className="space-y-6">
              <div className="space-y-2.5">
                <Label htmlFor="rubricName" className="text-sm font-semibold text-slate-700">Criterio a evaluar</Label>
                <Input 
                  id="rubricName" 
                  value={rubricForm.name} 
                  onChange={e => setRubricForm({...rubricForm, name: e.target.value})} 
                  placeholder="Ej. Examen Final, Trabajo Práctico" 
                  className="h-12 pl-4 rounded-xl border-slate-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all text-base shadow-sm" 
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="weight" className="text-sm font-semibold text-slate-700">Porcentaje de la nota (%)</Label>
                <div className="relative">
                  <Input 
                    id="weight" 
                    type="number" 
                    min="1" 
                    max="100" 
                    value={rubricForm.weight} 
                    onChange={e => setRubricForm({...rubricForm, weight: Number(e.target.value)})} 
                    className="h-12 pl-4 pr-12 rounded-xl border-slate-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all text-base shadow-sm font-medium" 
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</div>
                </div>
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="rubricDesc" className="text-sm font-semibold text-slate-700">Detalles adicionales (Opcional)</Label>
                <Textarea 
                  id="rubricDesc" 
                  value={rubricForm.description} 
                  onChange={e => setRubricForm({...rubricForm, description: e.target.value})} 
                  placeholder="Describe qué se espera de este criterio..." 
                  className="min-h-[100px] p-4 rounded-xl border-slate-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all text-base resize-none shadow-sm" 
                />
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-slate-100/50 bg-white/40 backdrop-blur-md shrink-0">
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsRubricSheetOpen(false)} 
                className="rounded-xl flex-1 h-12 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveRubric} 
                className="flex-1 h-12 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-xl shadow-md shadow-emerald-500/20 transition-all font-medium"
              >
                Guardar Criterio
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

    </div>
  );
}

