"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { ui } from "./ui";

/**
 * A delete button that asks once more before it does anything.
 * Put it inside the <form> whose action does the deleting.
 */
export function ConfirmButton({
  label = "Delete",
  question = "Delete for good?",
}: {
  label?: string;
  question?: string;
}) {
  const [asking, setAsking] = useState(false);
  const { pending } = useFormStatus();

  if (!asking) {
    return (
      <button type="button" className={ui.danger} onClick={() => setAsking(true)}>
        {label}
      </button>
    );
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-red-800">{question}</span>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center bg-red-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Yes, delete"}
      </button>
      <button type="button" className={ui.small} onClick={() => setAsking(false)}>
        Cancel
      </button>
    </span>
  );
}
