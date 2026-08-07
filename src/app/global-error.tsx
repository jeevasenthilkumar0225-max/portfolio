'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-4 font-sans">
        <div className="text-center space-y-4 max-w-md p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl">
          <h2 className="text-2xl font-bold text-amber-400">Something went wrong!</h2>
          <p className="text-xs text-zinc-400 font-mono">{error.message || 'An unexpected application error occurred.'}</p>
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}

