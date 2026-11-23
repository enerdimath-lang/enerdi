"use client";

import { useActionState, useState } from "react";
import { createAdminAction, manageAdminAction, updateProfile } from "@/app/admin/actions";
import { Notice } from "./Notice";
import { ui } from "./ui";

export function CreateAdminForm() {
  const [state, action, pending] = useActionState(createAdminAction, null);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-3 sm:items-end">
      <div className="sm:col-span-3">
        <Notice state={state} />
      </div>
      <label className={ui.label}>
        Name
        <input name="name" required maxLength={80} className={ui.input} />
      </label>
      <label className={ui.label}>
        Email
        <input name="email" type="email" required maxLength={200} autoComplete="off" className={ui.input} />
      </label>
      <label className={ui.label}>
        Password <span className="font-normal text-muted">(10+ characters)</span>
        <input name="password" type="password" required minLength={10} autoComplete="new-password" className={ui.input} />
      </label>
      <div className="sm:col-span-3">
        <button type="submit" disabled={pending} className={ui.primary}>
          {pending ? "Creating…" : "Create administrator"}
        </button>
        <p className={ui.hint}>
          Tell them the password yourself. They can change it after signing in, under Account.
        </p>
      </div>
    </form>
  );
}

/** Disable, enable, reset the password of, or delete one other admin. */
export function ManageAdmin({ id, disabled }: { id: number; disabled: boolean }) {
  const [state, action, pending] = useActionState(manageAdminAction, null);
  const [mode, setMode] = useState<"password" | "delete" | null>(null);

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="id" value={id} />
      <Notice state={state} />
      <div className="flex flex-wrap gap-2">
        <button type="submit" name="intent" value={disabled ? "enable" : "disable"} disabled={pending} className={ui.small}>
          {disabled ? "Enable account" : "Disable account"}
        </button>
        <button type="button" className={ui.small} onClick={() => setMode(mode === "password" ? null : "password")}>
          Set a new password
        </button>
        <button type="button" className={ui.danger} onClick={() => setMode(mode === "delete" ? null : "delete")}>
          Delete
        </button>
      </div>
      {mode === "password" && (
        <div className="flex flex-wrap items-end gap-2">
          <label className={ui.label}>
            New password
            <input name="password" type="password" minLength={10} autoComplete="new-password" className={ui.input} />
          </label>
          <button type="submit" name="intent" value="password" disabled={pending} className={ui.primary}>
            Set password
          </button>
        </div>
      )}
      {mode === "delete" && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-red-800">Delete this administrator for good?</span>
          <button
            type="submit"
            name="intent"
            value="delete"
            disabled={pending}
            className="inline-flex items-center bg-red-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
          >
            Yes, delete
          </button>
        </div>
      )}
    </form>
  );
}

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, action, pending] = useActionState(updateProfile, null);
  const [values, setValues] = useState({ name, email });
  const emailChanged = values.email.trim().toLowerCase() !== email;

  return (
    <form action={action} className="grid max-w-md gap-5">
      <Notice state={state} />
      <label className={ui.label}>
        Name
        <input
          name="name"
          value={values.name}
          onChange={(event) => setValues({ ...values, name: event.target.value })}
          required
          maxLength={80}
          className={ui.input}
        />
      </label>
      <label className={ui.label}>
        Email <span className="font-normal text-muted">(this is what you sign in with)</span>
        <input
          name="email"
          type="email"
          value={values.email}
          onChange={(event) => setValues({ ...values, email: event.target.value })}
          required
          maxLength={200}
          className={ui.input}
        />
      </label>
      {emailChanged && (
        <label className={ui.label}>
          Current password <span className="font-normal text-muted">(needed to change the email)</span>
          <input name="current" type="password" autoComplete="current-password" required className={ui.input} />
        </label>
      )}
      <div>
        <button type="submit" disabled={pending} className={ui.primary}>
          {pending ? "Saving…" : "Save profile"}
        </button>
      </div>
    </form>
  );
}
