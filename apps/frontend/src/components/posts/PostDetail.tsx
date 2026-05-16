'use client';

import type { IPost } from '@blog/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Badge } from '@/components/ui/badge';

interface PostDetailProps {
  post: IPost;
}

export function PostDetail({ post }: PostDetailProps) {
  const authorName = post.author.profile
    ? `${post.author.profile.firstName} ${post.author.profile.lastName}`
    : post.author.email;

  const publishedAt = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="mx-auto max-w-3xl">
      {post.coverImage && (
        <div className="mb-8 aspect-video overflow-hidden rounded-xl">
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <header className="mb-8">
        <div className="mb-3 flex flex-wrap gap-2">
          {post.categories.map((cat) => (
            <Badge key={cat.id} variant="secondary">
              {cat.name}
            </Badge>
          ))}
        </div>
        <h1 className="mb-4 text-4xl font-bold leading-tight">{post.title}</h1>
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <span>{authorName}</span>
          <span>·</span>
          <span>{publishedAt}</span>
        </div>
      </header>

      {post.summary && (
        <p className="mb-6 text-lg text-neutral-600 italic border-l-4 border-neutral-200 pl-4">
          {post.summary}
        </p>
      )}

      {post.content && (
        <div className="prose prose-neutral max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>
      )}
    </article>
  );
}
