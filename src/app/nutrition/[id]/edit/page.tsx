'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { saveMenu, deleteMenu } from '@/lib/actions/nutrition';

const COMMON_ALLERGENS = [
  'Lácteos', 'Gluten', 'Huevo', 'Cacahuate', 'Nueces', 'Soya', 'Mariscos', 'Fresa', 'Pescado'
];

// We need to fetch the menu data client-side since this is a client component
async function fetchMenu(id: string) {
  const res = await fetch(`/api/nutrition/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export default function EditMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();

  const [menuData, setMenuData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [mealType, setMealType] = useState('');
  const [description, setDescription] = useState('');
  const [beverage, setBeverage] = useState('');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [menuId, setMenuId] = useState('');

  useEffect(() => {
    params.then(p => {
      setMenuId(p.id);
      fetchMenu(p.id).then(data => {
        if (data) {
          setMenuData(data);
          setDate(data.date);
          setMealType(data.mealType);
          setDescription(data.description);
          setBeverage(data.beverage || '');
          setSelectedAllergens(data.allergens ? data.allergens.split(',').map((a: string) => a.trim()).filter(Boolean) : []);
        }
        setLoading(false);
      });
    });
  }, [params]);

  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens(prev =>
      prev.includes(allergen)
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Delete old menu
      await deleteMenu(Number(menuId));

      // Create new one with same data (edited)
      const result = await saveMenu({
        date,
        mealType,
        description,
        beverage,
        allergens: selectedAllergens
      });

      if (result.status === 'success') {
        router.push('/nutrition');
      } else if (result.status === 'error' && result.code === 'ALLERGY_COLLISION') {
        setError(`⚠️ Se detectaron ${result.affectedChildren?.length} niño(s) con alergias. Usa el formulario de creación para registrar menús alternos.`);
      }
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el menú.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded-lg w-48" />
          <div className="h-64 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center py-20">
        <p className="text-slate-500 font-medium">Menú no encontrado.</p>
        <Link href="/nutrition" className="text-rose-500 hover:underline mt-2 inline-block font-semibold">Volver</Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto pb-32">
      <div className="mb-8">
        <Link href="/nutrition" className="text-slate-500 hover:text-slate-900 flex items-center gap-2 mb-4 transition-colors w-max">
          <ArrowLeft className="h-4 w-4" /> Volver a Nutrición
        </Link>
        <h1 className="text-3xl font-black text-slate-900">Editar Menú</h1>
        <p className="text-slate-500 mt-1">Modifica los datos del platillo.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Fecha</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Comida</label>
                <select
                  value={mealType}
                  onChange={e => setMealType(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
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
                rows={3}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Bebida (Opcional)</label>
              <input
                type="text"
                value={beverage}
                onChange={e => setBeverage(e.target.value)}
                placeholder="Ej: Avena tibia con leche y un toque de canela..."
                className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
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

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <div className="pt-6 flex justify-end gap-3">
              <Link
                href="/nutrition"
                className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
