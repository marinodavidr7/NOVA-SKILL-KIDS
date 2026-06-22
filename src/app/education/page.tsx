'use client';

import { useEffect, useState } from 'react';
import { getLessonPlans, getEvaluations } from '@/lib/actions/education';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function EducationPage() {
  const [tab, setTab] = useState('plans');
  const [plans, setPlans] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);

  useEffect(() => {
    getLessonPlans().then(setPlans);
    getEvaluations().then(setEvaluations);
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-500/20">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestión Educativa</h1>
          </div>
        </div>
        <div className="flex bg-muted/50 p-1 rounded-xl">
          <button onClick={() => setTab('plans')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'plans' ? 'bg-white shadow-sm text-pink-600' : 'text-muted-foreground hover:text-foreground'}`}>Planificaciones</button>
          <button onClick={() => setTab('evaluations')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'evaluations' ? 'bg-white shadow-sm text-pink-600' : 'text-muted-foreground hover:text-foreground'}`}>Evaluaciones</button>
        </div>
      </div>

      {tab === 'plans' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link href="/education/plans/new"><Button className="rounded-xl"><PlusCircle className="w-4 h-4 mr-2"/> Nueva Planificación</Button></Link>
          </div>
          <Card className="border-0 shadow-sm">
            <Table>
              <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Título</TableHead><TableHead>Aula</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
              <TableBody>
                {plans.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-8">No hay planificaciones.</TableCell></TableRow> : 
                  plans.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{p.title}</TableCell>
                      <TableCell>{p.classroomName || 'General'}</TableCell>
                      <TableCell><span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">{p.status}</span></TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {tab === 'evaluations' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link href="/education/evaluations/new"><Button className="rounded-xl"><PlusCircle className="w-4 h-4 mr-2"/> Nueva Evaluación</Button></Link>
          </div>
          <Card className="border-0 shadow-sm">
            <Table>
              <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Niño</TableHead><TableHead>Área</TableHead><TableHead>Calificación</TableHead><TableHead>Evaluador</TableHead></TableRow></TableHeader>
              <TableBody>
                {evaluations.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8">No hay evaluaciones.</TableCell></TableRow> : 
                  evaluations.map(e => (
                    <TableRow key={e.id}>
                      <TableCell>{new Date(e.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{e.firstName} {e.lastName}</TableCell>
                      <TableCell>{e.area}</TableCell>
                      <TableCell>{e.score}</TableCell>
                      <TableCell>{e.evaluator}</TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}
