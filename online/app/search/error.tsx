"use client";

import { Brand } from "@/components/brand/Brand";
import { ErrorState } from "@/components/states/ErrorState";

export default function SearchError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-[#f6f8f5] px-5 py-6 text-[#17231f] sm:px-8">
      <div className="mx-auto max-w-[1120px]">
        <Brand />
        <div className="py-20">
          <ErrorState onRetry={reset} />
        </div>
      </div>
    </main>
  );
}
