import { getDocuments, getCategories } from '@/lib/actions/documents';
import { getStaff } from '@/lib/actions/staff';
import DocumentListClient from '@/components/documents/DocumentListClient';

export default async function StaffDocumentsPage({ searchParams }: { searchParams: Promise<{ autoSelectId?: string, autoSelectDocType?: string, returnUrl?: string }> }) {
  const { autoSelectId, autoSelectDocType, returnUrl } = await searchParams;
  const categories = await getCategories();
  const category = categories.find(c => c.name === 'Personal');
  
  if (!category) {
    return <div className="p-8 text-center text-red-500">Error: Categoría 'Personal' no encontrada.</div>;
  }

  const documents = await getDocuments(category.id);
  const staff = await getStaff();
  
  const entities = staff.map(s => ({
    id: s.id,
    name: `${s.firstName} ${s.lastName}`
  }));

  const staffDocumentTypes = [
    'Copia de cédula de identidad',
    'Certificado de buena conducta',
    'Currículum vitae (CV)',
    'Certificado médico reciente',
    'Título universitario o técnico',
    'Certificados de estudios',
    'Diplomas de cursos y capacitaciones',
    'Contrato de trabajo',
    'Carta de nombramiento',
    'Descripción del puesto',
    'Historial de sanciones o reconocimientos',
    'Carta de renuncia o desvinculación',
    'Licencia de conducir vigente',
    'Certificado médico para conducir',
    'Certificado de no antecedentes penales',
    'Historial de infracciones',
    'Certificaciones de manejo defensivo',
    'Otro'
  ];

  return (
    <DocumentListClient 
      documents={documents} 
      categoryId={category.id} 
      categoryName={category.name}
      themeColor="emerald"
      entities={entities}
      documentTypes={staffDocumentTypes}
      autoSelectId={autoSelectId}
      autoSelectDocType={autoSelectDocType}
      returnUrl={returnUrl}
    />
  );
}
