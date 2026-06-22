import { getParents } from "@/lib/actions/parents";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Users, Mail, MailX, UserCheck } from "lucide-react";
import Link from "next/link";
import ParentsClient from "@/components/parents/ParentsClient";

export default async function ParentsPage() {
  const parents = await getParents();

  const totalParents = parents.length;
  const withEmail = parents.filter((p: any) => p.email && p.email.trim() !== "").length;
  const withoutEmail = totalParents - withEmail;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Padres y Tutores</h1>
              <p className="text-sm text-muted-foreground">
                Gestiona la información de contacto de los padres y tutores registrados.
              </p>
            </div>
          </div>
        </div>
        <Link href="/parents/new">
          <Button className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 hover:-translate-y-0.5">
            <PlusCircle className="h-4 w-4" />
            Nuevo Registro
          </Button>
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600">Total Registrados</p>
                <p className="text-2xl font-bold text-indigo-700">{totalParents}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-indigo-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Con Email</p>
                <p className="text-2xl font-bold text-emerald-700">{withEmail}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Mail className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Sin Email</p>
                <p className="text-2xl font-bold text-amber-700">{withoutEmail}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <MailX className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive search + table (Client Component) */}
      <ParentsClient parents={parents} />
    </div>
  );
}
