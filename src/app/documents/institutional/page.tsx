import { getDocuments, getCategories } from '@/lib/actions/documents';
import DocumentListClient from '@/components/documents/DocumentListClient';

export default async function InstitutionalDocumentsPage() {
  const categories = await getCategories();
  const category = categories.find(c => c.name === 'Institucional');
  
  if (!category) {
    return <div className="p-8 text-center text-red-500">Error: Categoría 'Institucional' no encontrada.</div>;
  }

  const documents = await getDocuments(category.id);

  return (
    <DocumentListClient 
      documents={documents} 
      categoryId={category.id} 
      categoryName={category.name}
      themeColor="violet"
    />
  );
}
