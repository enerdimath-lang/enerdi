import Link from "next/link";
import { ui } from "./ui";

/** The heading block at the top of each admin page. */
export function PageTitle({
  eyebrow,
  title,
  intro,
  back,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  back?: { href: string; label: string };
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {back && (
          <p className="mb-3 text-sm">
            <Link
              href={back.href}
              className="font-semibold text-navy-800 underline decoration-sky-brand decoration-2 underline-offset-4"
            >
              ← {back.label}
            </Link>
          </p>
        )}
        <p className={ui.eyebrow}>{eyebrow}</p>
        <h1 className={`${ui.h1} mt-2`}>{title}</h1>
        {intro && <p className="mt-2 max-w-2xl text-muted">{intro}</p>}
      </div>
      {children}
    </div>
  );
}
