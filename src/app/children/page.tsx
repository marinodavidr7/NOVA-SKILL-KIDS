import { getChildren, deleteChild } from "@/lib/actions/children";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Search, Filter, Download, MoreHorizontal, Eye, Edit, Trash2, Baby } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import ChildrenListClient from "@/components/children/ChildrenListClient";
import { getCurrentUser } from "@/lib/actions/auth";

export default async function ChildrenPage() {
  const children = await getChildren();
  const user = await getCurrentUser();
  const canRegisterChild = user?.role === 'admin' || user?.permissions?.registerChild;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
              <Baby className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Niños Registrados</h1>
              <p className="text-sm text-muted-foreground">
                Gestiona los expedientes y registros de los niños en Nova Skill Kids.
              </p>
            </div>
          </div>
        </div>
        {canRegisterChild && (
          <Link href="/children/new">
            <Button className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 hover:-translate-y-0.5">
              <PlusCircle className="h-4 w-4" />
              Nuevo Registro
            </Button>
          </Link>
        )}
      </div>

      <ChildrenListClient childrenData={children} canRegisterChild={!!canRegisterChild} />
    </div>
  );
}
