'use client'

import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Trash2, Search, UploadCloud, FileIcon, Loader2, ArrowLeft, Eye } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { uploadDocument, deleteDocument } from '@/lib/actions/documents';

interface Entity {
  id: number;
  name: string;
}

interface DocumentListClientProps {
  documents: any[];
  categoryId: number;
  categoryName: string;
  themeColor: 'blue' | 'emerald' | 'violet';
  entities?: Entity[];
  documentTypes?: string[];
  autoSelectId?: string;
  autoSelectDocType?: string;
  returnUrl?: string;
}

export default function DocumentListClient({ 
  documents, 
  categoryId, 
  categoryName, 
  themeColor,
  entities = [],
  documentTypes = ['Acta de Nacimiento', 'Identificación', 'Certificado Médico', 'Cartilla de Vacunación', 'Contrato', 'Póliza', 'Otro'],
  autoSelectId,
  autoSelectDocType,
  returnUrl
}: DocumentListClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [docTypeFilter, setDocTypeFilter] = useState('all');
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  
  // Form State
  const [entityId, setEntityId] = useState<string>(autoSelectId || '');
  const [documentType, setDocumentType] = useState<string>(
    autoSelectDocType && documentTypes.includes(autoSelectDocType) ? autoSelectDocType : (autoSelectDocType ? 'Otro' : '')
  );
  const [customDocType, setCustomDocType] = useState<string>(
    autoSelectDocType && !documentTypes.includes(autoSelectDocType) ? autoSelectDocType : ''
  );
  const [description, setDescription] = useState<string>('');
  const [expirationDate, setExpirationDate] = useState<string>('');

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // View Modal State
  const [viewDoc, setViewDoc] = useState<{ url: string, title: string } | null>(null);

  const processedParams = useRef<string>('');

  // Auto-open logic
  React.useEffect(() => {
    const currentParams = `${autoSelectId || ''}-${autoSelectDocType || ''}`;
    if ((autoSelectId || autoSelectDocType) && processedParams.current !== currentParams) {
      if (autoSelectId) setEntityId(autoSelectId);
      if (autoSelectDocType) {
        if (documentTypes.includes(autoSelectDocType)) {
          setDocumentType(autoSelectDocType);
        } else {
          setDocumentType('Otro');
          setCustomDocType(autoSelectDocType);
        }
      }
      setIsUploadOpen(true);
      processedParams.current = currentParams;
      
      // Clean up the URL quietly so it doesn't linger visually
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [autoSelectId, autoSelectDocType, documentTypes]);

  const theme = {
    blue: { from: 'from-blue-500', to: 'to-indigo-600', shadow: 'shadow-blue-500/20', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', btnHover: 'hover:from-blue-600 hover:to-indigo-700' },
    emerald: { from: 'from-emerald-500', to: 'to-teal-600', shadow: 'shadow-emerald-500/20', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', btnHover: 'hover:from-emerald-600 hover:to-teal-700' },
    violet: { from: 'from-violet-500', to: 'to-purple-600', shadow: 'shadow-violet-500/20', bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200', btnHover: 'hover:from-violet-600 hover:to-purple-700' }
  }[themeColor];

  const filteredDocs = documents.filter(d => {
    const matchesSearch = 
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (d.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.documentType || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesEntity = entityFilter === 'all' 
      ? true 
      : (entityFilter === 'none' ? !d.entityId : String(d.entityId) === entityFilter);

    const matchesDocType = docTypeFilter === 'all'
      ? true
      : d.documentType === docTypeFilter;

    return matchesSearch && matchesEntity && matchesDocType;
  });

  const resetForm = () => {
    setSelectedFiles([]);
    setEntityId('');
    setDocumentType('');
    setCustomDocType('');
    setDescription('');
    setExpirationDate('');
  };

  const handleClose = () => {
    setIsUploadOpen(false);
    resetForm();
    if (returnUrl) {
      router.push(returnUrl);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      toast.error('Debes seleccionar al menos un archivo');
      return;
    }

    setIsUploading(true);
    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('categoryId', String(categoryId));
        
        const finalDocType = documentType === 'Otro' ? customDocType : documentType;
        
        if (finalDocType) formData.append('documentType', finalDocType);
        if (entityId && entityId !== 'none') {
          formData.append('entityId', entityId);
          formData.append('entityType', categoryName);
        }
        if (description) formData.append('description', description);
        if (expirationDate) formData.append('expirationDate', expirationDate);

        const res = await uploadDocument(formData);
        if (!res.success) {
          throw new Error(res.error || `Error al subir el archivo ${file.name}`);
        }
      }
      
      toast.success(selectedFiles.length > 1 ? 'Documentos subidos correctamente' : 'Documento subido correctamente');
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

  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);

  const confirmDelete = async () => {
    if (documentToDelete === null) return;
    setIsDeleting(documentToDelete);
    const res = await deleteDocument(documentToDelete);
    if (res.success) {
      toast.success('Documento eliminado');
    } else {
      toast.error('Error al eliminar');
    }
    setIsDeleting(null);
    setDocumentToDelete(null);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/documents">
            <Button variant="ghost" size="icon" className="rounded-full shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className={`flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${theme.from} ${theme.to} shadow-lg ${theme.shadow} shrink-0`}>
            <FileText className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Expedientes: {categoryName}</h1>
            <p className="text-sm text-slate-500 mt-1">Gestiona los archivos y registros de esta categoría.</p>
          </div>
        </div>
        
        <Button 
          onClick={() => setIsUploadOpen(true)}
          className={`gap-2 bg-gradient-to-r ${theme.from} ${theme.to} ${theme.btnHover} shadow-lg ${theme.shadow} transition-all duration-300 rounded-xl text-white h-11 px-6`}
        >
          <UploadCloud className="h-4 w-4" />
          Subir Documento
        </Button>
      </div>

      {/* Upload Modal */}
      <Dialog open={isUploadOpen} onOpenChange={(open) => { if (!open) handleClose(); else setIsUploadOpen(true); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Subir Nuevo Documento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUploadSubmit} className="space-y-4 py-4">
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
            
            {entities.length > 0 && (
              <div className="space-y-2">
                <Label>Vincular a (Opcional)</Label>
                <Select value={entityId} onValueChange={(v) => setEntityId(v || '')}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Seleccionar ${categoryName.toLowerCase()}...`}>
                      {entityId && entityId !== 'none' 
                        ? entities.find(e => String(e.id) === entityId)?.name 
                        : (entityId === 'none' ? 'General / Ninguno' : undefined)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">General / Ninguno</SelectItem>
                    {entities.map(e => (
                      <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Tipo de Documento</Label>
              <Select value={documentType} onValueChange={(v) => setDocumentType(v || '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo..." />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {documentType === 'Otro' && (
              <div className="space-y-2">
                <Label>Especificar Tipo</Label>
                <Input value={customDocType} onChange={(e) => setCustomDocType(e.target.value)} required />
              </div>
            )}

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
              <Button type="button" variant="outline" onClick={handleClose} disabled={isUploading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isUploading || selectedFiles.length === 0} className={`bg-gradient-to-r ${theme.from} ${theme.to} text-white`}>
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UploadCloud className="h-4 w-4 mr-2" />}
                {isUploading ? 'Subiendo...' : 'Guardar Documento'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Main Card */}
      <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Buscar por nombre o tipo..." 
                  className="pl-9 h-10 bg-white dark:bg-slate-800 border-slate-200" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {entities.length > 0 && (
                <div className="w-full sm:w-72">
                  <Select value={entityFilter} onValueChange={(v) => setEntityFilter(v || 'all')}>
                    <SelectTrigger className="w-full h-10 bg-white dark:bg-slate-800 border-slate-200 truncate">
                      <SelectValue placeholder="Filtrar por vinculado">
                        {entityFilter === 'all' 
                          ? 'Todos los registros' 
                          : entityFilter === 'none' 
                            ? 'General / No vinculado' 
                            : entities.find(e => String(e.id) === entityFilter)?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los registros</SelectItem>
                      <SelectItem value="none">General / No vinculado</SelectItem>
                      {entities.map(e => (
                        <SelectItem key={e.id} value={String(e.id)}>
                          {e.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="w-full sm:w-64">
                <Select value={docTypeFilter} onValueChange={(v) => setDocTypeFilter(v || 'all')}>
                  <SelectTrigger className="w-full h-10 bg-white dark:bg-slate-800 border-slate-200 truncate">
                    <SelectValue placeholder="Tipo de Documento">
                      {docTypeFilter === 'all' ? 'Todos los tipos' : docTypeFilter}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    {documentTypes.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 hover:bg-transparent">
                  <TableHead>Documento</TableHead>
                  <TableHead>Tipo / Categoría</TableHead>
                  {entities.length > 0 && <TableHead>Vinculado a</TableHead>}
                  <TableHead>Subido por</TableHead>
                  <TableHead>Fecha / Venc.</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={entities.length > 0 ? 6 : 5} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <FileIcon className="h-10 w-10 text-slate-300 mb-3" />
                        <p className="font-medium text-slate-900 dark:text-slate-100">No hay documentos</p>
                        <p className="text-sm">Sube un archivo para comenzar</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocs.map((doc) => {
                    const linkedEntity = entities.find(e => e.id === doc.entityId);
                    const isExpired = doc.expirationDate && new Date(doc.expirationDate) < new Date();
                    
                    return (
                      <TableRow key={doc.id} className="group">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg ${theme.bg} flex items-center justify-center shrink-0`}>
                              <FileText className={`h-4 w-4 ${theme.text}`} />
                            </div>
                            <div className="flex flex-col">
                              <span className="line-clamp-1" title={doc.title}>{doc.title}</span>
                              {doc.description && <span className="text-[10px] text-muted-foreground line-clamp-1">{doc.description}</span>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs uppercase px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md font-medium text-slate-600 dark:text-slate-300">
                            {doc.documentType || 'General'}
                          </span>
                        </TableCell>
                        {entities.length > 0 && (
                          <TableCell className="text-sm font-medium">
                            {linkedEntity ? linkedEntity.name : <span className="text-slate-400 italic">General</span>}
                          </TableCell>
                        )}
                        <TableCell className="text-sm text-slate-500">
                          {doc.uploaderFirstName ? `${doc.uploaderFirstName} ${doc.uploaderLastName}` : 'Sistema'}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          <div className="flex flex-col">
                            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                            {doc.expirationDate && (
                              <span className={`text-[10px] font-bold ${isExpired ? 'text-red-500' : 'text-amber-500'}`}>
                                Vence: {new Date(doc.expirationDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {doc.fileUrl && doc.fileUrl !== '#' && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-blue-600 hover:bg-blue-100"
                                  onClick={() => setViewDoc({ url: doc.fileUrl, title: doc.title })}
                                  title="Ver documento"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" download>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50" title="Descargar">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </a>
                              </>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                              onClick={() => setDocumentToDelete(doc.id)}
                              disabled={isDeleting === doc.id}
                              title="Eliminar"
                            >  {isDeleting === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
                <Button className={`bg-gradient-to-r ${theme.from} ${theme.to} text-white`}>
                  <Download className="h-4 w-4 mr-2" /> Descargar Original
                </Button>
              </a>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Modal */}
      <Dialog open={documentToDelete !== null} onOpenChange={(open) => { if (!open) setDocumentToDelete(null); }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-rose-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Eliminar Documento
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600">¿Estás seguro de que deseas eliminar este documento de forma permanente? Esta acción no se puede deshacer.</p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDocumentToDelete(null)} disabled={isDeleting !== null}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting !== null}>
              {isDeleting !== null ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Sí, Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
