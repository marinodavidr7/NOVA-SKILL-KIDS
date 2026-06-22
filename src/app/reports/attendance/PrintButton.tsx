'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <Button 
      onClick={() => window.print()} 
      className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl flex items-center gap-2 print:hidden"
    >
      <Printer className="h-4 w-4" />
      Imprimir PDF
    </Button>
  );
}
