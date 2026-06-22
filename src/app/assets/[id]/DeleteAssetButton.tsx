"use client";

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export function DeleteAssetButton({ deleteAction }: { deleteAction: () => void }) {
  return (
    <form action={deleteAction}>
      <Button 
        type="submit" 
        variant="destructive" 
        size="sm" 
        className="h-9 gap-2" 
        onClick={(e) => {
          if(!confirm('¿Estás seguro de que deseas eliminar este activo? Se borrará todo su historial de mantenimiento.')) {
            e.preventDefault();
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
        Eliminar
      </Button>
    </form>
  );
}
