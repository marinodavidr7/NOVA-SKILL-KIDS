'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Receipt, X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

export default function ReceiptModal({ url, type = 'icon' }: { url: string, type?: 'icon' | 'button' | 'link' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Check if it's an image or a PDF
  const isPdf = url.toLowerCase().endsWith('.pdf');

  const handleZoomIn = () => setScale(s => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.25, 0.5));
  const handleRotate = () => setRotation(r => (r + 90) % 360);

  return (
    <>
      {type === 'icon' && (
        <Button onClick={() => { setIsOpen(true); setScale(1); setRotation(0); }} variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
          <Receipt className="h-4 w-4" />
        </Button>
      )}
      
      {type === 'link' && (
        <button type="button" onClick={() => { setIsOpen(true); setScale(1); setRotation(0); }} className="ml-2 inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-medium transition-colors">
          <Paperclip className="h-3 w-3" /> Factura
        </button>
      )}

      {type === 'button' && (
        <button type="button" onClick={() => { setIsOpen(true); setScale(1); setRotation(0); }} className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors">
          <Paperclip className="h-4 w-4" /> Ver Factura Principal
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in p-4 md:p-8">
          <div className="bg-white w-full max-w-5xl h-full max-h-[90vh] rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 bg-white z-10 relative">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-slate-500 shrink-0" />
                <span className="hidden sm:inline">Visualizador de Documento</span>
                <span className="sm:hidden text-sm">Documento</span>
              </h3>
              <div className="flex items-center gap-1 sm:gap-2">
                {!isPdf && (
                  <div className="flex items-center bg-slate-100 rounded-lg p-0.5 sm:p-1 mr-1 sm:mr-2">
                    <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7 rounded text-slate-600 hover:bg-white shadow-sm" onClick={handleZoomOut} title="Alejar">
                      <ZoomOut className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <div className="text-[10px] sm:text-xs font-medium text-slate-500 px-1 sm:px-2 min-w-[2.5rem] sm:min-w-[3rem] text-center">{Math.round(scale * 100)}%</div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7 rounded text-slate-600 hover:bg-white shadow-sm" onClick={handleZoomIn} title="Acercar">
                      <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <div className="w-px h-3 sm:h-4 bg-slate-300 mx-0.5 sm:mx-1"></div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7 rounded text-slate-600 hover:bg-white shadow-sm" onClick={handleRotate} title="Rotar">
                      <RotateCw className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                )}
                <a href={url} target="_blank" rel="noopener noreferrer" className="hidden sm:inline-block text-xs font-medium text-blue-600 hover:text-blue-700 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors">
                  Pestaña nueva
                </a>
                <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full text-slate-500 hover:bg-slate-100 shrink-0" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 p-4 bg-slate-100 overflow-auto flex items-center justify-center rounded-b-2xl relative">
              {isPdf ? (
                <iframe src={url} className="w-full h-full rounded-xl border border-slate-200 shadow-sm bg-white" />
              ) : (
                <div className="transition-transform duration-200 ease-out origin-center inline-block" style={{ transform: `scale(${scale}) rotate(${rotation}deg)` }}>
                  <img src={url} alt="Factura" className="max-w-full max-h-[75vh] object-contain shadow-md border border-slate-200 bg-white" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
