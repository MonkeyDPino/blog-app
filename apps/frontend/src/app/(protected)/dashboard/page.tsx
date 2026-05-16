'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { IPost } from '@blog/types';
import { useAuth } from '@/hooks/useAuth';
import { usersApi } from '@/lib/api/users';
import { postsApi } from '@/lib/api/posts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<IPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    usersApi
      .getPosts(user.id)
      .then(setPosts)
      .catch(() => toast.error('Failed to load posts'))
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      await postsApi.delete(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const published = posts.filter((p) => !p.isDraft);
  const drafts = posts.filter((p) => p.isDraft);

  if (isLoading) {
    return <p className="text-neutral-500">Loading…</p>;
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/posts/new">New post</Link>
        </Button>
      </div>

      <PostSection
        title="Published"
        posts={published}
        onDelete={handleDelete}
      />
      <PostSection
        title="Drafts"
        posts={drafts}
        onDelete={handleDelete}
        showDraftBadge
      />
    </div>
  );
}

interface PostSectionProps {
  title: string;
  posts: IPost[];
  onDelete: (id: number) => void;
  showDraftBadge?: boolean;
}

function PostSection({
  title,
  posts,
  onDelete,
  showDraftBadge = false,
}: PostSectionProps) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-xl font-semibold">
        {title} ({posts.length})
      </h2>
      {posts.length === 0 ? (
        <p className="text-sm text-neutral-500">None yet.</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                {showDraftBadge && (
                  <Badge variant="outline" className="shrink-0">
                    Draft
                  </Badge>
                )}
                <span className="truncate font-medium">{post.title}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2 ml-4">
                {!post.isDraft && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/posts/${post.id}`}>View</Link>
                  </Button>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/posts/${post.id}/edit`}>Edit</Link>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(post.id)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
