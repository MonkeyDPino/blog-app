import Link from 'next/link';
import type { IPost } from '@blog/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
    ? truncate(post.summary, 160)
    : post.content
      ? truncate(post.content.replace(/[#*`>_~\[\]]/g, ''), 160)
      : null;

  const publishedAt = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      {post.coverImage && (
        <div className="aspect-video overflow-hidden rounded-t-xl">
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex flex-wrap gap-1 mb-2">
          {post.categories.map((cat) => (
            <Badge key={cat.id} variant="secondary">
              {cat.name}
            </Badge>
          ))}
        </div>
        <CardTitle className="text-lg leading-snug">
          <Link
            href={`/posts/${post.id}`}
            className="hover:underline text-neutral-900"
          >
            {post.title}
          </Link>
        </CardTitle>
      </CardHeader>

      {excerpt && (
        <CardContent className="flex-1 pb-2 text-sm text-neutral-600">
          {excerpt}
        </CardContent>
      )}

      <CardFooter className="text-xs text-neutral-500 gap-2">
        <span>{authorName}</span>
        <span>·</span>
        <span>{publishedAt}</span>
      </CardFooter>
    </Card>
  );
}
