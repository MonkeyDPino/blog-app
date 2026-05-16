import Link from 'next/link';
import type { IPost } from '@blog/types';
import { Badge } from '@/components/ui/badge';

interface PostCardProps {
  post: IPost;
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

export function PostCard({ post }: PostCardProps) {
  const authorName = post.author.profile
    ? `${post.author.profile.firstName} ${post.author.profile.lastName}`
    : post.author.email;

  const excerpt = post.summary
    ? truncate(post.summary, 140)
    : post.content
      ? truncate(post.content.replace(/[#*`>_~\[\]]/g, ''), 140)
      : null;

  const publishedAt = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <article className="group flex flex-col rounded-xl border border-border bg-surface overflow-hidden hover:shadow-md hover:border-primary/30 transition-all duration-200">
      {post.coverImage && (
        <div className="aspect-video overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        </div>
      )}

      <div className="flex flex-col flex-1 p-5">
        {post.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.categories.map((cat) => (
              <Badge key={cat.id} variant="secondary">
                {cat.name}
              </Badge>
            ))}
          </div>
        )}

        <h2 className="font-serif text-lg font-semibold leading-snug text-ink mb-2">
          <Link
            href={`/posts/${post.id}`}
            className="hover:text-primary transition-colors"
          >
            {post.title}
          </Link>
        </h2>

        {excerpt && (
          <p className="flex-1 text-sm text-muted leading-relaxed mb-4">
            {excerpt}
          </p>
        )}

        <footer className="flex items-center gap-1.5 text-xs text-muted mt-auto pt-3 border-t border-border">
          <span className="font-medium text-ink">{authorName}</span>
          <span>·</span>
          <span>{publishedAt}</span>
        </footer>
      </div>
    </article>
  );
}
