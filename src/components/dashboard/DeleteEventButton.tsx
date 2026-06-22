'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteEvent } from '@/lib/actions/dashboard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function DeleteEventButton({ eventId }: { eventId: number }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const confirmDelete = async () => {
    setIsDeleting(true);
    await deleteEvent(eventId);
    setIsOpen(false);
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
        onClick={() => setIsOpen(true)}
        disabled={isDeleting}
        title="Eliminar evento"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {/* Delete Confirmation Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-rose-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Eliminar Evento
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600">¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.</p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isDeleting}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Sí, Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
