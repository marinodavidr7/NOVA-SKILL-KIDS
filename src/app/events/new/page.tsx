import { createEvent } from '@/lib/actions/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Save, PartyPopper } from 'lucide-react';

export default function NewEventPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600 transition-all">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/20">
            <CalendarDays className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Agregar Evento</h1>
            <p className="text-sm text-muted-foreground">Programa una nueva actividad o reunión en Nova Skill Kids.</p>
          </div>
        </div>
      </div>

      <form action={createEvent} className="space-y-6">
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-violet-50 to-fuchsia-50 border-b border-violet-100/50 pb-4">
            <div className="flex items-center gap-2 text-violet-800">
              <PartyPopper className="h-5 w-5" />
              <CardTitle className="text-lg">Detalles del Evento</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold">Título del Evento <span className="text-red-500">*</span></Label>
                <Input name="title" required className="h-11 rounded-xl shadow-sm" placeholder="Ej. Reunión de Padres, Festival de Primavera..." />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Fecha <span className="text-red-500">*</span></Label>
                <Input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="h-11 rounded-xl shadow-sm" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Hora</Label>
                <Input type="time" name="time" className="h-11 rounded-xl shadow-sm" defaultValue="09:00" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold">Ubicación / Descripción breve</Label>
                <Input name="description" className="h-11 rounded-xl shadow-sm" placeholder="Ej. Patio principal - Todo el día" />
              </div>

            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Link href="/">
            <Button type="button" variant="outline" className="rounded-xl px-6 h-11 border-slate-200 text-slate-600 hover:bg-slate-50">Cancelar</Button>
          </Link>
          <Button 
            type="submit" 
            className="h-11 gap-2 rounded-xl px-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 shadow-lg shadow-violet-500/25 transition-all duration-300 font-semibold text-white"
          >
            <Save className="h-5 w-5" />
            Programar Evento
          </Button>
        </div>
      </form>
    </div>
  );
}
