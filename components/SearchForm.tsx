"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";

export function SearchForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    const encoded = encodeURIComponent(query.trim());
    router.push(`/map?search=${encoded}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try 'Bangalore', 'Delhi', or any address..."
            className="w-full rounded-2xl border-2 border-zinc-200 bg-white px-6 py-4 pr-12 text-base text-zinc-900 placeholder-zinc-400 transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
            disabled={isLoading}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-2xl bg-emerald-600 px-8 py-4 font-semibold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-70 dark:focus:ring-offset-zinc-900"
        >
          {isLoading ? "Searching..." : "Explore"}
        </button>
      </div>
    </form>
  );
}
