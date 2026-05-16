'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import type { ICategory } from '@blog/types';
import { categoriesApi } from '@/lib/api/categories';
import { ApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ICategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await categoriesApi.delete(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      void loadCategories();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error('This category has associated posts and cannot be deleted');
      } else if (err instanceof ApiError && err.status === 403) {
        toast.error('Only admins can delete categories');
      } else {
        toast.error('Failed to delete category');
      }
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-10 flex items-end justify-between border-b border-border pb-6">
        <div>
          <h1 className="font-serif text-4xl font-bold text-ink">Categories</h1>
          <p className="mt-1 text-sm text-muted">Manage content categories</p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">New category</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p className="py-12 text-center text-muted border border-dashed border-border rounded-xl">
          No categories yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-muted border-b border-border">
              <tr>
                <th className="px-5 py-3.5 font-medium">Name</th>
                <th className="px-5 py-3.5 font-medium">Description</th>
                <th className="px-5 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-5 py-3.5 font-semibold text-ink">
                    {cat.name}
                  </td>
                  <td className="px-5 py-3.5 text-muted max-w-sm truncate">
                    {cat.description ?? <span className="italic">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/categories/${cat.id}/edit`}>
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteTarget(cat)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Delete category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
