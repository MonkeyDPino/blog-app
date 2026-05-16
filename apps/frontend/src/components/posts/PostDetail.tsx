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
    <article className="mx-auto max-w-2xl">
      {post.coverImage && (
        <div className="mb-10 aspect-video overflow-hidden rounded-xl">
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <header className="mb-10">
        {post.categories.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {post.categories.map((cat) => (
              <Badge key={cat.id} variant="secondary">
                {cat.name}
              </Badge>
            ))}
          </div>
        )}

        <h1 className="font-serif text-4xl font-bold leading-tight text-ink mb-5">
          {post.title}
        </h1>

        <div className="flex items-center gap-2 text-sm text-muted border-b border-border pb-6">
          <span className="font-medium text-ink">{authorName}</span>
          <span>·</span>
          <time>{publishedAt}</time>
        </div>
      </header>

      {post.summary && (
        <p className="mb-8 text-lg text-muted italic border-l-4 border-primary pl-5 leading-relaxed">
          {post.summary}
        </p>
      )}

      {post.content && (
        <div className="prose prose-slate max-w-none prose-headings:font-serif prose-headings:text-ink prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-blockquote:border-primary prose-code:text-primary">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>
      )}
    </article>
  );
}
