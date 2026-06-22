'use client';

import { useEffect, useState } from 'react';
import { getAttendanceByDate, getActiveChildren, markAttendance, getAttendanceSummary } from '@/lib/actions/attendance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarCheck } from 'lucide-react';

export default function AttendancePage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [children, setChildren] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [summary, setSummary] = useState({ present: 0, absent: 0, late: 0, total: 0 });

  useEffect(() => {
    loadData();
  }, [date]);

  async function loadData() {
    const sum = await getAttendanceSummary();
    setSummary(sum);
    const att = await getAttendanceByDate(date);
    setAttendance(att);
    if (date === new Date().toISOString().split('T')[0]) {
       const kids = await getActiveChildren();
       setChildren(kids);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-1">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
          <CalendarCheck className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Control de Asistencia</h1>
          <p className="text-sm text-muted-foreground">Registro de entradas y salidas de los niños.</p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-auto rounded-xl" />
        <Button onClick={loadData} variant="outline" className="rounded-xl">Actualizar</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-blue-50">
          <CardContent className="py-4"><p className="text-sm text-blue-600">Total Registrados</p><p className="text-2xl font-bold text-blue-700">{summary.total}</p></CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-emerald-50">
          <CardContent className="py-4"><p className="text-sm text-emerald-600">Presentes</p><p className="text-2xl font-bold text-emerald-700">{summary.present}</p></CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-red-50">
          <CardContent className="py-4"><p className="text-sm text-red-600">Ausentes</p><p className="text-2xl font-bold text-red-700">{summary.absent}</p></CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-amber-50">
          <CardContent className="py-4"><p className="text-sm text-amber-600">Tardanzas</p><p className="text-2xl font-bold text-amber-700">{summary.late}</p></CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="pl-6">Niño</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Hora Entrada</TableHead>
                <TableHead>Acción Rápida</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {children.map(child => {
                const record = attendance.find(a => a.childId === child.id);
                return (
                  <TableRow key={child.id}>
                    <TableCell className="pl-6 flex items-center gap-3">
                      <Avatar><AvatarImage src={child.photoUrl}/><AvatarFallback>{child.firstName[0]}</AvatarFallback></Avatar>
                      <span className="font-medium">{child.firstName} {child.lastName}</span>
                    </TableCell>
                    <TableCell>
                      {record ? (
                         <span className={`px-2 py-1 rounded-full text-xs ${record.status === 'present' ? 'bg-emerald-100 text-emerald-700' : record.status === 'absent' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                           {record.status === 'present' ? 'Presente' : record.status === 'absent' ? 'Ausente' : 'Tarde'}
                         </span>
                      ) : <span className="text-muted-foreground text-sm">Sin marcar</span>}
                    </TableCell>
                    <TableCell>{record?.checkIn || '-'}</TableCell>
                    <TableCell>
                      <form action={async (formData) => {
                        await markAttendance(formData);
                        await loadData();
                      }} className="flex gap-2">
                        <input type="hidden" name="childId" value={child.id} />
                        <input type="hidden" name="date" value={date} />
                        <input type="time" name="checkIn" defaultValue={new Date().toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit', hour12: false})} className="border rounded px-2 py-1 text-sm" />
                        <select name="status" className="border rounded px-2 py-1 text-sm">
                          <option value="present">Presente</option>
                          <option value="absent">Ausente</option>
                          <option value="late">Tarde</option>
                        </select>
                        <Button type="submit" size="sm" className="rounded-xl">Guardar</Button>
                      </form>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
