import Link from "next/link";
import { contact } from "@/content/site";

/** Closing band that points every page towards the contact form. */
export function ContactCta() {
  return (
    <section className="bg-sky-brand text-navy-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-14 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl leading-tight font-extrabold sm:text-4xl">
            {contact.lead}
          </h2>
          <p className="mt-3 max-w-xl text-lg text-navy-900">
            {contact.paragraphs[1]}
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex shrink-0 items-center justify-center bg-navy-800 px-7 py-4 text-base font-semibold text-white transition-colors hover:bg-navy-950"
        >
          Contact us
        </Link>
      </div>
    </section>
  );
}
