'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ICategory } from '@blog/types';
import { postsApi } from '@/lib/api/posts';
import { aiApi } from '@/lib/api/ai';
import { ApiError } from '@/lib/api/client';
import { CategoryChips } from './CategoryChips';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
  coverImage: z
    .union([z.string().url('Must be a valid URL'), z.literal('')])
    .optional(),
  categoryIds: z.array(z.number()),
});

type FormValues = z.infer<typeof schema>;

interface PostFormProps {
  postId?: number;
  initialValues?: {
    title: string;
    content?: string;
    coverImage?: string;
    categoryIds: number[];
  };
  categories: ICategory[];
}

export function PostForm({ postId, initialValues, categories }: PostFormProps) {
  const router = useRouter();
  const isEditing = Boolean(postId);

  const [aiInstruction, setAiInstruction] = useState('');
  const [aiImproved, setAiImproved] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [suggestedNames, setSuggestedNames] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialValues?.title ?? '',
      content: initialValues?.content ?? '',
      coverImage: initialValues?.coverImage ?? '',
      categoryIds: initialValues?.categoryIds ?? [],
    },
  });

  const content = watch('content') ?? '';
  const categoryIds = watch('categoryIds') ?? [];

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        title: data.title,
        content: data.content || undefined,
        coverImage: data.coverImage || undefined,
        categoryIds: data.categoryIds,
      };

      if (isEditing && postId) {
        await postsApi.update(postId, payload);
        toast.success('Post updated');
      } else {
        const created = await postsApi.create(payload);
        toast.success('Post created');
        router.push(`/posts/${created.id}/edit`);
        return;
      }
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(
          Array.isArray(err.body.message)
            ? err.body.message.join(', ')
            : err.body.message,
        );
      } else {
        toast.error('Something went wrong');
      }
    }
  };

  const handleAiImprove = async () => {
    if (!content.trim()) {
      toast.warning('Write some content first');
      return;
    }
    if (!aiInstruction.trim()) {
      toast.warning('Enter an instruction for the AI');
      return;
    }
    setIsAiLoading(true);
    try {
      const { improved } = await aiApi.improveContent(content, aiInstruction);
      setAiImproved(improved);
    } catch {
      toast.error('AI improve failed');
    } finally {
      setIsAiLoading(false);
    }
  };

  const acceptAiImprovement = () => {
    if (aiImproved) {
      setValue('content', aiImproved);
      setAiImproved(null);
      setShowAiPanel(false);
      setAiInstruction('');
    }
  };

  const handleSuggestCategories = async () => {
    if (!postId) {
      toast.warning('Save the post first to get category suggestions');
      return;
    }
    setIsSuggesting(true);
    try {
      const { suggestions } = await postsApi.suggestCategories(postId);
      setSuggestedNames(suggestions);

      const matchedIds = categories
        .filter((cat) =>
          suggestions.some((s) => s.toLowerCase() === cat.name.toLowerCase()),
        )
        .map((cat) => cat.id);

      const newIds = [...new Set([...categoryIds, ...matchedIds])];
      setValue('categoryIds', newIds);
      toast.success(
        `${matchedIds.length} categor${matchedIds.length === 1 ? 'y' : 'ies'} suggested`,
      );
    } catch {
      toast.error('Category suggestion failed');
    } finally {
      setIsSuggesting(false);
    }
  };

  const handlePublish = async () => {
    if (!postId) return;
    setIsPublishing(true);
    try {
      await postsApi.publish(postId);
      toast.success('Post published!');
      router.push(`/posts/${postId}`);
    } catch {
      toast.error('Failed to publish');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left — form fields */}
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Your post title…"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-xs text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="coverImage">Cover image URL</Label>
              <Input
                id="coverImage"
                type="url"
                placeholder="https://…"
                {...register('coverImage')}
              />
              {errors.coverImage && (
                <p className="text-xs text-red-600">
                  {errors.coverImage.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Content (Markdown)</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAiPanel(!showAiPanel)}
                >
                  ✨ AI Improve
                </Button>
              </div>
              <Textarea
                id="content"
                rows={16}
                className="font-mono text-sm"
                placeholder="Write your content in Markdown…"
                {...register('content')}
              />
            </div>

            {/* AI Improve panel */}
            {showAiPanel && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                <p className="text-sm font-semibold text-primary">
                  AI Content Improvement
                </p>
                <Input
                  placeholder="Instruction — e.g. 'Make it more concise'"
                  value={aiInstruction}
                  onChange={(e) => setAiInstruction(e.target.value)}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAiImprove}
                  disabled={isAiLoading}
                >
                  {isAiLoading ? 'Improving…' : 'Improve'}
                </Button>
                {aiImproved && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-primary">
                      Improved version:
                    </p>
                    <div className="max-h-48 overflow-y-auto rounded-md border border-border bg-surface p-3 text-sm font-mono whitespace-pre-wrap">
                      {aiImproved}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={acceptAiImprovement}
                      >
                        Accept
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAiImproved(null);
                          setAiInstruction('');
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Categories</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSuggestCategories}
                  disabled={isSuggesting || !postId}
                  title={!postId ? 'Save the post first' : undefined}
                >
                  {isSuggesting ? 'Suggesting…' : '🤖 Suggest'}
                </Button>
              </div>
              <CategoryChips
                categories={categories}
                value={categoryIds}
                onChange={(ids) => setValue('categoryIds', ids)}
                suggested={suggestedNames}
              />
            </div>
          </div>

          {/* Right — live preview */}
          <div className="space-y-1.5">
            <Label>Preview</Label>
            <div className="min-h-[400px] rounded-xl border border-border bg-surface p-6 prose prose-slate max-w-none overflow-y-auto prose-headings:font-serif">
              {content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              ) : (
                <p className="text-muted italic not-prose">
                  Preview will appear here…
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Saving…'
              : isEditing
                ? 'Save changes'
                : 'Save draft'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>

      {isEditing && postId && (
        <div className="border-t border-border pt-5">
          <Button variant="cta" onClick={handlePublish} disabled={isPublishing}>
            {isPublishing ? 'Publishing…' : 'Publish post'}
          </Button>
          <p className="mt-1.5 text-xs text-muted">
            Publishing makes this post visible to everyone.
          </p>
        </div>
      )}
    </div>
  );
}
