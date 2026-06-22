import { getDocuments, getCategories } from '@/lib/actions/documents';
import { getChildren } from '@/lib/actions/children';
import DocumentListClient from '@/components/documents/DocumentListClient';

export default async function StudentsDocumentsPage({ searchParams }: { searchParams: Promise<{ autoSelectId?: string, autoSelectDocType?: string, returnUrl?: string }> }) {
  const { autoSelectId, autoSelectDocType, returnUrl } = await searchParams;
  const categories = await getCategories();
  const category = categories.find(c => c.name === 'Estudiantes');
  
  if (!category) {
    return <div className="p-8 text-center text-red-500">Error: Categoría 'Estudiantes' no encontrada.</div>;
  }

  const documents = await getDocuments(category.id);
  const children = await getChildren();
  
  const entities = children.map(child => ({
    id: child.id,
    name: `${child.firstName} ${child.lastName}`
  }));

  return (
    <DocumentListClient 
      documents={documents} 
      categoryId={category.id} 
      categoryName={category.name}
      themeColor="blue"
      entities={entities}
      autoSelectId={autoSelectId}
      autoSelectDocType={autoSelectDocType}
      returnUrl={returnUrl}
    />
  );
}
