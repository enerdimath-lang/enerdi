"use client";

import { useState } from "react";
import { ui } from "./ui";

export function CopyButton({ text, label = "Copy address" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={ui.small}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard access can be refused; the address is shown beside the button anyway.
        }
      }}
    >
      {copied ? "Copied" : label}
    </button>
  );
}
