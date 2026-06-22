'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { FileText, Download, UploadCloud, Loader2, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { uploadDocument, deleteDocument } from '@/lib/actions/documents';
import { useRouter } from 'next/navigation';

interface EntityDocumentsCardProps {
  documents: any[];
  entityType: string;
  entityId: number;
  categoryId?: number; // Passed so we can upload directly
  entityName?: string; // e.g. the child's name
  role?: string; // Para determinar si es Chofer, etc.
}

export default function EntityDocumentsCard({ documents, entityType, entityId, categoryId, entityName, role }: EntityDocumentsCardProps) {
  const isStudent = entityType === 'Estudiantes';
  const isStaff = entityType === 'Personal';
  const router = useRouter();
  
  // Local state for optimistic updates
  const [localDocs, setLocalDocs] = useState<any[]>(documents);

  // Sync if props change
  React.useEffect(() => {
    setLocalDocs(documents);
  }, [documents]);
  
  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadDocType, setUploadDocType] = useState('');
  const [description, setDescription] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  // View Modal State
  const [viewDoc, setViewDoc] = useState<{ url: string, title: string } | null>(null);
  
  const requiredStudentDocs = [
    'Acta de Nacimiento',
    'Certificado Médico',
    'Cartilla de Vacunación'
  ];

  const requiredParentDocs = [
    'Identificación',
    'Contrato',
    'Póliza'
  ];

  const requiredStaffDocs = [
    'Copia de cédula de identidad',
    'Certificado de buena conducta',
    'Currículum vitae (CV)',
    'Certificado médico reciente',
    'Título universitario o técnico',
    'Certificados de estudios',
    'Diplomas de cursos y capacitaciones',
    'Contrato de trabajo',
    'Carta de nombramiento',
    'Descripción del puesto',
    'Historial de sanciones o reconocimientos',
    'Carta de renuncia o desvinculación'
  ];

  const requiredDriverDocs = [
    'Licencia de conducir vigente',
    'Certificado médico para conducir',
    'Certificado de no antecedentes penales',
    'Historial de infracciones',
    'Certificaciones de manejo defensivo'
  ];

  let currentRequiredDocs: string[] = [];
  if (isStudent) currentRequiredDocs = requiredStudentDocs;
  else if (entityType === 'Padres') currentRequiredDocs = requiredParentDocs;
  else if (isStaff) {
    currentRequiredDocs = [...requiredStaffDocs];
    if (role === 'Chofer' || role === 'Conductor') {
      currentRequiredDocs = [...currentRequiredDocs, ...requiredDriverDocs];
    }
  }

  // Logic to separate required and other documents
  const requiredStatus = currentRequiredDocs.map(reqType => {
    const foundDocs = localDocs.filter(d => d.documentType === reqType);
    return { type: reqType, docs: foundDocs };
  });

  const otherDocs = currentRequiredDocs.length > 0
    ? localDocs.filter(d => !currentRequiredDocs.includes(d.documentType))
    : localDocs;

  const handleOpenUpload = (docType: string) => {
    setUploadDocType(docType);
    setIsUploadOpen(true);
  };

  const resetForm = () => {
    setSelectedFiles([]);
    setUploadDocType('');
    setDescription('');
    setExpirationDate('');
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      toast.error('Debes seleccionar al menos un archivo');
      return;
    }
    if (!categoryId) {
      toast.error('Error de sistema: Faltan datos de categoría.');
      return;
    }

    setIsUploading(true);
    try {
      const newDocs: any[] = [];
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('categoryId', String(categoryId));
        
        if (uploadDocType) formData.append('documentType', uploadDocType);
        formData.append('entityId', String(entityId));
        formData.append('entityType', entityType);
        if (description) formData.append('description', description);
        if (expirationDate) formData.append('expirationDate', expirationDate);

        const res = await uploadDocument(formData);
        if (res.success) {
          newDocs.push({
            id: res.id || Date.now() + Math.random(),
            title: file.name,
            description: description,
            documentType: uploadDocType || 'Otro',
            uploadDate: new Date().toISOString(),
            fileUrl: '#' // Temporary until page refreshes
          });
        } else {
          throw new Error(res.error || `Error al subir el archivo ${file.name}`);
        }
      }
      
      toast.success(selectedFiles.length > 1 ? 'Documentos subidos correctamente' : 'Documento subido correctamente');
      
      // Optimistic UI Update
      setLocalDocs(prev => [...prev, ...newDocs]);
      
      setIsUploadOpen(false);
      resetForm();
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Ocurrió un error al procesar los archivos');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este documento? Esta acción no se puede deshacer.')) return;
    
    setIsDeleting(id);
    try {
      await deleteDocument(id);
      setLocalDocs(prev => prev.filter(d => d.id !== id));
      toast.success('Documento eliminado correctamente');
      router.refresh();
    } catch (error: any) {
      toast.error('Error al eliminar: ' + error.message);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <>
      <Card className="border-0 shadow-sm border-t-4 border-t-blue-600 mt-6">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2 text-blue-700 font-bold">
            <FileText className="h-5 w-5" />
            <span>Documentos Asociados</span>
          </div>
          <div className="flex gap-2">
            {!isStudent && (
              <Button variant="outline" size="sm" className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => {
                setUploadDocType('Otro');
                setIsUploadOpen(true);
              }}>
                <UploadCloud className="h-4 w-4 mr-1" />
                Subir
              </Button>
            )}
            {(entityType === 'Estudiantes' || entityType === 'Personal') && (
              <Link href={`/documents/${entityType === 'Estudiantes' ? 'students' : 'staff'}?autoSelectId=${entityId}&returnUrl=${encodeURIComponent(`/${entityType === 'Estudiantes' ? 'children' : 'staff'}/${entityId}`)}`}>
                <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:bg-blue-50">
                  Gestionar Documentos
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
        
        {/* Required Documents Section */}
        {currentRequiredDocs.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Documentos Requeridos</h4>
            {isStaff ? (
              <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-white">
                {requiredStatus.map((item, idx) => (
                  <div key={idx} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 ${idx !== requiredStatus.length - 1 ? 'border-b border-slate-100' : ''} ${item.docs.length > 0 ? 'bg-white' : 'bg-slate-50/50 hover:bg-slate-50 transition-colors'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${item.docs.length > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-500'}`}>
                        {item.docs.length > 0 ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{item.type}</span>
                        <span className={`text-[11px] font-semibold ${item.docs.length > 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {item.docs.length > 0 ? `Completado (${item.docs.length} archivo${item.docs.length !== 1 ? 's' : ''})` : 'Pendiente de entrega'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 ml-11 sm:ml-0">
                      {item.docs.length > 0 && (
                        <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                          {item.docs.map((doc: any) => (
                            <div key={doc.id} className="flex items-center justify-between sm:justify-end gap-3 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">
                              <span className="text-xs font-medium text-slate-600 truncate max-w-[150px] sm:max-w-[200px]" title={doc.title}>
                                {doc.title}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100" onClick={() => setViewDoc({ url: doc.fileUrl, title: doc.title })} title="Ver">
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-rose-600 hover:bg-rose-100" onClick={() => handleDelete(doc.id)} disabled={isDeleting === doc.id} title="Eliminar">
                                  {isDeleting === doc.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <Button 
                        variant={item.docs.length === 0 ? "outline" : "ghost"} 
                        size="sm" 
                        onClick={() => handleOpenUpload(item.type)} 
                        className={item.docs.length === 0 ? "h-8 text-xs shrink-0" : "h-8 w-8 p-0 shrink-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50"}
                        title={item.docs.length === 0 ? "Subir documento" : "Añadir otro archivo"}
                      >
                        {item.docs.length === 0 ? (
                          <>
                            <UploadCloud className="h-3.5 w-3.5 mr-1.5" />
                            Subir
                          </>
                        ) : (
                          <UploadCloud className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {requiredStatus.map((item, idx) => (
                  <div key={idx} className={`flex flex-col p-3 rounded-xl border ${item.docs.length > 0 ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50 border-dashed'} transition-colors gap-3`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${item.docs.length > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-500'}`}>
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold ${item.docs.length > 0 ? 'text-emerald-900' : 'text-rose-700'}`}>{item.type}</span>
                          <span className={`text-[10px] font-bold ${item.docs.length > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {item.docs.length > 0 ? `Entregado (${item.docs.length})` : 'Faltante'}
                          </span>
                        </div>
                      </div>
                      {item.docs.length === 0 && (
                        <Button variant="outline" size="sm" onClick={() => handleOpenUpload(item.type)} className="h-7 text-[10px] border-rose-300 text-rose-600 hover:bg-rose-100">
                          Subir
                        </Button>
                      )}
                      {item.docs.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={() => handleOpenUpload(item.type)} className="h-7 w-7 p-0 text-emerald-600 hover:bg-emerald-200" title="Añadir otro archivo">
                          <UploadCloud className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {item.docs.length > 0 && (
                      <div className="flex flex-col gap-2 mt-1 border-t border-emerald-100 pt-2">
                        {/* Grid de imágenes (Frente y reverso, etc) apiladas verticalmente */}
                        {item.docs.filter(d => d.fileUrl?.match(/\.(jpeg|jpg|gif|png|webp|avif)$/i)).length > 0 && (
                          <div className="flex flex-col gap-2">
                            {item.docs.filter(d => d.fileUrl?.match(/\.(jpeg|jpg|gif|png|webp|avif)$/i)).map(doc => (
                              <div key={doc.id} className="relative aspect-video w-full rounded-md overflow-hidden group border border-emerald-200 bg-emerald-50">
                                <img src={doc.fileUrl} alt={doc.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <Button size="icon" variant="secondary" className="h-6 w-6" onClick={() => setViewDoc({ url: doc.fileUrl, title: doc.title || item.type })}><Eye className="h-3 w-3" /></Button>
                                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" download>
                                    <Button size="icon" variant="secondary" className="h-6 w-6"><Download className="h-3 w-3" /></Button>
                                  </a>
                                  <Button 
                                    size="icon" 
                                    variant="destructive" 
                                    className="h-6 w-6" 
                                    onClick={() => handleDelete(doc.id)}
                                    disabled={isDeleting === doc.id}
                                  >
                                    {isDeleting === doc.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Lista de documentos no-imagen (PDF, DOCX, etc) */}
                        {item.docs.filter(d => !d.fileUrl?.match(/\.(jpeg|jpg|gif|png|webp|avif)$/i)).map(doc => (
                          <div key={doc.id} className="flex items-center justify-between bg-white/60 p-1.5 rounded-lg border border-emerald-100/50">
                            <span className="text-[10px] font-medium text-emerald-800 line-clamp-1 flex-1" title={doc.title}>
                              {doc.title}
                            </span>
                            {doc.fileUrl && doc.fileUrl !== '#' && (
                              <div className="flex gap-0.5 shrink-0">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 text-emerald-600 hover:bg-emerald-200"
                                  onClick={() => setViewDoc({ url: doc.fileUrl, title: doc.title || item.type })}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" download>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-emerald-600 hover:bg-emerald-200">
                                    <Download className="h-3 w-3" />
                                  </Button>
                                </a>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 text-rose-500 hover:bg-rose-100 hover:text-rose-700" 
                                  onClick={() => handleDelete(doc.id)}
                                  disabled={isDeleting === doc.id}
                                >
                                  {isDeleting === doc.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Other Documents Section */}
        <div>
          {currentRequiredDocs.length > 0 && otherDocs.length > 0 && (
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 mt-4">Otros Documentos</h4>
          )}
          {otherDocs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {otherDocs.map((doc) => {
                const isImg = doc.fileUrl && doc.fileUrl.match(/\.(jpeg|jpg|gif|png|webp|avif)$/i);
                
                return isImg ? (
                  <div key={doc.id} className="relative aspect-video w-full rounded-xl overflow-hidden group border border-slate-200 bg-slate-50 shadow-sm">
                    <img src={doc.fileUrl} alt={doc.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <span className="text-white text-xs font-bold truncate mb-2">{doc.title}</span>
                      <div className="flex gap-2">
                        <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => setViewDoc({ url: doc.fileUrl, title: doc.title })}><Eye className="h-4 w-4" /></Button>
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" download>
                          <Button size="icon" variant="secondary" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                        </a>
                        <Button 
                          size="icon" 
                          variant="destructive" 
                          className="h-8 w-8" 
                          onClick={() => handleDelete(doc.id)}
                          disabled={isDeleting === doc.id}
                        >
                          {isDeleting === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-200 p-2 rounded-lg text-slate-600">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 line-clamp-1" title={doc.title}>{doc.title}</span>
                        <span className="text-[10px] text-slate-500">{new Date(doc.uploadDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {doc.fileUrl && doc.fileUrl !== '#' && (
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-blue-600 hover:bg-blue-100"
                          onClick={() => setViewDoc({ url: doc.fileUrl, title: doc.title })}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" download>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-100">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-rose-500 hover:bg-rose-100 hover:text-rose-700" 
                          onClick={() => handleDelete(doc.id)}
                          disabled={isDeleting === doc.id}
                        >
                          {isDeleting === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 flex flex-col items-center">
              <FileText className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No hay otros documentos vinculados.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* In-Place Upload Modal */}
    <Dialog open={isUploadOpen} onOpenChange={(open) => { setIsUploadOpen(open); if(!open) resetForm(); }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Subir {uploadDocType}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUploadSubmit} className="space-y-4 py-4">
          
          <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4">
            Subiendo documento para: <strong>{entityName || `Expediente #${entityId}`}</strong>
          </div>

          <div className="space-y-2">
            <Label>Archivo(s) *</Label>
            <Input 
              type="file" 
              multiple
              onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
              required
            />
            <p className="text-[10px] text-slate-500">Puedes seleccionar múltiples archivos (ej. frente y reverso de la cédula).</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha de Vencimiento (Opcional)</Label>
              <Input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descripción / Notas (Opcional)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)} disabled={isUploading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isUploading || selectedFiles.length === 0} className="bg-blue-600 text-white hover:bg-blue-700">
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UploadCloud className="h-4 w-4 mr-2" />}
              {isUploading ? 'Subiendo...' : 'Guardar Documento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    {/* Document Viewer Modal */}
    <Dialog open={!!viewDoc} onOpenChange={(open) => { if(!open) setViewDoc(null); }}>
      <DialogContent className="sm:max-w-4xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="truncate">{viewDoc?.title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 bg-slate-100 rounded-lg overflow-hidden border">
          {viewDoc && (
            <iframe 
              src={viewDoc.url} 
              className="w-full h-full"
              title={viewDoc.title}
            />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setViewDoc(null)}>Cerrar</Button>
          {viewDoc && (
            <a href={viewDoc.url} target="_blank" rel="noopener noreferrer" download>
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" /> Descargar Original
              </Button>
            </a>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
  );
}
