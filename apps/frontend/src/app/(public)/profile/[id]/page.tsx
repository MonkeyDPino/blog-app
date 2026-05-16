import { notFound } from 'next/navigation';
import type { IUser, IPost } from '@blog/types';
import { PostList } from '@/components/posts/PostList';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://blog-api.pinodev.app';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: Props) {
  const { id } = await params;

  let user: IUser | null = null;
  let posts: IPost[] = [];

  try {
    const [userRes, postsRes] = await Promise.all([
      fetch(`${API_BASE}/users/${id}`, { cache: 'no-store' }),
      fetch(`${API_BASE}/users/${id}/posts`, { cache: 'no-store' }),
    ]);

    if (userRes.status === 404) return notFound();
    if (userRes.ok) user = await userRes.json();
    if (postsRes.ok) posts = await postsRes.json();
  } catch {
    return notFound();
  }

  if (!user) return notFound();

  const publicPosts = posts.filter((p) => !p.isDraft);

  const fullName = user.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : user.email;

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        {user.profile?.avatarUrl ? (
          <img
            src={user.profile.avatarUrl}
            alt={fullName}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-200 text-2xl font-bold text-neutral-600">
            {fullName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold">{fullName}</h1>
          <p className="text-sm text-neutral-500">{user.email}</p>
        </div>
      </div>

      <h2 className="mb-4 text-xl font-semibold">
        Posts ({publicPosts.length})
      </h2>
      <PostList posts={publicPosts} />
    </div>
  );
}
