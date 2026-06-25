import { getTrips } from '@/lib/actions/trips';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { MapPin, Calendar, Users, PlusCircle } from 'lucide-react';

export default async function TripsPage() {
  const trips = await getTrips();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Viajes y Excursiones</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestión de eventos especiales, asignación de vehículos y control de cobros.
          </p>
        </div>
        <Link href="/transport/trips/new">
          <Button className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700">
            <PlusCircle className="h-4 w-4" /> Registrar Viaje
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {trips.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay viajes registrados.</p>
        ) : (
          trips.map((trip) => (
            <Link key={trip.id} href={`/transport/trips/${trip.id}`}>
              <Card className="hover:border-emerald-500 transition-colors cursor-pointer">
                <CardHeader className="pb-3 border-b bg-emerald-50/50 dark:bg-emerald-950/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-emerald-900 dark:text-emerald-50">{trip.name}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" /> {trip.destination}
                      </div>
                    </div>
                    <Badge variant={trip.status === 'Completado' ? 'secondary' : 'default'} className={trip.status === 'Programado' ? 'bg-emerald-100 text-emerald-800' : ''}>
                      {trip.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1 text-slate-600"><Calendar className="h-4 w-4" /> Fecha:</span>
                    <span className="font-medium">{new Date(trip.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1 text-slate-600"><Users className="h-4 w-4" /> Inscritos:</span>
                    <span className="font-medium">{trip.registeredCount} / {trip.totalCapacity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1 text-slate-600">Costo Niños:</span>
                    <span className="font-medium">{trip.costPerStudent === 0 ? 'Gratis' : `$${trip.costPerStudent}`}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
