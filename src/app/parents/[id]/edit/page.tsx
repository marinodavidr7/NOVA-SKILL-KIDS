"use client";

import { updateParent, getParentById } from "@/lib/actions/parents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, Users, Save } from "lucide-react";
import { useState, useEffect, use, useRef } from "react";

export default function EditParentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const parentId = parseInt(id);
  const [parent, setParent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getParentById(parentId).then((data) => {
      setParent(data);
      setPreview(data.photoUrl || null);
      setLoading(false);
    });
  }, [parentId]);

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

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando información...</div>;
  }

  if (!parent) {
    return <div className="p-8 text-center text-muted-foreground">Tutor no encontrado</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Back button and title */}
      <div className="flex items-center gap-4">
        <Link href={`/parents/${parentId}`}>
          <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Editar Tutor: {parent.firstName}</h1>
            <p className="text-sm text-muted-foreground">Actualiza la información de contacto y datos personales.</p>
          </div>
        </div>
      </div>

      <form action={updateParent.bind(null, parentId)} className="space-y-6">
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-base">Datos de Contacto</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="col-span-full flex items-center gap-6 pb-6 border-b border-slate-100 mb-2">
                <div 
                  onClick={() => fileRef.current?.click()}
                  className="relative group cursor-pointer"
                >
                  <div className={`h-24 w-24 rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 ring-2 ring-offset-2 ${
                    preview 
                      ? 'ring-blue-300 shadow-lg shadow-blue-500/10' 
                      : 'ring-dashed ring-slate-300 bg-muted/50 hover:ring-blue-400 hover:bg-blue-50'
                  }`}>
                    {preview ? (
                      <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-muted-foreground group-hover:text-blue-500 transition-colors">
                        <Users className="h-8 w-8" />
                        <span className="text-[10px] font-medium">Subir Foto</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-bold">Cambiar</span>
                  </div>
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
                    className="cursor-pointer file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-lg file:px-3 file:py-1 file:text-xs file:font-semibold hover:file:bg-blue-100 file:mr-3 file:transition-colors border-dashed" 
                  />
                  <p className="text-xs text-muted-foreground mt-2">La foto será visible en el perfil del tutor y en los recibos.</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">Nombres <span className="text-red-400">*</span></Label>
                <Input id="firstName" name="firstName" defaultValue={parent.firstName} required className="rounded-xl border-slate-200 focus-visible:ring-blue-500/30"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">Apellidos <span className="text-red-400">*</span></Label>
                <Input id="lastName" name="lastName" defaultValue={parent.lastName} required className="rounded-xl border-slate-200 focus-visible:ring-blue-500/30"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">Teléfono Móvil <span className="text-red-400">*</span></Label>
                <Input id="phone" name="phone" type="tel" defaultValue={parent.phone} required className="rounded-xl border-slate-200 focus-visible:ring-blue-500/30"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Correo Electrónico</Label>
                <Input id="email" name="email" type="email" defaultValue={parent.email} className="rounded-xl border-slate-200 focus-visible:ring-blue-500/30"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cedula" className="text-sm font-medium">Cédula / Identificación</Label>
                <Input id="cedula" name="cedula" defaultValue={parent.cedula} onChange={handleCedulaChange} maxLength={13} placeholder="Ej: 001-0000000-1" className="rounded-xl border-slate-200 focus-visible:ring-blue-500/30"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">Dirección Residencial</Label>
                <Input id="address" name="address" defaultValue={parent.address} className="rounded-xl border-slate-200 focus-visible:ring-blue-500/30"/>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Link href={`/parents/${parentId}`}>
            <Button type="button" variant="outline" className="rounded-xl px-6 h-11">Cancelar</Button>
          </Link>
          <Button 
            type="submit" 
            className="h-11 gap-2 rounded-xl px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 hover:-translate-y-0.5 font-semibold"
          >
            <Save className="h-5 w-5" />
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  );
}
