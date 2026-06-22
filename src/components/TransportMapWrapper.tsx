'use client';

import dynamic from 'next/dynamic';
import { Map as MapIcon } from 'lucide-react';

const TransportMap = dynamic(() => import('./TransportMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-slate-100 rounded-xl animate-pulse flex flex-col items-center justify-center border border-slate-200">
      <MapIcon className="h-10 w-10 text-slate-300 mb-2" />
      <span className="text-slate-400 font-medium">Cargando motor de mapas...</span>
    </div>
  )
});

export default function TransportMapWrapper() {
  return <TransportMap />;
}
