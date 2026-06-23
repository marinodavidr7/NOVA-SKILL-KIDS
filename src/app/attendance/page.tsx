'use client';

import { useEffect, useState } from 'react';
import { getAttendanceByDate, getActiveChildren, markAttendance, getAttendanceSummary } from '@/lib/actions/attendance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarCheck, Clock, AlertTriangle } from 'lucide-react';

const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const normalizeDay = (d: string) => d.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

function AttendanceRow({ child, record, date, onSaved, currentDayName }: any) {
  const defaultCheckIn = record?.checkIn || new Date().toLocaleTimeString('es-DO', {hour: '2-digit', minute:'2-digit', hour12: false});
  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  
  const isDayIncluded = child.schedule_days 
    ? child.schedule_days.split(',').map((s: string)=>normalizeDay(s)).includes(normalizeDay(currentDayName))
    : false;

  const initialStatus = record?.status || (child.start_time && defaultCheckIn > child.start_time ? 'late' : 'present');
  const [status, setStatus] = useState(initialStatus);

  const handleCheckInChange = (val: string) => {
    setCheckIn(val);
    if (!record?.status) {
      if (child.start_time && val > child.start_time) {
        setStatus('late');
      } else if (status === 'late' && val <= child.start_time) {
        setStatus('present');
      }
    }
  };

  return (
    <TableRow className={!isDayIncluded ? "bg-red-50/30" : ""}>
      <TableCell className="pl-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
            <AvatarImage src={child.photoUrl}/>
            <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">{child.firstName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800">{child.firstName} {child.lastName}</span>
            <div className="flex items-center gap-2 mt-0.5">
              {child.start_time && child.end_time ? (
                <span className="flex items-center text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  <Clock className="w-3 h-3 mr-1" />
                  {child.start_time.slice(0,5)} - {child.end_time.slice(0,5)}
                </span>
              ) : null}
              {!isDayIncluded && (
                <span className="flex items-center text-[11px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Día no contratado
                </span>
              )}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {record ? (
           <span className={`px-3 py-1 rounded-full text-[11px] font-semibold shadow-sm ${record.status === 'present' ? 'bg-emerald-100 text-emerald-700' : record.status === 'absent' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
             {record.status === 'present' ? 'Presente' : record.status === 'absent' ? 'Ausente' : 'Tarde'}
           </span>
        ) : <span className="text-muted-foreground text-xs italic">Sin marcar</span>}
      </TableCell>
      <TableCell className="font-medium text-gray-700 text-sm">{record?.checkIn || '-'}</TableCell>
      <TableCell>
        <form action={async (formData) => {
          await markAttendance(formData);
          onSaved();
        }} className="flex items-center gap-2">
          <input type="hidden" name="childId" value={child.id} />
          <input type="hidden" name="date" value={date} />
          <input type="time" name="checkIn" value={checkIn} onChange={e => handleCheckInChange(e.target.value)} className="border-0 bg-white/60 focus:bg-white transition-colors rounded-xl px-3 py-1.5 text-xs shadow-sm font-medium w-28" />
          <select name="status" value={status} onChange={e => setStatus(e.target.value)} className="border-0 bg-white/60 focus:bg-white transition-colors rounded-xl px-3 py-1.5 text-xs shadow-sm font-medium outline-none">
            <option value="present">Presente</option>
            <option value="absent">Ausente</option>
            <option value="late">Tarde</option>
          </select>
          <Button type="submit" size="sm" className="rounded-xl shadow-md bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white border-0 h-8 text-xs px-4">Guardar</Button>
        </form>
      </TableCell>
    </TableRow>
  );
}

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
    // always load children to ensure schedule reflects properly 
    const kids = await getActiveChildren();
    setChildren(kids);
  }

  const d = new Date(date + "T12:00:00");
  const currentDayName = daysOfWeek[d.getDay()];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex items-center justify-between bg-white/30 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/30">
            <CalendarCheck className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-800">Asistencia</h1>
            <p className="text-sm text-gray-600 font-medium mt-1">Registro de entradas y salidas de los niños.</p>
          </div>
        </div>
        <div className="flex gap-3 items-center bg-white/40 p-2 rounded-2xl shadow-sm border border-white/50">
          <div className="px-3 text-sm font-bold text-teal-800 capitalize">{currentDayName}</div>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-auto rounded-xl border-0 bg-white/60 shadow-sm font-medium" />
          <Button onClick={loadData} variant="outline" className="rounded-xl border-white bg-white/50 hover:bg-white shadow-sm text-teal-700 font-semibold">Actualizar</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Total', value: summary.total, bg: 'bg-blue-50/60', labelColor: 'text-blue-600/80', valueColor: 'text-blue-700' },
          { label: 'Presentes', value: summary.present, bg: 'bg-emerald-50/60', labelColor: 'text-emerald-600/80', valueColor: 'text-emerald-700' },
          { label: 'Ausentes', value: summary.absent, bg: 'bg-red-50/60', labelColor: 'text-red-600/80', valueColor: 'text-red-700' },
          { label: 'Tardanzas', value: summary.late, bg: 'bg-amber-50/60', labelColor: 'text-amber-600/80', valueColor: 'text-amber-700' },
        ].map((stat, i) => (
          <Card key={i} className={`border border-white/60 shadow-xl rounded-3xl ${stat.bg} backdrop-blur-md overflow-hidden relative group`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-50"></div>
            <CardContent className="p-6 relative z-10 flex flex-col items-center justify-center">
              <p className={`text-xs font-bold ${stat.labelColor} uppercase tracking-wider mb-1`}>{stat.label}</p>
              <p className={`text-4xl font-extrabold ${stat.valueColor} drop-shadow-sm`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl overflow-hidden">
        <Table>
          <TableHeader className="bg-white/40 border-b border-white/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6 font-bold text-gray-700 py-4">Niño / Horario</TableHead>
              <TableHead className="font-bold text-gray-700 py-4">Estado</TableHead>
              <TableHead className="font-bold text-gray-700 py-4">Hora Entrada</TableHead>
              <TableHead className="font-bold text-gray-700 py-4 w-[350px]">Acción Rápida</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {children.map(child => (
              <AttendanceRow 
                key={child.id} 
                child={child} 
                record={attendance.find(a => a.childId === child.id)} 
                date={date} 
                onSaved={loadData}
                currentDayName={currentDayName}
              />
            ))}
            {children.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground font-medium">
                  No hay niños activos registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
