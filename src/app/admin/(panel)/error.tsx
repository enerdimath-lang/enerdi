"use client";

import { useEffect } from "react";
import { ui } from "@/components/admin/ui";

export default function AdminError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="border border-line border-l-[6px] border-l-red-600 bg-white p-8">
      <h1 className={ui.h1}>This page could not be loaded.</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Most often this means the database cannot be reached. Check that
        PostgreSQL is running and that the settings in .env.local are right,
        then try again.
      </p>
      <button type="button" className={`${ui.primary} mt-6`} onClick={() => retry()}>
        Try again
      </button>
    </div>
  );
}
