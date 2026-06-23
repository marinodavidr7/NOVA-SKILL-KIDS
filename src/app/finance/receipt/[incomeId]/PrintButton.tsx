'use client';

import { useEffect } from 'react';

export default function PrintButton() {
  useEffect(() => {
    // Small timeout ensures styles are applied before print dialog opens
    const timer = setTimeout(() => {
      window.print();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <button 
      onClick={() => window.print()} 
      className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 shadow-sm transition-colors"
    >
      Imprimir Comprobante
    </button>
  );
}
