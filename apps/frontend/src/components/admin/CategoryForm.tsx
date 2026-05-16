'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { ICategory } from '@blog/types';
import { categoriesApi } from '@/lib/api/categories';
import { ApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  description: z.string().optional(),
  coverImage: z
    .union([z.string().url('Must be a valid URL'), z.literal('')])
    .optional(),
});

type FormValues = z.infer<typeof schema>;

interface CategoryFormProps {
  categoryId?: number;
  initialData?: ICategory;
  onSuccess?: () => void;
}

export function CategoryForm({
  categoryId,
  initialData,
  onSuccess,
}: CategoryFormProps) {
  const router = useRouter();
  const isEditing = categoryId !== undefined;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      coverImage: initialData?.coverImage ?? '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    const payload = {
      name: data.name,
      description: data.description || undefined,
      coverImage: data.coverImage || undefined,
    };

    try {
      if (isEditing && categoryId !== undefined) {
        await categoriesApi.update(categoryId, payload);
        toast.success('Category updated');
      } else {
        await categoriesApi.create(payload);
        toast.success('Category created');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/admin/categories');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 403) {
          toast.error('Only admins can manage categories');
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error('Something went wrong');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-5">
      <div className="space-y-1">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" {...register('name')} />
        {errors.name && (
          <p className="text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={4} {...register('description')} />
        {errors.description && (
          <p className="text-xs text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="coverImage">Cover Image URL</Label>
        <Input
          id="coverImage"
          type="url"
          placeholder="https://…"
          {...register('coverImage')}
        />
        {errors.coverImage && (
          <p className="text-xs text-red-600">{errors.coverImage.message}</p>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Saving…'
            : isEditing
              ? 'Save changes'
              : 'Create category'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/categories')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
