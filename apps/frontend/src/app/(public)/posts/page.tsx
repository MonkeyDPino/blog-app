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
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Posts</h1>
        <a
          href="/posts/search"
          className="text-sm text-neutral-600 underline hover:text-neutral-900"
        >
          Search
        </a>
      </div>
      <PostList posts={publicPosts} />
    </div>
  );
}
