"use client";

import { useEffect } from "react";

/** Shown in place of a public page that could not be loaded, for instance while the database is unreachable. */
export default function SiteError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <p className="font-mono text-xs tracking-[0.18em] text-navy-700 uppercase">
          Temporarily unavailable
        </p>
        <h1 className="mt-4 text-4xl font-extrabold text-navy-800 sm:text-5xl">
          This page could not be loaded just now.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted">
          Please try again in a moment.
        </p>
        <button
          type="button"
          onClick={() => retry()}
          className="mt-8 inline-flex bg-navy-800 px-7 py-4 font-semibold text-white transition-colors hover:bg-navy-700"
        >
          Try again
        </button>
      </div>
    </section>
  );
}
