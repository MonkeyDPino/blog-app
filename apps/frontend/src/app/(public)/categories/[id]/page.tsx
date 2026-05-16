import { notFound } from 'next/navigation';
import type { ICategory, IPost } from '@blog/types';
import { PostList } from '@/components/posts/PostList';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://blog-api.pinodev.app';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { id } = await params;

  let category: ICategory | null = null;
  let posts: IPost[] = [];

  try {
    const [catRes, postsRes] = await Promise.all([
      fetch(`${API_BASE}/categories/${id}`, { cache: 'no-store' }),
      fetch(`${API_BASE}/categories/${id}/posts`, { cache: 'no-store' }),
    ]);

    if (catRes.status === 404) return notFound();
    if (catRes.ok) category = await catRes.json();
    if (postsRes.ok) posts = await postsRes.json();
  } catch {
    return notFound();
  }

  if (!category) return notFound();

  const publicPosts = posts.filter((p) => !p.isDraft);

  return (
    <div>
      <div className="mb-8">
        {category.coverImage && (
          <div className="mb-6 aspect-[3/1] overflow-hidden rounded-xl">
            <img
              src={category.coverImage}
              alt={category.name}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <h1 className="text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-neutral-600">{category.description}</p>
        )}
      </div>
      <PostList posts={publicPosts} />
    </div>
  );
}
