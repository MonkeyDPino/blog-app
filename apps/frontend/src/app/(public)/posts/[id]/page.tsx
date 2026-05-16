import { notFound } from 'next/navigation';
import type { IPost } from '@blog/types';
import { PostDetail } from '@/components/posts/PostDetail';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://blog-api.pinodev.app';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;

  let post: IPost | null = null;
  try {
    const res = await fetch(`${API_BASE}/posts/${id}`, { cache: 'no-store' });
    if (res.status === 404) return notFound();
    if (res.ok) {
      post = await res.json();
    }
  } catch {
    return notFound();
  }

  if (!post || post.isDraft) return notFound();

  return <PostDetail post={post} />;
}
