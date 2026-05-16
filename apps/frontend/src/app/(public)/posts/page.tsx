import Link from 'next/link';
import type { IPost } from '@blog/types';
import { PostList } from '@/components/posts/PostList';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://blog-api.pinodev.app';

export default async function PostsPage() {
  let posts: IPost[] = [];
  try {
    const res = await fetch(`${API_BASE}/posts`, { cache: 'no-store' });
    if (res.ok) {
      posts = await res.json();
    }
  } catch {
    // Network error — render empty list
  }

  const publicPosts = posts.filter((p) => !p.isDraft);

  return (
    <div>
      <div className="mb-10 flex items-end justify-between border-b border-border pb-6">
        <div>
          <h1 className="font-serif text-4xl font-bold text-ink">
            Latest Posts
          </h1>
          <p className="mt-1 text-muted text-sm">
            {publicPosts.length}{' '}
            {publicPosts.length === 1 ? 'article' : 'articles'} published
          </p>
        </div>
        <Link
          href="/posts/search"
          className="text-sm text-primary hover:underline font-medium"
        >
          Search →
        </Link>
      </div>
      <PostList posts={publicPosts} />
    </div>
  );
}
