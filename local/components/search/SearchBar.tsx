"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, LoaderCircle, Search } from "lucide-react";

interface SearchBarProps {
  initialValue?: string;
  variant?: "hero" | "compact";
  autoFocus?: boolean;
}

export function SearchBar({
  initialValue = "",
  variant = "hero",
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      event.preventDefault();
      setError("先输入一个想学习的主题吧");
      return;
    }

    setError("");
    setIsSubmitting(true);
  }

  const isHero = variant === "hero";

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        action="/search"
        method="get"
        className={`group relative flex w-full items-center rounded-[22px] border bg-white transition-all duration-300 focus-within:border-[#86aa9c] focus-within:shadow-[0_22px_60px_rgba(34,74,61,0.14)] ${
          isHero
            ? "min-h-[72px] border-[#d7e0da] p-2.5 shadow-[0_18px_50px_rgba(32,62,52,0.1)] sm:min-h-[80px] sm:rounded-[26px] sm:p-3"
            : "min-h-14 border-[#dbe3de] p-2 shadow-[0_8px_28px_rgba(32,62,52,0.08)]"
        }`}
      >
        <Search
          className={`ml-2 shrink-0 text-[#6f7e78] ${isHero ? "size-5 sm:ml-3 sm:size-6" : "size-5"}`}
          strokeWidth={2}
          aria-hidden="true"
        />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            if (error) setError("");
          }}
          name="q"
          type="search"
          maxLength={80}
          autoComplete="off"
          autoFocus={autoFocus}
          placeholder="输入你想学习的主题，例如：Python 异步编程"
          aria-label="搜索学习主题"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "search-error" : undefined}
          className={`min-w-0 flex-1 bg-transparent px-3 font-medium text-[#17231f] outline-none placeholder:text-[#9aa6a1] ${
            isHero ? "text-sm sm:px-4 sm:text-base" : "text-sm"
          }`}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-[16px] bg-[#173f36] font-bold text-white shadow-[0_8px_20px_rgba(23,63,54,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[#205648] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70 ${
            isHero ? "size-12 px-4 sm:h-14 sm:w-auto sm:min-w-28" : "size-10 px-3 sm:w-auto"
          }`}
        >
          {isSubmitting ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <>
              <span className={isHero ? "hidden sm:inline" : "hidden md:inline"}>开始探索</span>
              <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden="true" />
            </>
          )}
        </button>
      </form>
      {error && (
        <p id="search-error" role="alert" className="mt-2 pl-4 text-left text-xs font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
