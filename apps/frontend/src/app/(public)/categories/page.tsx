import Link from 'next/link';
import type { ICategory } from '@blog/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://blog-api.pinodev.app';

export default async function CategoriesPage() {
  let categories: ICategory[] = [];
  try {
    const res = await fetch(`${API_BASE}/categories`, { cache: 'no-store' });
    if (res.ok) {
      categories = await res.json();
    }
  } catch {
    // Network error
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Categories</h1>
      {categories.length === 0 ? (
        <p className="text-neutral-500">No categories found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/categories/${cat.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                {cat.coverImage && (
                  <div className="aspect-video overflow-hidden rounded-t-xl">
                    <img
                      src={cat.coverImage}
                      alt={cat.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{cat.name}</CardTitle>
                </CardHeader>
                {cat.description && (
                  <CardContent className="text-sm text-neutral-600">
                    {cat.description}
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
