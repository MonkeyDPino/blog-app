import type { ICategory } from '@blog/types';
import { PostForm } from '@/components/posts/PostForm';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://blog-api.pinodev.app';

export default async function NewPostPage() {
  let categories: ICategory[] = [];
  try {
    const res = await fetch(`${API_BASE}/categories`, { cache: 'no-store' });
    if (res.ok) categories = await res.json();
  } catch {
    // proceed with empty categories
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">New post</h1>
      <PostForm categories={categories} />
    </div>
  );
}
