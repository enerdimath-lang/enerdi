"use client";

import { useActionState, useState } from "react";
import { login } from "@/app/admin/actions";
import { Notice } from "./Notice";
import { ui } from "./ui";

export function LoginForm({ problem }: { problem: string | null }) {
  const [state, action, pending] = useActionState(login, null);
  // Kept in state so a wrong password does not also clear the email.
  const [email, setEmail] = useState("");

  return (
    <form action={action} className="grid gap-5">
      <Notice state={state ?? (problem ? { error: problem } : null)} />
      <label className={ui.label}>
        Email
        <input
          name="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className={ui.input}
        />
      </label>
      <label className={ui.label}>
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={ui.input}
        />
      </label>
      <button type="submit" disabled={pending} className={`${ui.primary} py-3`}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
