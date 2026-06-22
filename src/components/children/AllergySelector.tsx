"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Check, Plus, X } from "lucide-react";

const ALERGIAS = {
  "Alergias respiratorias": ["Polvo", "Polen", "Ácaros", "Pelo de animales", "Moho"],
  "Alergias en la piel": ["Dermatitis atópica", "Urticaria", "Látex", "Metales"],
  "Alergias a medicamentos": ["Penicilina", "Ibuprofeno/AINEs", "Amoxicilina", "Aspirina"],
  "Alergias a picaduras": ["Abejas", "Avispas", "Hormigas", "Mosquitos"],
  "Alergias alimentarias": {
    "Leche de vaca": ["Queso", "Yogur", "Mantequilla", "Crema de leche", "Suero de leche", "Caseína y caseinatos", "Sólidos lácteos", "Trazas en embutidos y empanizados"],
    "Huevos": ["Clara de huevo", "Yema de huevo", "Albúmina", "Mayonesa", "Merengues", "Pastas al huevo", "Productos de panadería y repostería"],
    "Maníes": ["Aceite de maní", "Manteca de cacahuete", "Harina de maní", "Snacks salados industriales", "Trazas en chocolates y galletas"],
    "Frutos secos": ["Almendras", "Nueces", "Avellanas", "Pistachos", "Marañones", "Anacardos", "Castañas", "Mazapanes y turrones"],
    "Mariscos": ["Camarones", "Langostas", "Cangrejos", "Almejas", "Mejillones", "Pulpo", "Calamares", "Salsas de pescado o de ostra orientales"],
    "Pescados": ["Atún", "Salmón", "Bacalao", "Sardinas", "Harina de pescado", "Caldos de pescado concentrados", "Gelatina de pescado"],
    "Trigo": ["Harina de trigo", "Pan", "Pastas alimenticias", "Galletas dulces y saladas", "Sémola", "Salvado de trigo", "Espesantes en salsas listas y sopas instantáneas"],
    "Soya": ["Aceite de soya", "Salsa de soya", "Lecitina de soya", "Tofu", "Edamame", "Proteína vegetal hidrolizada", "Fórmulas infantiles a base de soya"],
    "Semillas de sésamo": ["Ajonjolí en grano", "Aceite de sésamo", "Tahini", "Panes de hamburguesa y repostería decorada", "Hummus"],
    "Frutas drupáceas y tropicales": ["Kiwi", "Fresas", "Melocotón", "Durazno", "Plátano", "Banano", "Manzana", "Piña"],
    "Legumbres adicionales": ["Lentejas", "Garbanzos", "Guisantes", "Chícharos", "Frijoles", "Habichuelas"],
    "Otros cereales": ["Maíz", "Avena", "Cebada", "Centeno", "Arroz"],
    "Mostaza": ["Semillas de mostaza", "Mostaza en salsa", "Aderezos para ensaladas", "Condimentos", "Marinados"],
    "Apio": ["Apio en rama", "Raíz de apio", "Caldos deshidratados", "Saborizantes de sopas", "Sal de apio"],
    "Altramuz": ["Lupino", "Harina de altramuz", "Productos de panadería alternativa", "Snacks de semillas"],
    "Carnes": ["Carne de pollo", "Carne de res", "Carne de cerdo"],
    "Cacao": ["Cacao en polvo", "Manteca de cacao", "Chocolate negro", "Coberturas de repostería"],
    "Sulfitos": ["Vinagre", "Frutas deshidratadas", "Alimentos en conserva", "Jarabes medicinales"]
  }
};

export function AllergySelector({ initialAllergies = "" }: { initialAllergies?: string }) {
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(() => {
    if (!initialAllergies || initialAllergies === "Ninguna") return [];
    return initialAllergies.split(", ").map(a => a.trim()).filter(Boolean);
  });
  const [activeTab, setActiveTab] = useState<string>("Alergias alimentarias");
  const [expandedFood, setExpandedFood] = useState<string | null>(null);
  
  const [manualCategory, setManualCategory] = useState<string>("Alimentaria");
  const [manualAllergy, setManualAllergy] = useState<string>("");

  const handleAddManual = () => {
    if (!manualAllergy.trim()) return;
    const newAllergy = `${manualCategory}: ${manualAllergy.trim()}`;
    if (!selectedAllergies.includes(newAllergy)) {
      setSelectedAllergies(prev => [...prev, newAllergy]);
    }
    setManualAllergy("");
  };

  const toggleAllergy = (category: string, item: string, subCategory?: string) => {
    const allergyString = subCategory 
      ? `${category}: ${subCategory} (${item})` 
      : `${category}: ${item}`;

    if (selectedAllergies.includes(allergyString)) {
      setSelectedAllergies(prev => prev.filter(a => a !== allergyString));
    } else {
      setSelectedAllergies(prev => [...prev, allergyString]);
    }
  };

  const removeAllergy = (allergyString: string) => {
    setSelectedAllergies(prev => prev.filter(a => a !== allergyString));
  };

  const selectAllFoodGroup = (foodGroup: string, items: string[]) => {
    const allSelected = items.every(item => selectedAllergies.includes(`Alimentaria: ${foodGroup} (${item})`));
    if (allSelected) {
      setSelectedAllergies(prev => prev.filter(a => !items.some(item => a === `Alimentaria: ${foodGroup} (${item})`)));
    } else {
      const toAdd = items.filter(item => !selectedAllergies.includes(`Alimentaria: ${foodGroup} (${item})`)).map(item => `Alimentaria: ${foodGroup} (${item})`);
      setSelectedAllergies(prev => [...prev, ...toAdd]);
    }
  };

  // Convert array to a comma-separated string for the hidden input
  const serializedAllergies = selectedAllergies.length > 0 
    ? selectedAllergies.join(", ") 
    : "Ninguna";

  return (
    <div className="space-y-4">
      {/* Hidden input to submit with the form */}
      <input type="hidden" name="allergies" value={serializedAllergies} />

      <div className="flex flex-wrap gap-2 mb-2">
        {selectedAllergies.length === 0 ? (
          <span className="text-sm text-slate-500 italic">No se han registrado alergias.</span>
        ) : (
          selectedAllergies.map(allergy => (
            <span 
              key={allergy} 
              className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-800 text-xs font-semibold rounded-full"
            >
              {allergy}
              <button 
                type="button" 
                onClick={() => removeAllergy(allergy)}
                className="hover:bg-rose-200 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))
        )}
      </div>

      <Dialog>
        <DialogTrigger className="w-full inline-flex h-10 items-center justify-center rounded-xl border-2 border-dashed border-rose-200 bg-transparent px-4 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:pointer-events-none disabled:opacity-50">
          <Plus className="h-4 w-4 mr-2" />
          Añadir Alergias Específicas
        </DialogTrigger>
        <DialogContent className="w-[95vw] sm:max-w-5xl max-h-[85vh] overflow-hidden flex flex-col p-0 border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="p-6 pb-4 border-b bg-white">
            <DialogTitle className="text-2xl font-bold text-slate-800">Seleccionar Alergias y Condiciones</DialogTitle>
            <p className="text-sm text-slate-500 mt-1">Marque todas las alergias que apliquen al expediente médico del niño.</p>
          </DialogHeader>
          
          <div className="flex flex-1 overflow-hidden h-[60vh] bg-slate-50/50">
            {/* Sidebar with Categories */}
            <div className="w-1/3 border-r bg-white overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-track]:bg-transparent py-4">
              <div className="space-y-1 px-3">
                {Object.keys(ALERGIAS).map(category => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveTab(category)}
                    className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-between ${
                      activeTab === category 
                        ? "bg-rose-50 text-rose-700 shadow-sm ring-1 ring-rose-200/50" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="w-2/3 overflow-y-auto p-6 bg-slate-50/50 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-track]:bg-transparent">
              {activeTab === "Alergias alimentarias" ? (
                <div className="space-y-4">
                  {Object.entries(ALERGIAS["Alergias alimentarias"]).map(([foodGroup, items]) => (
                    <div key={foodGroup} className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:border-rose-200 hover:shadow-md">
                      <button
                        type="button"
                        onClick={() => setExpandedFood(expandedFood === foodGroup ? null : foodGroup)}
                        className="w-full text-left px-5 py-4 font-bold text-slate-800 flex justify-between items-center bg-white hover:bg-slate-50/50 transition-colors"
                      >
                        <span className="text-base">{foodGroup}</span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
                          {items.length} opciones
                        </span>
                      </button>
                      
                      {expandedFood === foodGroup && (
                        <div className="bg-slate-50/30 border-t border-slate-100">
                          <div className="px-5 pt-3 flex justify-end">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                selectAllFoodGroup(foodGroup, items);
                              }}
                              className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 px-3 py-1.5 rounded-full transition-colors"
                            >
                              {items.every(item => selectedAllergies.includes(`Alimentaria: ${foodGroup} (${item})`))
                                ? "Deseleccionar todo"
                                : "Seleccionar todo"}
                            </button>
                          </div>
                          <div className="px-5 pb-5 pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {items.map((item: string) => {
                            const allergyString = `Alimentaria: ${foodGroup} (${item})`;
                            const isSelected = selectedAllergies.includes(allergyString);
                            return (
                              <label key={item} className={`flex items-start gap-3 cursor-pointer group p-3 rounded-xl border transition-all duration-200 ${isSelected ? 'bg-rose-50 border-rose-200 shadow-sm' : 'bg-white border-slate-100 hover:border-rose-200 hover:bg-slate-50'}`}>
                                <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-md flex items-center justify-center border transition-all duration-200 shadow-sm ${isSelected ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-slate-300 group-hover:border-rose-400'}`}>
                                  {isSelected && <Check className="h-3.5 w-3.5" />}
                                </div>
                                <input 
                                  type="checkbox" 
                                  className="hidden" 
                                  checked={isSelected}
                                  onChange={() => toggleAllergy("Alimentaria", item, foodGroup)}
                                />
                                <span className={`text-sm leading-tight ${isSelected ? 'text-rose-900 font-semibold' : 'text-slate-700 font-medium'}`}>
                                  {item}
                                </span>
                              </label>
                            );
                          })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(ALERGIAS as any)[activeTab].map((item: string) => {
                    const allergyString = `${activeTab}: ${item}`;
                    const isSelected = selectedAllergies.includes(allergyString);
                    return (
                      <label key={item} className={`flex items-start gap-3 cursor-pointer group p-4 rounded-2xl border transition-all duration-200 ${isSelected ? 'bg-rose-50 border-rose-200 shadow-sm' : 'bg-white border-slate-200/60 shadow-sm hover:border-rose-200 hover:shadow-md'}`}>
                        <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-md flex items-center justify-center border transition-all duration-200 shadow-sm ${isSelected ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-slate-300 group-hover:border-rose-400'}`}>
                          {isSelected && <Check className="h-3.5 w-3.5" />}
                        </div>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={isSelected}
                          onChange={() => toggleAllergy(activeTab, item)}
                        />
                        <span className={`text-sm leading-tight ${isSelected ? 'text-rose-900 font-semibold' : 'text-slate-700 font-medium'}`}>
                          {item}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          {/* Custom allergy input */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-1 w-full space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Añadir Alergia Manual</label>
              <div className="flex gap-2">
                <select 
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500/30"
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value)}
                >
                  <option value="Alergia alimentaria">Alimentaria</option>
                  <option value="Alergia respiratoria">Respiratoria</option>
                  <option value="Alergia en la piel">Piel</option>
                  <option value="Alergia a medicamentos">Medicamentos</option>
                  <option value="Alergia a picaduras">Picaduras</option>
                  <option value="Otra Alergia">Otra</option>
                </select>
                <Input 
                  placeholder="Escriba aquí (ej. Kiwis, Níquel...)" 
                  className="rounded-xl flex-1 bg-white"
                  value={manualAllergy}
                  onChange={(e) => setManualAllergy(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddManual();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={handleAddManual}
                  variant="outline"
                  className="h-10 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold px-4"
                >
                  <Plus className="h-4 w-4 mr-1" /> Añadir
                </Button>
              </div>
            </div>
            
            <DialogTrigger className="mt-4 sm:mt-0 inline-flex h-10 w-full sm:w-auto items-center justify-center rounded-xl bg-rose-600 px-8 text-sm font-medium text-white transition-colors hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:pointer-events-none disabled:opacity-50">
              Listo
            </DialogTrigger>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
