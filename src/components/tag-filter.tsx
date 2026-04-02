"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function TagFilter({ tags }: { tags: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag");

  const handleClick = useCallback(
    (tag: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tag) {
        params.set("tag", tag);
      } else {
        params.delete("tag");
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
      <button
        onClick={() => handleClick(null)}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
          !activeTag
            ? "bg-cobalt text-white"
            : "bg-card border border-border text-dust hover:text-ink"
        }`}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => handleClick(tag)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
            activeTag === tag
              ? "bg-cobalt text-white"
              : "bg-card border border-border text-dust hover:text-ink"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
