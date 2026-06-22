'use client';

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 shadow-sm transition-colors"
    >
      Imprimir Comprobante
    </button>
  );
}
