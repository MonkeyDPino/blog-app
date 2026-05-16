import { CategoryForm } from '@/components/admin/CategoryForm';

export default function NewCategoryPage() {
  return (
    <div>
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="font-serif text-4xl font-bold text-ink">New category</h1>
      </div>
      <CategoryForm />
    </div>
  );
}
