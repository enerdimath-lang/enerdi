import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/Logo";
import { getAdmin, setupProblem } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

/** Anyone already signed in goes straight to the dashboard. */
async function Form() {
  if (await getAdmin()) redirect("/admin");
  return <LoginForm problem={setupProblem()} />;
}

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <Link href="/" aria-label="ENERDI home" className="inline-block">
          <Logo />
        </Link>
        <div className="mt-8 border border-line border-t-[6px] border-t-sky-brand bg-white p-8">
          <p className="font-mono text-xs tracking-[0.18em] text-navy-700 uppercase">
            Admin
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-navy-800">Sign in</h1>
          <p className="mt-2 mb-7 text-muted">
            Manage the articles, blog posts and text of the ENERDI website.
          </p>
          <Suspense fallback={<p className="text-muted">Loading…</p>}>
            <Form />
          </Suspense>
        </div>
        <p className="mt-6 text-sm">
          <Link href="/" className="font-semibold text-navy-800 underline decoration-sky-brand decoration-2 underline-offset-4">
            ← Back to the website
          </Link>
        </p>
      </div>
    </main>
  );
}
