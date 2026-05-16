'use client';

import { useState, useEffect, useRef } from 'react';
import type { IPost } from '@blog/types';
import { postsApi } from '@/lib/api/posts';
import { PostList } from '@/components/posts/PostList';
import { Input } from '@/components/ui/input';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<IPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!query.trim()) {
      setResults([]);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const posts = await postsApi.search(query.trim());
        setResults(posts.filter((p) => !p.isDraft));
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Search posts</h1>
      <Input
        type="search"
        placeholder="Type to search…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-8 max-w-xl"
        autoFocus
      />
      {isLoading ? (
        <p className="text-neutral-500">Searching…</p>
      ) : query.trim() ? (
        <PostList posts={results} />
      ) : null}
    </div>
  );
}
