'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function Navbar() {
  const { user, isLoading, logout } = useAuth();

  const fullName = user?.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : (user?.email ?? '');

  return (
    <header className="border-b border-neutral-200 bg-white">
      <nav className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-neutral-900">
          Blog App
        </Link>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </>
          ) : user ? (
            <>
              <span className="text-sm text-neutral-600">{fullName}</span>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              {user.role === 'admin' && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/categories">Admin</Link>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
