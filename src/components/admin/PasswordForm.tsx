"use client";

import { useActionState } from "react";
import { changePassword } from "@/app/admin/actions";
import { Notice } from "./Notice";
import { ui } from "./ui";

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, null);
  return (
    <form action={action} className="grid max-w-md gap-5">
      <Notice state={state} />
      <label className={ui.label}>
        Current password
        <input name="current" type="password" autoComplete="current-password" required className={ui.input} />
      </label>
      <label className={ui.label}>
        New password
        <span className="font-normal text-muted"> (at least 10 characters)</span>
        <input name="next" type="password" autoComplete="new-password" required minLength={10} className={ui.input} />
      </label>
      <label className={ui.label}>
        New password again
        <input name="repeat" type="password" autoComplete="new-password" required minLength={10} className={ui.input} />
      </label>
      <div>
        <button type="submit" disabled={pending} className={ui.primary}>
          {pending ? "Saving…" : "Change password"}
        </button>
      </div>
    </form>
  );
}
