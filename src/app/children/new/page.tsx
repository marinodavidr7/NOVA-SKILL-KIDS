"use client";

import { createChild } from "@/lib/actions/children";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, Baby, Camera, Save, User, Phone, Mail, MapPin, HeartPulse, ShieldAlert, FileText, CheckSquare } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { getParents } from "@/lib/actions/parents";
import { getClassrooms } from "@/lib/actions/classrooms";
import { AllergySelector } from "@/components/children/AllergySelector";
import { getCentroSettings } from "@/lib/actions/settings";

export default function NewChildPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [useExistingParent, setUseExistingParent] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState("");
  const [matriculaAmount, setMatriculaAmount] = useState(12000);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getClassrooms().then(setClassrooms);
    getParents().then(setParents);
    getCentroSettings().then(settings => {
      if (settings.matriculaAmount !== undefined) {
        setMatriculaAmount(settings.matriculaAmount);
      }
    });
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Back button and title */}
      <div className="flex items-center gap-4">
        <Link href="/children">
          <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600 transition-all">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
            <Baby className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Inscripción y Admisión Integral</h1>
            <p className="text-sm text-muted-foreground">Formulario unificado para expediente del niño, tutores y perfil médico.</p>
          </div>
        </div>
      </div>

      <form action={createChild} className="space-y-6">
        {/* Photo upload card */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-violet-50 to-indigo-50 border-b border-violet-100/50">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-violet-600" />
              <CardTitle className="text-base">1. Fotografía del Niño</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div 
                onClick={() => fileRef.current?.click()}
                className="relative group cursor-pointer"
              >
                <div className={`h-28 w-28 rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-300 ring-2 ring-offset-2 ${
                  preview 
                    ? 'ring-violet-300 shadow-lg shadow-violet-500/10' 
                    : 'ring-dashed ring-slate-300 bg-muted/50 hover:ring-violet-400 hover:bg-violet-50'
                }`}>
                  {preview ? (
                    <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground group-hover:text-violet-500 transition-colors">
                      <User className="h-8 w-8" />
                      <span className="text-[10px] font-medium">Subir Foto</span>
                    </div>
                  )}
                </div>
                {preview && (
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
                  required
                  onChange={handlePhotoChange}
                  className="cursor-pointer file:bg-violet-50 file:text-violet-700 file:border-0 file:rounded-lg file:px-3 file:py-1 file:text-xs file:font-semibold hover:file:bg-violet-100 file:mr-3 file:transition-colors border-dashed" 
                />
                <p className="text-xs text-muted-foreground mt-2">La foto será visible en el expediente y en los controles de asistencia diaria.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal data card */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-violet-50 to-indigo-50 border-b border-violet-100/50">
            <div className="flex items-center gap-2">
              <Baby className="h-4 w-4 text-violet-600" />
              <CardTitle className="text-base">2. Datos Personales del Niño</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">Nombres <span className="text-red-400">*</span></Label>
                <Input id="firstName" name="firstName" required placeholder="Ej. Liam Mateo" className="rounded-xl border-slate-200 focus-visible:ring-violet-500/30"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">Apellidos <span className="text-red-400">*</span></Label>
                <Input id="lastName" name="lastName" required placeholder="Ej. Almonte" className="rounded-xl border-slate-200 focus-visible:ring-violet-500/30"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-sm font-medium">Fecha Nacimiento <span className="text-red-400">*</span></Label>
                <Input id="dateOfBirth" name="dateOfBirth" type="date" required className="rounded-xl border-slate-200 focus-visible:ring-violet-500/30"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium">Género <span className="text-red-400">*</span></Label>
                <select id="gender" name="gender" required className="flex h-9 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500/30">
                  <option value="">Selecciona...</option>
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="classroomId" className="text-sm font-medium">Aula Asignada</Label>
                <select id="classroomId" name="classroomId" className="flex h-9 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500/30">
                  <option value="">Sin Aula...</option>
                  {classrooms.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.capacity} cap.)</option>
                  ))}
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
              <CardTitle className="text-base text-emerald-900">3. Datos del Tutor o Padre Principal</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex gap-4 mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={!useExistingParent} onChange={() => { setUseExistingParent(false); setSelectedParentId(""); }} className="accent-emerald-600" />
                <span className="text-sm font-medium">Registrar Nuevo Tutor</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={useExistingParent} onChange={() => setUseExistingParent(true)} className="accent-emerald-600" />
                <span className="text-sm font-medium">Seleccionar Tutor Existente</span>
              </label>
            </div>

            {useExistingParent && (
              <div className="mb-6 space-y-2 max-w-md">
                <Label htmlFor="existingParentId" className="text-sm font-medium">Seleccione el Tutor <span className="text-red-400">*</span></Label>
                <select id="existingParentId" name="existingParentId" required={useExistingParent} value={selectedParentId} onChange={(e) => setSelectedParentId(e.target.value)} className="flex h-10 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/30">
                  <option value="">Selecciona...</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName} {p.cedula ? `(${p.cedula})` : ''}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {!useExistingParent && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="tutorFirstName" className="text-sm font-medium">Nombre Tutor <span className="text-red-400">*</span></Label>
                    <Input id="tutorFirstName" name="tutorFirstName" required={!useExistingParent} placeholder="Ej. Laura" className="rounded-xl border-slate-200 focus-visible:ring-emerald-500/30"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tutorLastName" className="text-sm font-medium">Apellido Tutor <span className="text-red-400">*</span></Label>
                    <Input id="tutorLastName" name="tutorLastName" required={!useExistingParent} placeholder="Ej. Almonte" className="rounded-xl border-slate-200 focus-visible:ring-emerald-500/30"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tutorCedula" className="text-sm font-medium">Cédula / ID</Label>
                    <Input id="tutorCedula" name="tutorCedula" placeholder="xxx-xxxxxxx-x" className="rounded-xl border-slate-200 focus-visible:ring-emerald-500/30"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tutorPhone" className="text-sm font-medium">Teléfono Móvil <span className="text-red-400">*</span></Label>
                    <Input id="tutorPhone" name="tutorPhone" type="tel" required={!useExistingParent} placeholder="809-555-1234" className="rounded-xl border-slate-200 focus-visible:ring-emerald-500/30"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tutorEmail" className="text-sm font-medium">Correo Electrónico</Label>
                    <Input id="tutorEmail" name="tutorEmail" type="email" placeholder="laura@ejemplo.com" className="rounded-xl border-slate-200 focus-visible:ring-emerald-500/30"/>
                  </div>
                  <div className="col-span-full space-y-2 lg:col-span-1">
                    <Label htmlFor="tutorAddress" className="text-sm font-medium">Dirección Residencial</Label>
                    <Input id="tutorAddress" name="tutorAddress" placeholder="Av. Independencia #45, Distrito Nacional" className="rounded-xl border-slate-200 focus-visible:ring-emerald-500/30"/>
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="tutorRelationship" className="text-sm font-medium">Relación con el Niño <span className="text-red-400">*</span></Label>
                <select id="tutorRelationship" name="tutorRelationship" required className="flex h-10 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/30">
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

        {/* Emergency & Authorization card */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100/50">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <CardTitle className="text-base text-amber-900">4. Contactos y Autorizaciones</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName" className="text-sm font-medium">Contacto de Emergencia Alterno</Label>
                <Input id="emergencyContactName" name="emergencyContactName" placeholder="Ej. Juan Pérez (Abuelo)" className="rounded-xl border-slate-200 focus-visible:ring-amber-500/30"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone" className="text-sm font-medium">Teléfono de Emergencia</Label>
                <Input id="emergencyContactPhone" name="emergencyContactPhone" type="tel" placeholder="829-555-9876" className="rounded-xl border-slate-200 focus-visible:ring-amber-500/30"/>
              </div>
              <div className="col-span-full space-y-2">
                <Label htmlFor="authorizedPickup" className="text-sm font-medium">Personas Autorizadas para Recogida</Label>
                <Input id="authorizedPickup" name="authorizedPickup" placeholder="Ej. Carlos Almonte (Tío), Lucía Pérez (Nana)" className="rounded-xl border-slate-200 focus-visible:ring-amber-500/30"/>
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
              <CardTitle className="text-base text-rose-900">5. Expediente Médico Base</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="bloodType" className="text-sm font-medium">Tipo de Sangre</Label>
                <select id="bloodType" name="bloodType" className="flex h-9 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500/30">
                  <option value="">Desconocido</option>
                  <option value="O+">O+</option><option value="O-">O-</option>
                  <option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vaccines" className="text-sm font-medium">Estado de Vacunas</Label>
                <Input id="vaccines" name="vaccines" placeholder="Ej. Al día (Sarampeón, Rubeola, Polio)" className="rounded-xl border-slate-200 focus-visible:ring-rose-500/30"/>
              </div>
              <div className="col-span-full space-y-2">
                <Label className="text-sm font-medium">Alergias Conocidas</Label>
                <AllergySelector />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conditions" className="text-sm font-medium">Enfermedades Pre-existentes</Label>
                <Input id="conditions" name="conditions" placeholder="Ej. Asma leve, Ninguna" className="rounded-xl border-slate-200 focus-visible:ring-rose-500/30"/>
              </div>
              <div className="col-span-full space-y-2">
                <Label htmlFor="authorizedMeds" className="text-sm font-medium">Medicamentos Autorizados por Tutor (En caso de fiebre/dolor)</Label>
                <Input id="authorizedMeds" name="authorizedMeds" placeholder="Ej. Acetaminofén (si fiebre > 38.5°C), Salbutamol (en crisis)" className="rounded-xl border-slate-200 focus-visible:ring-rose-500/30"/>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice option */}
        <Card className="border border-indigo-100 bg-indigo-50/30 shadow-sm overflow-hidden">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="mt-1">
              <input type="checkbox" id="generateInvoice" name="generateInvoice" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
            </div>
            <div>
              <Label htmlFor="generateInvoice" className="font-semibold text-indigo-900 cursor-pointer">Generar Factura de Matrícula (RD$ {matriculaAmount.toLocaleString()})</Label>
              <p className="text-xs text-indigo-700/80 mt-1">Al marcar esta opción, se creará automáticamente un registro de ingreso en el módulo de finanzas por concepto de inscripción.</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 pb-10">
          <Link href="/children">
            <Button type="button" variant="outline" className="rounded-xl px-6 h-11">Descartar</Button>
          </Link>
          <Button 
            type="submit" 
            className="h-11 gap-2 rounded-xl px-8 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 hover:-translate-y-0.5 text-base font-semibold"
          >
            <CheckSquare className="h-5 w-5" />
            Completar Admisión y Crear Expediente
          </Button>
        </div>
      </form>
    </div>
  );
}
