'use client'

import { useState, useEffect, use } from 'react';
import { getTripById, addTripParticipant, addTripParticipants, addTripExpense, payTripFee } from '@/lib/actions/trips';
import { getChildren } from '@/lib/actions/children';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import PDFDownloadButton from '@/components/transport/TripAuthPDF';
import { AlertCircle, CheckCircle2, MapPin, Calendar, Clock, DollarSign, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TripDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [trip, setTrip] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChildren, setSelectedChildren] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);

  async function loadData() {
    setLoading(true);
    const t = await getTripById(parseInt(resolvedParams.id));
    setTrip(t);
    const c = await getChildren();
    setChildren(c);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [resolvedParams.id]);

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando detalles del viaje...</div>;
  if (!trip) return <div className="p-8 text-center text-red-500">Viaje no encontrado</div>;

  const totalIncome = trip.incomes?.reduce((sum: number, inc: any) => sum + Number(inc.amount), 0) || 0;
  const totalExpense = trip.expenses?.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0) || 0;
  const profit = totalIncome - totalExpense;

  const toggleChild = (id: number) => {
    setSelectedChildren(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleAddParticipants = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedChildren.length === 0) return alert('Seleccione al menos un alumno');
    const formData = new FormData(e.currentTarget);
    const accompanyingAdults = parseInt(formData.get('accompanyingAdults') as string) || 0;
    const authorized = formData.get('authorized') === 'on';

    const res = await addTripParticipants(trip.id, selectedChildren, accompanyingAdults, authorized);
    if (res.success) {
      setIsEnrollDialogOpen(false);
      setSelectedChildren([]);
      loadData();
    } else {
      alert(res.error);
    }
  };

  const filteredChildren = children.filter(c => 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !trip?.participants?.some((p: any) => p.childId === c.id)
  );

  const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get('amount') as string);
    const description = formData.get('description') as string;

    const res = await addTripExpense(trip.id, amount, description);
    if (res.success) {
      loadData();
    } else {
      alert(res.error);
    }
  };

  const handlePay = async (participant: any, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get('amount') as string);
    const description = `Pago excursión: ${participant.firstName}`;

    const res = await payTripFee(participant.id, trip.id, participant.childId, amount, description);
    if (res.success) {
      loadData();
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{trip.name}</h1>
            <Badge variant={trip.status === 'Completado' ? 'secondary' : 'default'} className={trip.status === 'Programado' ? 'bg-emerald-100 text-emerald-800' : ''}>
              {trip.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {trip.destination}</span>
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(trip.date).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {trip.departureTime} a {trip.returnTime}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* P&L Dashboard */}
        <Card className="col-span-1 md:col-span-3 border-0 shadow-sm bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2"><DollarSign className="h-5 w-5 text-emerald-600" /> Estado de Resultados (P&L)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase">Ingresos Recaudados</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">${totalIncome.toFixed(2)}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase">Gastos (Logística/Comida)</p>
              <p className="text-2xl font-black text-red-600 mt-1">${totalExpense.toFixed(2)}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase">Ganancia Neta</p>
              <p className={`text-2xl font-black mt-1 ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                ${profit.toFixed(2)}
              </p>
              {profit < 0 && trip.costPerStudent === 0 && <p className="text-xs text-muted-foreground mt-1">Refleja costo asumido por la empresa (viaje gratis)</p>}
            </div>
          </CardContent>
        </Card>

        {/* Participants */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pasajeros Registrados</CardTitle>
              <CardDescription>
                {trip.participants?.length || 0} inscripciones ({trip.participants?.reduce((s: number, p: any) => s + 1 + p.accompanyingAdults, 0)} asientos ocupados de {trip.totalCapacity})
              </CardDescription>
            </div>
            <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20"><PlusCircle className="h-4 w-4" /> Inscribir Alumnos</Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle className="text-xl">Inscribir Alumnos al Viaje</DialogTitle>
                  <DialogDescription>Selecciona uno o más alumnos para añadirlos a la lista de pasajeros.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddParticipants} className="space-y-4">
                  <div className="space-y-3">
                    <Label>Buscar y Seleccionar Alumnos</Label>
                    <Input 
                      placeholder="Buscar por nombre..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900"
                    />
                    <div className="h-48 overflow-y-auto border rounded-lg bg-white dark:bg-slate-950 p-2 space-y-1">
                      {filteredChildren.length === 0 ? (
                        <p className="text-sm text-center text-muted-foreground py-4">No hay alumnos disponibles o todos ya están inscritos.</p>
                      ) : (
                        filteredChildren.map(c => (
                          <div 
                            key={c.id} 
                            onClick={() => toggleChild(c.id)}
                            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${selectedChildren.includes(c.id) ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 border' : 'hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent'}`}
                          >
                            <input 
                              type="checkbox" 
                              checked={selectedChildren.includes(c.id)} 
                              onChange={() => {}} 
                              className="h-4 w-4 text-indigo-600 rounded border-slate-300" 
                            />
                            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                              {c.photoUrl && <img src={c.photoUrl} alt="Foto" className="w-full h-full object-cover" />}
                            </div>
                            <span className="text-sm font-medium">{c.firstName} {c.lastName}</span>
                          </div>
                        ))
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground text-right">{selectedChildren.length} alumnos seleccionados</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    <div className="space-y-2">
                      <Label>Acompañantes Extra p/ Alumno</Label>
                      <Input type="number" name="accompanyingAdults" defaultValue="0" min="0" required className="bg-slate-50 dark:bg-slate-900" />
                    </div>
                    <div className="flex items-center gap-2 p-3 border rounded-md bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50 mt-6 h-10">
                      <input type="checkbox" id="authorized" name="authorized" className="h-4 w-4 text-emerald-600" />
                      <Label htmlFor="authorized" className="cursor-pointer text-emerald-900 dark:text-emerald-50">¿Permiso firmado?</Label>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={selectedChildren.length === 0}>
                    Inscribir {selectedChildren.length > 0 ? selectedChildren.length : ''} Alumnos
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {trip.participants?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No hay pasajeros inscritos aún.</p>
            ) : (
              <div className="space-y-3">
                {trip.participants?.map((p: any) => {
                  const pending = p.totalFee - p.amountPaid;
                  return (
                    <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                          {p.photoUrl ? <img src={p.photoUrl} alt="Foto" className="w-full h-full object-cover" /> : null}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{p.firstName} {p.lastName}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.accompanyingAdults > 0 ? `+ ${p.accompanyingAdults} Acompañantes` : 'Solo alumno'}
                          </p>
                          {!p.authorized && <span className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" /> Sin autorización</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-500">Deuda</p>
                          <p className={`text-sm font-semibold ${pending > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                            ${pending > 0 ? pending.toFixed(2) : '0.00'}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <PDFDownloadButton trip={trip} participant={p} />
                          {pending > 0 && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50">Cobrar</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Registrar Pago</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={(e) => handlePay(p, e)} className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>Monto a pagar</Label>
                                    <Input type="number" step="0.01" name="amount" defaultValue={pending} max={pending} required />
                                  </div>
                                  <Button type="submit" className="w-full">Registrar Ingreso</Button>
                                </form>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expenses Tracker */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Gastos del Viaje</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-8">Añadir Gasto</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Gasto Operativo</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddExpense} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Input name="description" placeholder="Ej. Entradas al parque, Comida" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Monto ($)</Label>
                    <Input type="number" step="0.01" name="amount" required />
                  </div>
                  <Button type="submit" className="w-full">Guardar Gasto</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
             {trip.expenses?.length === 0 ? (
               <p className="text-sm text-muted-foreground">Sin gastos registrados.</p>
             ) : (
               <div className="space-y-2">
                 {trip.expenses?.map((e: any) => (
                   <div key={e.id} className="flex justify-between items-center text-sm p-2 border-b last:border-0">
                     <span className="text-slate-700">{e.description}</span>
                     <span className="font-semibold text-red-600">-\${Number(e.amount).toFixed(2)}</span>
                   </div>
                 ))}
               </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
