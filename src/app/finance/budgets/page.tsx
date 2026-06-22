"use client";

import React, { useState, useEffect } from 'react';
import { getBudgets, createBudget, deleteBudget } from '@/lib/actions/finance-erp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, Plus, Target, CheckCircle2, Edit, Trash2, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const now = new Date();
  const initialPeriod = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedBudget, setSelectedBudget] = useState<any>(null);

  // Form State
  const [categorySelection, setCategorySelection] = useState('Servicios Básicos');
  const [customCategory, setCustomCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadBudgets = async (period: string) => {
    setIsLoading(true);
    try {
      const data = await getBudgets(period);
      setBudgets(data);
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar presupuestos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets(selectedPeriod);
  }, [selectedPeriod]);

  const handleOpenAdd = () => {
    setDialogMode('create');
    setCategorySelection('Servicios Básicos');
    setCustomCategory('');
    setAmount('');
    setNotes('');
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (budget: any) => {
    setDialogMode('edit');
    setSelectedBudget(budget);
    
    // Check if category is standard
    const standardCategories = ['Servicios Básicos', 'Internet', 'Alquiler', 'Activos Fijos', 'Nómina', 'Mantenimiento', 'Inventario / Compras', 'Alimentación', 'Materiales de Limpieza', 'Materiales Didácticos', 'Impuestos'];
    if (standardCategories.includes(budget.category)) {
      setCategorySelection(budget.category);
      setCustomCategory('');
    } else {
      setCategorySelection('Otro');
      setCustomCategory(budget.category);
    }
    
    setAmount(budget.estimatedAmount.toString());
    setNotes(budget.notes || '');
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = categorySelection === 'Otro' ? customCategory.trim() : categorySelection;

    if (!finalCategory) {
      toast.error('La categoría es requerida');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error('El monto debe ser un número mayor a cero');
      return;
    }

    setIsSaving(true);
    try {
      const res = await createBudget({
        category: finalCategory,
        period: selectedPeriod,
        estimatedAmount: numericAmount,
        notes: notes
      });

      if (res.success) {
        toast.success(dialogMode === 'create' ? 'Partida presupuestaria creada' : 'Partida presupuestaria modificada');
        setIsDialogOpen(false);
        loadBudgets(selectedPeriod);
      } else {
        toast.error(res.error || 'Error al guardar la partida');
      }
    } catch (err: any) {
      toast.error('Error al procesar la solicitud');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDelete = (budget: any) => {
    setBudgetToDelete(budget);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!budgetToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteBudget(budgetToDelete.id);
      if (res.success) {
        toast.success('Partida eliminada correctamente');
        setIsDeleteOpen(false);
        loadBudgets(selectedPeriod);
      } else {
        toast.error(res.error || 'Error al eliminar la partida');
      }
    } catch (err) {
      toast.error('Error al eliminar la partida');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.estimatedAmount, 0);

  // Parse Year/Month for legible title
  const getPeriodLabel = (p: string) => {
    const [y, m] = p.split('-');
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const monthIndex = parseInt(m, 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${months[monthIndex]} de ${y}`;
    }
    return p;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Presupuesto</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Planificación de gastos e ingresos del periodo</p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm rounded-xl px-4">
          <Plus className="h-4 w-4 mr-2" />
          Añadir Partida
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Target className="w-24 h-24" /></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Presupuesto Total ({getPeriodLabel(selectedPeriod)})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">${totalBudget.toLocaleString()}</div>
            <p className="text-xs text-slate-400 mt-1">{budgets.length} categorías planificadas</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 mt-8">
        <CardHeader className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-slate-800 dark:text-slate-200">Partidas Presupuestarias</CardTitle>
          <div className="flex gap-2">
            <Input 
              type="month" 
              value={selectedPeriod} 
              onChange={e => setSelectedPeriod(e.target.value)}
              className="h-9 text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800" 
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 font-medium">
                <tr>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4 text-right">Monto Estimado</th>
                  <th className="px-6 py-4">Notas</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {budgets.map(budget => (
                  <tr key={budget.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                      {budget.category}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-200">
                      ${budget.estimatedAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                      {budget.notes || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-xs bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Planificado
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-1 justify-center">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                          onClick={() => handleOpenEdit(budget)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                          onClick={() => handleOpenDelete(budget)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {budgets.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                      No hay presupuesto planificado para este periodo ({getPeriodLabel(selectedPeriod)}).
                    </td>
                  </tr>
                )}

                {isLoading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex justify-center items-center">
                        <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {dialogMode === 'create' ? 'Añadir Partida Presupuestaria' : 'Editar Partida Presupuestaria'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Planifica el presupuesto estimado para el periodo {getPeriodLabel(selectedPeriod)}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {dialogMode === 'create' ? (
              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  value={categorySelection}
                  onChange={e => setCategorySelection(e.target.value)}
                >
                  <option value="Servicios Básicos">Servicios Básicos (Agua, Luz)</option>
                  <option value="Internet">Internet y Comunicaciones</option>
                  <option value="Alquiler">Alquiler de Instalaciones</option>
                  <option value="Activos Fijos">Activos Fijos y Equipos</option>
                  <option value="Nómina">Nómina (Sueldos Personal)</option>
                  <option value="Mantenimiento">Mantenimiento (Reparaciones, Estructura)</option>
                  <option value="Inventario / Compras">Inventario / Compras (Materiales)</option>
                  <option value="Alimentación">Alimentación (Comida, Bebidas)</option>
                  <option value="Materiales de Limpieza">Materiales de Limpieza</option>
                  <option value="Materiales Didácticos">Materiales Didácticos</option>
                  <option value="Impuestos">Impuestos</option>
                  <option value="Otro">Otro (Especificar)</option>
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Input value={selectedBudget?.category} disabled className="bg-slate-100 dark:bg-slate-800 text-slate-500" />
              </div>
            )}

            {dialogMode === 'create' && categorySelection === 'Otro' && (
              <div className="space-y-2">
                <Label htmlFor="customCategory">Especificar Categoría *</Label>
                <Input 
                  id="customCategory" 
                  value={customCategory} 
                  onChange={e => setCustomCategory(e.target.value)} 
                  placeholder="Ej. Publicidad, Capacitación"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount">Monto Estimado *</Label>
              <Input 
                id="amount" 
                type="number"
                step="0.01"
                min="0.01"
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas / Descripción (Opcional)</Label>
              <Input 
                id="notes" 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                placeholder="Detalles adicionales sobre este gasto"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving} className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {isSaving ? 'Guardando...' : 'Guardar Partida'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-rose-600">Eliminar Partida Presupuestaria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2 text-sm text-slate-600 dark:text-slate-400">
            <p>¿Estás seguro de que deseas eliminar la partida <strong>{budgetToDelete?.category}</strong> del periodo <strong>{getPeriodLabel(selectedPeriod)}</strong>?</p>
            <p className="text-xs text-rose-500 font-semibold">Esta acción removerá la planificación para esta categoría de forma permanente.</p>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting} className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900">
              Cancelar
            </Button>
            <Button type="button" onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-rose-600 hover:bg-rose-700 text-white">
              {isDeleting ? 'Eliminando...' : 'Confirmar Eliminación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
