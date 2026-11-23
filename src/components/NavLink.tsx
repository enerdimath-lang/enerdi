import Link from "next/link";
import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<"a">, "href"> & { href: string; newTab?: boolean };

/**
 * A menu link from the admin panel. Pages of this site use the fast in-app
 * link; other websites, email and phone links use an ordinary one.
 */
export function NavLink({ href, newTab, children, ...rest }: Props) {
  const internal = href.startsWith("/") || href.startsWith("#");
  const target = newTab ? { target: "_blank", rel: "noopener noreferrer" } : {};
  if (internal) {
    return (
      <Link href={href} {...target} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} {...target} {...rest}>
      {children}
    </a>
  );
}
