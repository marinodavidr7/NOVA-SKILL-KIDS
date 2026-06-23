"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Search, Filter, Download, Eye, Edit, Trash2, Baby, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem 
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import Link from "next/link";
import { deleteChild } from "@/lib/actions/children";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface ChildrenListClientProps {
  childrenData: any[];
  canRegisterChild: boolean;
}

export default function ChildrenListClient({ childrenData, canRegisterChild }: ChildrenListClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const [childToDelete, setChildToDelete] = useState<number | null>(null);

  const confirmDelete = async () => {
    if (childToDelete === null) return;
    setIsDeleting(childToDelete);
    try {
      await deleteChild(childToDelete);
      toast.success("Expediente eliminado correctamente");
    } catch (e) {
      toast.error("Error al eliminar el expediente");
    }
    setIsDeleting(null);
    setChildToDelete(null);
  };

  const filteredChildren = childrenData.filter(child => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${child.firstName} ${child.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchLower) || child.id.toString().includes(searchLower);
    
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && child.status === statusFilter;
  });

  const exportToExcel = () => {
    if (filteredChildren.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }
    
    // Formatting data for Excel
    const data = filteredChildren.map(child => ({
      "ID": child.id,
      "Nombre": child.firstName,
      "Apellido": child.lastName,
      "Fecha de Nacimiento": child.dateOfBirth ? child.dateOfBirth.split('-').reverse().join('/') : "No registrada",
      "Género": child.gender === "M" || child.gender === 'male' ? "Masculino" : child.gender === "F" || child.gender === 'female' ? "Femenino" : child.gender,
      "Estado": child.status === "active" ? "Activo" : child.status === "suspended" ? "Suspendido" : "Egresado",
      "Tutor Principal": child.tutorFirstName ? `${child.tutorFirstName} ${child.tutorLastName || ''}`.trim() : "No registrado",
      "Familia (Relación)": child.tutorRelationship || "No registrada",
      "Alergias": child.allergies || "Ninguna"
    }));

    // Create a new workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expedientes");

    // Auto-size columns slightly
    const colWidths = [
      { wch: 10 }, // ID
      { wch: 20 }, // Nombre
      { wch: 20 }, // Apellido
      { wch: 20 }, // Fecha de Nacimiento
      { wch: 15 }, // Género
      { wch: 15 }, // Estado
      { wch: 25 }, // Tutor
      { wch: 20 }, // Familia
      { wch: 30 }  // Alergias
    ];
    worksheet["!cols"] = colWidths;

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `expedientes_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <>
      {/* Filters bar */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nombre, apellido o ID..." 
                className="pl-9 bg-muted/50 border-0 focus-visible:ring-violet-500/30 rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger className={buttonVariants({ variant: "outline", size: "sm" }) + " gap-2 rounded-xl"}>
                  <Filter className="h-4 w-4" />
                  Filtros {statusFilter !== 'all' && <span className="ml-1 flex h-2 w-2 rounded-full bg-violet-600"></span>}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                    <DropdownMenuRadioItem value="all">Todos los estados</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="active">Activos</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="suspended">Suspendidos</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="graduated">Egresados</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={exportToExcel}>
                <Download className="h-4 w-4" />
                Exportar Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Activos</p>
                <p className="text-2xl font-bold text-emerald-700">{filteredChildren.filter((c: any) => c.status === 'active').length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Suspendidos</p>
                <p className="text-2xl font-bold text-amber-700">{filteredChildren.filter((c: any) => c.status === 'suspended').length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-amber-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-gray-100">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Egresados</p>
                <p className="text-2xl font-bold text-slate-700">{filteredChildren.filter((c: any) => c.status === 'graduated').length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-slate-400"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-[72px] pl-6">Foto</TableHead>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Fecha de Nacimiento</TableHead>
                <TableHead>Edad</TableHead>
                <TableHead>Género</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right pr-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChildren.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                        <Baby className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">No hay niños encontrados</p>
                        <p className="text-sm">Intenta con otro término de búsqueda.</p>
                      </div>
                      {canRegisterChild && (
                        <Link href="/children/new">
                          <Button size="sm" className="mt-2 gap-2 bg-gradient-to-r from-violet-600 to-indigo-600">
                            <PlusCircle className="h-4 w-4" />
                            Registrar Niño
                          </Button>
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredChildren.map((child: any, index: number) => {
                  const birthDate = new Date(child.dateOfBirth);
                  const today = new Date();
                  let age = today.getFullYear() - birthDate.getFullYear();
                  const monthDiff = today.getMonth() - birthDate.getMonth();
                  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
                  
                  return (
                    <TableRow 
                      key={child.id} 
                      className="group hover:bg-violet-50/50 transition-colors duration-200"
                    >
                      <TableCell className="pl-6">
                        <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                          <AvatarImage src={child.photoUrl || ''} className="object-cover" />
                          <AvatarFallback className="bg-gradient-to-br from-violet-400 to-purple-500 text-white text-xs font-semibold">
                            {child.firstName[0]}{child.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-foreground">{child.firstName} {child.lastName}</p>
                          <p className="text-xs text-muted-foreground">ID: #{String(child.id).padStart(4, '0')}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {birthDate.toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{age} {age === 1 ? 'año' : 'años'}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {child.gender === 'male' ? '♂ Masculino' : child.gender === 'female' ? '♀ Femenino' : child.gender}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          child.status === 'active' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : child.status === 'suspended'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            child.status === 'active' 
                              ? 'bg-emerald-500' 
                              : child.status === 'suspended'
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`}></span>
                          {child.status === 'active' ? 'Activo' : child.status === 'suspended' ? 'Suspendido' : 'Egresado'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Link href={`/children/${child.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-violet-600 hover:bg-violet-100 hover:text-violet-700">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/children/${child.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Eliminar Expediente"
                            disabled={isDeleting === child.id}
                            onClick={() => setChildToDelete(child.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={childToDelete !== null} onOpenChange={(open) => { if (!open) setChildToDelete(null); }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-rose-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Eliminar Expediente
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600">¿Estás seguro de que deseas eliminar este expediente de forma permanente? Esta acción no se puede deshacer.</p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setChildToDelete(null)} disabled={isDeleting !== null}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting !== null}>
              {isDeleting !== null ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Sí, Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
