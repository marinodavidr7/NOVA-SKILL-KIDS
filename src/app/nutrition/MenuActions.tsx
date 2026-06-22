'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { deleteMenu } from '@/lib/actions/nutrition';

export default function MenuActions({ menuId }: { menuId: number }) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await deleteMenu(menuId);
    setShowConfirm(false);
    setDeleting(false);
    router.refresh();
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
        <span className="text-xs font-semibold text-rose-600 mr-auto">¿Eliminar este menú?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-3 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
        >
          {deleting ? 'Eliminando...' : 'Sí, eliminar'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
      <Link
        href={`/nutrition/${menuId}/edit`}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-violet-50 hover:text-violet-700 rounded-lg transition-all border border-slate-200 hover:border-violet-200"
      >
        <Pencil className="h-3.5 w-3.5" />
        Editar
      </Link>
      <button
        onClick={() => setShowConfirm(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-all border border-slate-200 hover:border-rose-200"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Eliminar
      </button>
    </div>
  );
}
