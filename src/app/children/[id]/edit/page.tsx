"use client";

import { updateChild } from "@/lib/actions/children";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, Baby, Save, HeartPulse, ShieldAlert, Camera, User } from "lucide-react";
import { useState, useEffect, use, useRef } from "react";
import { getClassrooms } from "@/lib/actions/classrooms";
import { getChild } from "@/lib/actions/children";
import { AllergySelector } from "@/components/children/AllergySelector";

export default function EditChildPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const childId = parseInt(id);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [child, setChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      getClassrooms(),
      getChild(childId)
    ]).then(([classroomsData, childData]) => {
      setClassrooms(classroomsData);
      setChild(childData);
      setLoading(false);
    });
  }, [childId]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando información...</div>;
  }

  if (!child) {
    return <div className="p-8 text-center text-muted-foreground">Niño no encontrado</div>;
  }

  // Parse legacy notes for emergency contacts
  const notes = child.medical?.notes || '';
  const parsedBloodType = child.medical?.bloodType || notes.match(/Tipo de Sangre:\s*(.+)/)?.[1]?.trim() || '';
  const parsedAuthorized = child.medical?.authorizedPickup || notes.match(/Personas Autorizadas para Recogida:\s*(.+)/)?.[1]?.trim() || '';
  
  let parsedEmergencyName = child.medical?.emergencyContactName || '';
  let parsedEmergencyPhone = child.medical?.emergencyContactPhone || '';
  
  if (!parsedEmergencyName && !parsedEmergencyPhone) {
    const emergencyMatch = notes.match(/Contacto de Emergencia Alterno:\s*(.+)\s*\((.+)\)/);
    if (emergencyMatch) {
      parsedEmergencyName = emergencyMatch[1]?.trim();
      parsedEmergencyPhone = emergencyMatch[2]?.trim();
    } else {
      const fallbackMatch = notes.match(/Contacto de Emergencia Alterno:\s*(.+)/);
      if (fallbackMatch) parsedEmergencyName = fallbackMatch[1]?.trim();
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Back button and title */}
      <div className="flex items-center gap-4">
        <Link href={`/children/${childId}`}>
          <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600 transition-all">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
            <Baby className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Editar Registro: {child.firstName}</h1>
            <p className="text-sm text-muted-foreground">Actualiza los datos personales básicos y estado del menor en Nova Skill Kids.</p>
          </div>
        </div>
      </div>

      <form action={updateChild.bind(null, childId)} className="space-y-6">
        {/* Photo upload card */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-violet-50 to-indigo-50 border-b border-violet-100/50">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-violet-600" />
              <CardTitle className="text-base">Fotografía del Niño</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div 
                onClick={() => fileRef.current?.click()}
                className="relative group cursor-pointer"
              >
                <div className={`h-28 w-28 rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-300 ring-2 ring-offset-2 ${
                  preview || child.photoUrl 
                    ? 'ring-violet-300 shadow-lg shadow-violet-500/10' 
                    : 'ring-dashed ring-slate-300 bg-muted/50 hover:ring-violet-400 hover:bg-violet-50'
                }`}>
                  {preview || child.photoUrl ? (
                    <img src={preview || child.photoUrl} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground group-hover:text-violet-500 transition-colors">
                      <User className="h-8 w-8" />
                      <span className="text-[10px] font-medium">Subir Foto</span>
                    </div>
                  )}
                </div>
                {(preview || child.photoUrl) && (
                  <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Input 
                  ref={fileRef}
                  id="photo" 
                  name="photo" 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg" 
                  onChange={handlePhotoChange}
                  className="cursor-pointer file:bg-violet-50 file:text-violet-700 file:border-0 file:rounded-lg file:px-3 file:py-1 file:text-xs file:font-semibold hover:file:bg-violet-100 file:mr-3 file:transition-colors border-dashed" 
                />
                <p className="text-xs text-muted-foreground mt-2">La foto será visible en el expediente y en los controles de asistencia diaria. Deja vacío para mantener la foto actual.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-violet-50 to-indigo-50 border-b border-violet-100/50">
            <div className="flex items-center gap-2">
              <Baby className="h-4 w-4 text-violet-600" />
              <CardTitle className="text-base">Datos Personales</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">Nombres <span className="text-red-400">*</span></Label>
                <Input id="firstName" name="firstName" defaultValue={child.firstName} required className="rounded-xl border-slate-200 focus-visible:ring-violet-500/30"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">Apellidos <span className="text-red-400">*</span></Label>
                <Input id="lastName" name="lastName" defaultValue={child.lastName} required className="rounded-xl border-slate-200 focus-visible:ring-violet-500/30"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-sm font-medium">Fecha Nacimiento <span className="text-red-400">*</span></Label>
                <Input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={child.dateOfBirth ? (child.dateOfBirth instanceof Date ? child.dateOfBirth.toISOString().split('T')[0] : String(child.dateOfBirth).split('T')[0]) : ''} required className="rounded-xl border-slate-200 focus-visible:ring-violet-500/30"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium">Género <span className="text-red-400">*</span></Label>
                <select id="gender" name="gender" defaultValue={child.gender} required className="flex h-10 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500/30">
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="classroomId" className="text-sm font-medium">Aula Asignada</Label>
                <select id="classroomId" name="classroomId" defaultValue={child.classroomId || ""} className="flex h-10 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500/30">
                  <option value="">Sin Asignar</option>
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.capacity} cap.)</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">Estado del Expediente <span className="text-red-400">*</span></Label>
                <select id="status" name="status" defaultValue={child.status || 'active'} required className="flex h-10 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500/30">
                  <option value="active">Activo (Asistiendo)</option>
                  <option value="suspended">Suspendido Temporal</option>
                  <option value="graduated">Egresado / Inactivo</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tutor data card */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100/50">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-600" />
              <CardTitle className="text-base text-emerald-900">Datos del Tutor o Padre Principal</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <input type="hidden" name="existingParentId" value={child.parents?.[0]?.id || ""} />
              <div className="space-y-2">
                <Label htmlFor="tutorFirstName" className="text-sm font-medium">Nombre Tutor <span className="text-red-400">*</span></Label>
                <Input id="tutorFirstName" name="tutorFirstName" defaultValue={child.parents?.[0]?.firstName || ''} required placeholder="Ej. Laura" className="rounded-xl border-slate-200 focus-visible:ring-emerald-500/30"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tutorLastName" className="text-sm font-medium">Apellido Tutor <span className="text-red-400">*</span></Label>
                <Input id="tutorLastName" name="tutorLastName" defaultValue={child.parents?.[0]?.lastName || ''} required placeholder="Ej. Almonte" className="rounded-xl border-slate-200 focus-visible:ring-emerald-500/30"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tutorCedula" className="text-sm font-medium">Cédula / ID</Label>
                <Input id="tutorCedula" name="tutorCedula" defaultValue={child.parents?.[0]?.cedula || ''} placeholder="xxx-xxxxxxx-x" className="rounded-xl border-slate-200 focus-visible:ring-emerald-500/30"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tutorPhone" className="text-sm font-medium">Teléfono Móvil <span className="text-red-400">*</span></Label>
                <Input id="tutorPhone" name="tutorPhone" defaultValue={child.parents?.[0]?.phone || ''} type="tel" required placeholder="809-555-1234" className="rounded-xl border-slate-200 focus-visible:ring-emerald-500/30"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tutorEmail" className="text-sm font-medium">Correo Electrónico</Label>
                <Input id="tutorEmail" name="tutorEmail" defaultValue={child.parents?.[0]?.email || ''} type="email" placeholder="laura@ejemplo.com" className="rounded-xl border-slate-200 focus-visible:ring-emerald-500/30"/>
              </div>
              <div className="col-span-full space-y-2 lg:col-span-1">
                <Label htmlFor="tutorAddress" className="text-sm font-medium">Dirección Residencial</Label>
                <Input id="tutorAddress" name="tutorAddress" defaultValue={child.parents?.[0]?.address || ''} placeholder="Av. Independencia #45, Distrito Nacional" className="rounded-xl border-slate-200 focus-visible:ring-emerald-500/30"/>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tutorRelationship" className="text-sm font-medium">Relación con el Niño <span className="text-red-400">*</span></Label>
                <select id="tutorRelationship" name="tutorRelationship" defaultValue={child.parents?.[0]?.relationship || ''} required className="flex h-10 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/30">
                  <option value="">Selecciona...</option>
                  <option value="Madre">Madre</option>
                  <option value="Padre">Padre</option>
                  <option value="Abuelo/a">Abuelo/a</option>
                  <option value="Tío/a">Tío/a</option>
                  <option value="Tutor Legal">Tutor Legal</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency contacts card */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100/50">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <CardTitle className="text-base text-amber-900">Contactos de Emergencia y Retiro</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName" className="text-sm font-medium">Nombre de Contacto Alterno</Label>
                <Input id="emergencyContactName" name="emergencyContactName" defaultValue={parsedEmergencyName} placeholder="Ej. Juan Pérez (Abuelo)" className="rounded-xl border-slate-200 focus-visible:ring-amber-500/30"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone" className="text-sm font-medium">Teléfono de Emergencia</Label>
                <Input id="emergencyContactPhone" name="emergencyContactPhone" type="tel" defaultValue={parsedEmergencyPhone} placeholder="829-555-9876" className="rounded-xl border-slate-200 focus-visible:ring-amber-500/30"/>
              </div>
              <div className="col-span-full space-y-2">
                <Label htmlFor="authorizedPickup" className="text-sm font-medium">Personas Autorizadas para Recogida</Label>
                <Input id="authorizedPickup" name="authorizedPickup" defaultValue={parsedAuthorized} placeholder="Ej. Carlos Almonte (Tío), Lucía Pérez (Nana)" className="rounded-xl border-slate-200 focus-visible:ring-amber-500/30"/>
                <p className="text-xs text-muted-foreground">Listado de personas que pueden retirar al menor aparte del tutor principal.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical records card */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100/50">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-rose-600" />
              <CardTitle className="text-base text-rose-900">Expediente Médico Base</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="bloodType" className="text-sm font-medium">Tipo de Sangre</Label>
                <select id="bloodType" name="bloodType" defaultValue={parsedBloodType} className="flex h-9 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500/30">
                  <option value="">Desconocido</option>
                  <option value="O+">O+</option><option value="O-">O-</option>
                  <option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vaccines" className="text-sm font-medium">Estado de Vacunas</Label>
                <Input id="vaccines" name="vaccines" defaultValue={child.medical?.vaccines || ""} placeholder="Ej. Al día (Sarampeón, Rubeola, Polio)" className="rounded-xl border-slate-200 focus-visible:ring-rose-500/30"/>
              </div>
              <div className="col-span-full space-y-2">
                <Label className="text-sm font-medium">Alergias Conocidas</Label>
                <AllergySelector initialAllergies={child.medical?.allergies} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conditions" className="text-sm font-medium">Enfermedades Pre-existentes</Label>
                <Input id="conditions" name="conditions" defaultValue={child.medical?.conditions || ""} placeholder="Ej. Asma leve, Ninguna" className="rounded-xl border-slate-200 focus-visible:ring-rose-500/30"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="authorizedMeds" className="text-sm font-medium">Medicamentos Autorizados por Tutor</Label>
                <Input id="authorizedMeds" name="authorizedMeds" defaultValue={child.medical?.authorizedMeds || ""} placeholder="Ej. Acetaminofén (si fiebre > 38.5°C)" className="rounded-xl border-slate-200 focus-visible:ring-rose-500/30"/>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Link href={`/children/${childId}`}>
            <Button type="button" variant="outline" className="rounded-xl px-6 h-11">Cancelar</Button>
          </Link>
          <Button 
            type="submit" 
            className="h-11 gap-2 rounded-xl px-8 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 hover:-translate-y-0.5 font-semibold"
          >
            <Save className="h-5 w-5" />
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  );
}
