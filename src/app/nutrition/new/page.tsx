'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, AlertOctagon, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { saveMenu, saveMenuAlternatives } from '@/lib/actions/nutrition';

const COMMON_ALLERGENS = [
  'Lácteos', 'Gluten', 'Huevo', 'Cacahuate', 'Nueces', 'Soya', 'Mariscos', 'Fresa', 'Pescado'
];

import { Suspense } from 'react';

export default function NewMenuPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Cargando formulario...</div>}>
      <NewMenuForm />
    </Suspense>
  );
}

function NewMenuForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Basic Menu State — pre-fill date from URL if available
  const [date, setDate] = useState(searchParams.get('date') || new Date().toISOString().split('T')[0]);
  const [mealType, setMealType] = useState('Desayuno');
  const [description, setDescription] = useState('');
  const [beverage, setBeverage] = useState('');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  
  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Collision State
  const [collisionData, setCollisionData] = useState<any[] | null>(null);
  const [alternatives, setAlternatives] = useState<{ [childId: number]: string }>({});

  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens(prev => 
      prev.includes(allergen) 
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    );
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const result = await saveMenu({
        date,
        mealType,
        description,
        beverage,
        allergens: selectedAllergens
      });

      if (result.status === 'error') {
        if (result.code === 'ALLERGY_COLLISION') {
          // Boom, red alert
          setCollisionData(result.affectedChildren || []);
        } else if (result.code === 'UNAUTHORIZED') {
          setError(result.message || 'No tienes permiso para realizar esta acción.');
        } else {
          setError('Ocurrió un error al guardar el menú.');
        }
      } else if (result.status === 'success') {
        // Safe! Go back
        router.push('/nutrition');
      }
    } catch (err: any) {
      setError(err.message || 'Error al guardar el menú.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveWithAlternatives = async () => {
    // Check if all alternatives are filled
    if (collisionData) {
      const missing = collisionData.some(child => !alternatives[child.id] || alternatives[child.id].trim() === '');
      if (missing) {
        setError('Debes escribir un menú alternativo para TODOS los niños afectados antes de continuar.');
        return;
      }
    }

    setIsSubmitting(true);
    setError('');

    try {
      // 1. Force save the menu
      const result = await saveMenu({
        date,
        mealType,
        description,
        beverage,
        allergens: selectedAllergens,
        forceSaveWithAlternatives: true 
      });

      if (result.status === 'success' && collisionData) {
        // 2. Save the alternatives linked to this new menu
        const altsArray = collisionData.map(c => ({
          childId: c.id,
          description: alternatives[c.id]
        }));
        
        await saveMenuAlternatives(Number(result.menuId!), altsArray);
        
        router.push('/nutrition');
      }
    } catch (err: any) {
      setError(err.message || 'Error al guardar las alternativas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto pb-32">
      <div className="mb-8">
        <Link href="/nutrition" className="text-slate-500 hover:text-slate-900 flex items-center gap-2 mb-4 transition-colors w-max">
          <ArrowLeft className="h-4 w-4" /> Volver a Nutrición
        </Link>
        <h1 className="text-3xl font-black text-slate-900">Programar Nuevo Menú</h1>
        <p className="text-slate-500 mt-1">Registra un platillo y declara sus alérgenos.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-8">
          <form onSubmit={handleInitialSubmit} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Fecha</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                  required
                  disabled={!!collisionData}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Comida</label>
                <select 
                  value={mealType}
                  onChange={e => setMealType(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                  disabled={!!collisionData}
                >
                  <option>Desayuno</option>
                  <option>Colación Matutina</option>
                  <option>Comida</option>
                  <option>Colación Vespertina</option>
                  <option>Fórmula / Biberón</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Descripción del Menú</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Ej. Hotcakes con fresas"
                rows={3}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                required
                disabled={!!collisionData}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Bebida (Opcional)</label>
              <input 
                type="text"
                value={beverage}
                onChange={e => setBeverage(e.target.value)}
                placeholder="Ej. Vaso de leche"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                disabled={!!collisionData}
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="block text-sm font-bold text-slate-700 mb-4">
                Etiquetas de Alérgenos <span className="text-rose-500">*Obligatorio marcar si aplica</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {COMMON_ALLERGENS.map(allergen => {
                  const isSelected = selectedAllergens.includes(allergen);
                  return (
                    <button
                      key={allergen}
                      type="button"
                      disabled={!!collisionData}
                      onClick={() => toggleAllergen(allergen)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider transition-all border-2 ${
                        isSelected 
                          ? 'bg-rose-100 border-rose-500 text-rose-700' 
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {allergen}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && !collisionData && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            {!collisionData && (
              <div className="pt-6 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                  <Save className="h-5 w-5" />
                  Guardar y Analizar Menú
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Collision Alert UI */}
      {collisionData && (
        <div className="mt-8 bg-rose-50 border-2 border-rose-500 rounded-2xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-rose-500 p-6 flex items-start gap-4 text-white">
            <AlertOctagon className="h-12 w-12 shrink-0" />
            <div>
              <h2 className="text-2xl font-black">¡Alerta de Alergia Severa!</h2>
              <p className="mt-1 font-medium text-rose-100">
                El sistema de seguridad ha bloqueado la publicación de este menú. Hemos detectado que {collisionData.length} alumno(s) inscrito(s) corren riesgo con los ingredientes o palabras mencionadas.
              </p>
            </div>
          </div>
          
          <div className="p-8">
            <h3 className="font-bold text-rose-900 mb-6 uppercase tracking-wider text-sm border-b border-rose-200 pb-2">
              Se Requieren Menús Alternativos Obligatorios
            </h3>
            
            <div className="space-y-6">
              {collisionData.map((child) => (
                <div key={child.id} className="bg-white p-5 rounded-xl border border-rose-200 flex gap-6">
                  <div className="w-1/3">
                    <p className="font-black text-slate-900">{child.firstName} {child.lastName}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-100 text-rose-800 rounded text-xs font-bold uppercase">
                      Alérgico(a) a: {child.triggeringAllergen}
                    </div>
                  </div>
                  <div className="w-2/3">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Comida Alternativa Segura</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Hotcakes de avena con manzana..."
                      value={alternatives[child.id] || ''}
                      onChange={e => setAlternatives(prev => ({ ...prev, [child.id]: e.target.value }))}
                      className="w-full border-2 border-rose-200 rounded-lg px-4 py-2 focus:border-rose-500 focus:ring-0 outline-none font-medium text-slate-800"
                    />
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="mt-6 p-4 bg-rose-100 text-rose-800 rounded-xl text-sm font-bold text-center">
                {error}
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleSaveWithAlternatives}
                disabled={isSubmitting}
                className="bg-rose-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-rose-700 transition-colors flex items-center gap-2"
              >
                <CheckCircle2 className="h-5 w-5" />
                Confirmar Alternativas y Publicar Menú
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
