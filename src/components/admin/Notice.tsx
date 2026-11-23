import type { FormState } from "@/app/admin/actions";

/** The green or red line that reports what a save did. */
export function Notice({ state }: { state: FormState }) {
  if (!state?.error && !state?.ok) return null;
  const failed = Boolean(state.error);
  return (
    <p
      role={failed ? "alert" : "status"}
      className={`border-l-[6px] px-4 py-3 text-[0.95rem] font-medium ${
        failed
          ? "border-red-600 bg-red-50 text-red-800"
          : "border-emerald-600 bg-emerald-50 text-emerald-900"
      }`}
    >
      {state.error ?? state.ok}
    </p>
  );
}
