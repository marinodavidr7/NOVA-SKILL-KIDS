'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export default function PrintERIButton() {
  return (
    <Button 
      variant="outline" 
      className="text-slate-600 bg-white shadow-sm border-slate-200 print:hidden"
      onClick={() => window.print()}
    >
      <Printer className="h-4 w-4 mr-2" />
      Imprimir ERI
    </Button>
  );
}
