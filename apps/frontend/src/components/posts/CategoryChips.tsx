'use client';

import type { ICategory } from '@blog/types';
import { cn } from '@/lib/utils/cn';

interface CategoryChipsProps {
  categories: ICategory[];
  value: number[];
  onChange: (ids: number[]) => void;
  suggested?: string[];
}

export function CategoryChips({
  categories,
  value,
  onChange,
  suggested = [],
}: CategoryChipsProps) {
  const suggestedLower = suggested.map((s) => s.toLowerCase());

  const toggle = (id: number) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const isSelected = value.includes(cat.id);
        const isSuggested =
          !isSelected && suggestedLower.includes(cat.name.toLowerCase());

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => toggle(cat.id)}
            className={cn(
              'rounded-full border px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900',
              isSelected
                ? 'border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800'
                : isSuggested
                  ? 'border-blue-400 bg-blue-50 text-blue-700 hover:bg-blue-100'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100',
            )}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
