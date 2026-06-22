import { getStaffById, updateStaff } from '@/lib/actions/staff';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, HeartPulse, Briefcase, Building, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function EditStaff({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staffId = parseInt(id);
  const data = await getStaffById(staffId);

  if (!data) {
    return <div className="p-8 text-center text-muted-foreground">Empleado no encontrado</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
      <div className="flex items-center gap-4">
        <Link href={`/staff/${id}`}>
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Editar Perfil de Empleado</h2>
          <p className="text-slate-500 mt-1">Modifica la información del expediente laboral de {data.firstName}.</p>
        </div>
      </div>

      <form action={updateStaff} className="space-y-8">
        <input type="hidden" name="id" value={data.id} />
        
        {/* Section 1: Datos Personales */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
              <User className="h-5 w-5 text-violet-500" /> Datos Personales y de Contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label>Foto de Perfil</Label>
                <div className="flex items-center gap-4">
                  {data.photoUrl && (
                    <img src={data.photoUrl} alt="Foto actual" className="w-16 h-16 rounded-full object-cover border border-slate-200" />
                  )}
                  <div className="flex-1">
                    <Input type="file" name="photo" accept="image/*" className="w-full cursor-pointer" />
                    <p className="text-xs text-slate-500 mt-1">Sube una nueva imagen si deseas actualizar la foto actual. Formatos: JPG, PNG.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2"><Label>Nombres</Label><Input name="firstName" defaultValue={data.firstName} required /></div>
              <div className="space-y-2"><Label>Apellidos</Label><Input name="lastName" defaultValue={data.lastName} required /></div>
              <div className="space-y-2"><Label>DNI / Cédula / CURP</Label><Input name="dni" defaultValue={data.dni || ''} /></div>
              <div className="space-y-2"><Label>Fecha de Nacimiento</Label><Input type="date" name="birthDate" defaultValue={data.birthDate || ''} /></div>
              <div className="space-y-2 md:col-span-2"><Label>Dirección Completa</Label><Input name="address" defaultValue={data.address || ''} /></div>
              <div className="space-y-2"><Label>Teléfono Celular</Label><Input name="phone" defaultValue={data.phone || ''} required /></div>
              <div className="space-y-2"><Label>Correo Electrónico</Label><Input type="email" name="email" defaultValue={data.email || ''} /></div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Contacto de Emergencia */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-rose-400 to-orange-400" />
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
              <HeartPulse className="h-5 w-5 text-rose-500" /> En Caso de Emergencia
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2"><Label>Nombre del Contacto</Label><Input name="emergencyName" defaultValue={data.emergencyName || ''} /></div>
              <div className="space-y-2"><Label>Teléfono</Label><Input name="emergencyPhone" defaultValue={data.emergencyPhone || ''} /></div>
              <div className="space-y-2"><Label>Parentesco</Label><Input name="emergencyRelation" defaultValue={data.emergencyRelation || ''} placeholder="Ej. Esposo, Madre" /></div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Formación y Datos Académicos */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-400 to-indigo-500" />
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
              Formación y Datos Académicos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><Label>Título / Grado Académico</Label><Input name="degree" defaultValue={data.degree || ''} placeholder="Ej. Licenciatura en Pedagogía" /></div>
              <div className="space-y-2"><Label>Institución Educativa</Label><Input name="institution" defaultValue={data.institution || ''} placeholder="Ej. Universidad Nacional" /></div>
              <div className="space-y-2"><Label>Año de Graduación</Label><Input type="number" name="graduationYear" defaultValue={data.graduationYear || ''} placeholder="Ej. 2018" /></div>
              <div className="space-y-2"><Label>Especialidades / Cursos Relevantes</Label><Input name="specialties" defaultValue={data.specialties || ''} placeholder="Ej. Primeros Auxilios, Montessori" /></div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Información Laboral y Nómina */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
              <Briefcase className="h-5 w-5 text-emerald-500" /> Empleo y Nómina
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="space-y-2">
                <Label>Cargo / Puesto</Label>
                <select name="role" defaultValue={data.role} className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" required>
                  <option value="Directora">Directora</option>
                  <option value="Educadora">Educadora</option>
                  <option value="Auxiliar">Auxiliar</option>
                  <option value="Chofer">Chofer</option>
                  <option value="Cocinera">Cocinera</option>
                  <option value="Limpieza">Limpieza</option>
                  <option value="Administración">Administración</option>
                  <option value="Seguridad">Seguridad</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <select name="status" defaultValue={data.status || 'active'} className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" required>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo / Baja</option>
                </select>
              </div>
              <div className="space-y-2"><Label>Fecha de Contratación</Label><Input type="date" name="hireDate" defaultValue={data.hireDate || ''} required /></div>
              <div className="space-y-2"><Label>Salario Base (Mensual)</Label><Input type="number" step="0.01" name="salary" defaultValue={data.salary || 0} /></div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-4">
                <Building className="h-4 w-4 text-slate-400" /> Información Bancaria (Depósitos)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><Label>Nombre del Banco</Label><Input name="bankName" defaultValue={data.bankName || ''} placeholder="Ej. BBVA, Banamex" /></div>
                <div className="space-y-2"><Label>Número de Cuenta / CLABE</Label><Input name="bankAccount" defaultValue={data.bankAccount || ''} /></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Link href={`/staff/${data.id}`}>
            <Button variant="outline" type="button" className="rounded-xl">Cancelar</Button>
          </Link>
          <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8 shadow-sm">
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  );
}
