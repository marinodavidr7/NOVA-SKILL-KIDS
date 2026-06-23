"use client";

import React, { useState, useEffect } from 'react';
import { getChildren } from '@/lib/actions/children';
import { getPackages, enrollChildInPackage, SubscriptionPackage } from '@/lib/actions/subscriptions';
import { CheckSquare, Square, Users, Package, Percent, Loader2, CheckCircle2, AlertCircle, ArrowLeft, Search, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function MassEnrollmentPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [selectedChildIds, setSelectedChildIds] = useState<Set<number>>(new Set());
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [customDiscount, setCustomDiscount] = useState<string>('0');
  

  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [childrenData, packagesData] = await Promise.all([
          getChildren(),
          getPackages()
        ]);
        setChildren(childrenData);
        setPackages(packagesData as SubscriptionPackage[]);
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleToggleChild = (id: number) => {
    const newSet = new Set(selectedChildIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedChildIds(newSet);
  };

  useEffect(() => {
    if (selectedPackageId) {
      const pkgIdNum = parseInt(selectedPackageId);
      setSelectedChildIds(prev => {
        const next = new Set(prev);
        let changed = false;
        children.forEach(c => {
          const activePkgs = c.activePackages ? c.activePackages.split(',').map(Number) : [];
          if (activePkgs.includes(pkgIdNum) && next.has(c.id)) {
            next.delete(c.id);
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }
  }, [selectedPackageId, children]);

  const handleToggleAll = () => {
    if (selectedChildIds.size === filteredChildren.length) {
      setSelectedChildIds(new Set());
    } else {
      setSelectedChildIds(new Set(filteredChildren.map(c => c.id)));
    }
  };

  const handleEnroll = async () => {
    if (selectedChildIds.size === 0) return toast.error('Selecciona al menos un alumno');
    if (!selectedPackageId) return toast.error('Selecciona un paquete');

    setIsSubmitting(true);
    
    const discountNum = parseFloat(customDiscount) || 0;
    const pkgId = parseInt(selectedPackageId);
    
    let successCount = 0;
    let failCount = 0;
    let errorMessages: string[] = [];

    for (const childId of Array.from(selectedChildIds)) {
      try {
        const result = await enrollChildInPackage(childId, pkgId, {
          customDiscount: discountNum
        });
        if (result.success) {
          successCount++;
        } else {
          failCount++;
          const msg = result.error || 'Error desconocido';
          if (!errorMessages.includes(msg)) {
            errorMessages.push(msg);
          }
        }
      } catch (error: any) {
        console.error(`Error enrolling child ${childId}`, error);
        failCount++;
        const msg = error.message || 'Error desconocido del servidor';
        if (!errorMessages.includes(msg)) {
          errorMessages.push(msg);
        }
      }
    }

    if (failCount === 0) {
      toast.success(`¡Éxito! Se inscribieron ${successCount} alumnos correctamente.`);
      setSelectedChildIds(new Set());
    } else {
      const errReasons = errorMessages.length > 0 ? ` Detalles: ${errorMessages.join(' | ')}` : ' Revisa cupos o edades.';
      toast.error(`Se inscribieron ${successCount} alumnos, pero fallaron ${failCount}.${errReasons}`, {
        duration: 5000,
      });
    }
    setIsSubmitting(false);
  };

  const filteredChildren = children.filter(c => 
    c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedPackage = packages.find(p => p.id?.toString() === selectedPackageId);
  const discountVal = parseFloat(customDiscount) || 0;
  const estimatedTotal = selectedPackage 
    ? (selectedPackage.total_fee || 0) * (1 - (discountVal / 100)) * selectedChildIds.size 
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 px-6 py-4 lg:px-10 lg:pt-2 lg:pb-10">
      <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Col: Children Selection Grid */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 backdrop-blur-xl">
              <div className="flex items-start gap-4">
                <Link href="/academic" className="p-2.5 mt-1 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-xl transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 rounded-xl">
                      <Users className="w-6 h-6 text-indigo-600" />
                    </div>
                    Inscripciones Masivas
                  </h1>
                  <p className="mt-2 text-slate-500 max-w-2xl">
                    Selecciona múltiples alumnos e inscríbelos en un paquete simultáneamente.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[600px]">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleToggleAll}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700 shadow-sm"
                  >
                    {selectedChildIds.size === filteredChildren.length && filteredChildren.length > 0 ? (
                      <><CheckSquare className="w-4 h-4 text-indigo-600" /> Desmarcar Todos</>
                    ) : (
                      <><Square className="w-4 h-4 text-slate-400" /> Marcar Todos</>
                    )}
                  </button>
                  <span className="text-sm text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-100">
                    <strong className="text-indigo-600">{selectedChildIds.size}</strong> seleccionados
                  </span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar alumno..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 w-full sm:w-64 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                {filteredChildren.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                    <Users className="w-12 h-12 opacity-20" />
                    <p>No se encontraron alumnos.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredChildren.map((child) => {
                      const activePkgs = child.activePackages ? child.activePackages.split(',').map(Number) : [];
                      const isAlreadyEnrolled = selectedPackageId ? activePkgs.includes(parseInt(selectedPackageId)) : false;
                      const isSelected = selectedChildIds.has(child.id);
                      return (
                        <div 
                          key={child.id}
                          onClick={() => {
                            if (!isAlreadyEnrolled) handleToggleChild(child.id);
                          }}
                          className={`group flex items-center p-4 rounded-2xl border-2 transition-all ${
                            isAlreadyEnrolled
                              ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                              : isSelected 
                                ? 'bg-indigo-50/50 border-indigo-500 shadow-sm shadow-indigo-100 cursor-pointer' 
                                : 'bg-white border-transparent hover:border-slate-200 hover:shadow-sm cursor-pointer'
                          }`}
                        >
                          <div className="mr-4">
                            {isAlreadyEnrolled ? (
                              <div className="w-6 h-6 rounded-md bg-slate-200 flex items-center justify-center"></div>
                            ) : isSelected ? (
                              <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                                <CheckSquare className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-md border-2 border-slate-200 group-hover:border-slate-300 flex items-center justify-center bg-slate-50"></div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3 flex-1">
                            {child.photoUrl ? (
                              <img src={child.photoUrl} alt={child.firstName} className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-white" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold shadow-sm ring-2 ring-white">
                                {child.firstName[0]}
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900 leading-tight">
                                {child.firstName} {child.lastName}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {child.classroomName || 'Sin aula'}
                              </p>
                            </div>
                            {isAlreadyEnrolled && (
                              <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-md">
                                Ya inscrito
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Col: Cart Summary */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-xl shadow-indigo-500/5 border border-slate-100 sticky top-6">
              
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Resumen</h2>
                  <p className="text-sm text-slate-500">Configuración de matrícula</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider block">Programa Académico</label>
                  <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
                    {packages.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
                        No hay programas disponibles.
                      </div>
                    ) : (
                      packages.map(p => {
                        const isSelected = p.id?.toString() === selectedPackageId;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setSelectedPackageId(p.id?.toString() || '')}
                            className={`w-full text-left p-3.5 rounded-xl border-2 transition-all duration-300 flex items-center justify-between group relative ${
                              isSelected 
                                ? 'bg-indigo-50/50 border-indigo-600 shadow-md shadow-indigo-100/50' 
                                : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex flex-col pr-4">
                              <span className={`font-semibold text-sm transition-colors ${isSelected ? 'text-indigo-900' : 'text-slate-700 group-hover:text-slate-900'}`}>
                                {p.name}
                              </span>
                              {p.total_fee !== undefined && (
                                <span className={`text-xs mt-0.5 transition-colors ${isSelected ? 'text-indigo-600 font-medium' : 'text-slate-500'}`}>
                                  ${p.total_fee}
                                </span>
                              )}
                            </div>
                            <div className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                              isSelected 
                                ? 'border-indigo-600 bg-indigo-600 scale-110' 
                                : 'border-slate-300 bg-slate-50 group-hover:border-indigo-400'
                            }`}>
                              {isSelected && <div className="w-2 h-2 bg-white rounded-full animate-in zoom-in duration-200" />}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider block">Descuento Especial</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Percent className="h-5 w-5 text-indigo-400" />
                    </div>
                    <input 
                      type="number" 
                      min="0" max="100"
                      value={customDiscount}
                      onChange={(e) => setCustomDiscount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-11 pr-4 py-3.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Aplica a todos los alumnos seleccionados.</p>
                </div>


                {/* Calculation Summary */}
                <div className="pt-6 border-t border-slate-100 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Alumnos a inscribir</span>
                    <span className="font-semibold text-slate-900 px-2 py-0.5 bg-slate-100 rounded-md">{selectedChildIds.size}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Valor original c/u</span>
                    <span className="font-medium text-slate-700">${selectedPackage?.total_fee || 0}</span>
                  </div>
                  {discountVal > 0 && (
                    <div className="flex justify-between items-center text-sm text-emerald-600">
                      <span>Ahorro aplicado</span>
                      <span className="font-medium">-{discountVal}%</span>
                    </div>
                  )}
                  <div className="pt-4 mt-2 border-t border-slate-100 border-dashed flex justify-between items-end">
                    <span className="font-bold text-slate-900">Total Proyectado</span>
                    <span className="text-3xl font-black text-indigo-600 tracking-tight">
                      ${estimatedTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleEnroll}
                  disabled={isSubmitting || selectedChildIds.size === 0 || !selectedPackageId}
                  className="w-full py-4 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-6 h-6" />
                      Inscribir Alumnos
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
