"use client";

import Link from "next/link";
import { ArrowLeft, Users, Save, Phone, Mail, MapPin, Camera, User } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createParent } from "@/lib/actions/parents";
import { useState, useRef } from "react";

export default function NewParentPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.slice(0, 3) + '-' + value.slice(3);
    if (value.length > 11) value = value.slice(0, 11) + '-' + value.slice(11, 12);
    e.target.value = value;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 md:p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Back Button */}
        <Link
          href="/parents"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-violet-700 transition-all duration-200 hover:bg-violet-50 hover:shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Padres/Tutores
        </Link>

        {/* Page Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-indigo-500/25">
            <Users className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Registro de Padre/Tutor
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Complete la información del padre o tutor
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="overflow-hidden rounded-2xl border-slate-200/80 shadow-xl shadow-slate-200/50">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100">
            <CardTitle className="text-lg text-slate-800">
              Información Personal
            </CardTitle>
            <CardDescription className="text-slate-500">
              Los campos marcados con{" "}
              <span className="text-red-500 font-semibold">*</span> son
              obligatorios
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 md:p-8">
            <form action={createParent} className="space-y-8">
              
              {/* Photo upload section */}
              <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                <div 
                  onClick={() => fileRef.current?.click()}
                  className="relative group cursor-pointer"
                >
                  <div className={`h-24 w-24 rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 ring-2 ring-offset-2 ${
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
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Label htmlFor="photo" className="text-sm font-semibold text-slate-700 block mb-2">Fotografía (Opcional)</Label>
                  <Input 
                    ref={fileRef}
                    id="photo" 
                    name="photo" 
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg" 
                    onChange={handlePhotoChange}
                    className="cursor-pointer file:bg-violet-50 file:text-violet-700 file:border-0 file:rounded-lg file:px-3 file:py-1 file:text-xs file:font-semibold hover:file:bg-violet-100 file:mr-3 file:transition-colors border-dashed" 
                  />
                  <p className="text-xs text-muted-foreground mt-2">La foto será visible en el perfil del tutor y en los recibos.</p>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* First Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Nombres{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    placeholder="Ej: María Elena"
                    className="rounded-xl border-slate-200 bg-white/80 transition-all duration-200 placeholder:text-slate-400 focus-visible:ring-violet-500/30 focus-visible:border-violet-400 hover:border-slate-300"
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Apellidos{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    placeholder="Ej: García López"
                    className="rounded-xl border-slate-200 bg-white/80 transition-all duration-200 placeholder:text-slate-400 focus-visible:ring-violet-500/30 focus-visible:border-violet-400 hover:border-slate-300"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    Teléfono <span className="text-red-500">*</span>
                  </Label>
                  <Input id="phone" name="phone" type="tel" required placeholder="Ej: (809) 555-1234" className="rounded-xl border-slate-200 bg-white/80 transition-all duration-200 placeholder:text-slate-400 focus-visible:ring-violet-500/30 focus-visible:border-violet-400 hover:border-slate-300" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    Correo Electrónico
                  </Label>
                  <Input id="email" name="email" type="email" placeholder="Ej: maria.garcia@correo.com" className="rounded-xl border-slate-200 bg-white/80 transition-all duration-200 placeholder:text-slate-400 focus-visible:ring-violet-500/30 focus-visible:border-violet-400 hover:border-slate-300" />
                </div>
              </div>

              {/* ID and Address */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cedula" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    Cédula / Identificación
                  </Label>
                  <Input id="cedula" name="cedula" type="text" onChange={handleCedulaChange} maxLength={13} placeholder="Ej: 001-0000000-1" className="rounded-xl border-slate-200 bg-white/80 transition-all duration-200 placeholder:text-slate-400 focus-visible:ring-violet-500/30 focus-visible:border-violet-400 hover:border-slate-300" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    Dirección Residencial
                  </Label>
                  <Input id="address" name="address" type="text" placeholder="Ej: Calle Principal #123" className="rounded-xl border-slate-200 bg-white/80 transition-all duration-200 placeholder:text-slate-400 focus-visible:ring-violet-500/30 focus-visible:border-violet-400 hover:border-slate-300" />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100 pt-6">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Link
                    href="/parents"
                    className={buttonVariants({ variant: "outline" }) + " rounded-xl border-slate-200 text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:border-slate-300"}
                  >
                    Cancelar
                  </Link>
                  <Button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:from-violet-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-violet-500/30"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Padre/Tutor
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
