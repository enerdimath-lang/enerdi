import Link from "next/link";
import type { SiteContent } from "@/content/sections";
import { getContent } from "@/lib/content";

/** The closing band, with the published text. */
export async function ContactCta() {
  const { contact } = await getContent();
  return <ContactCtaView contact={contact} />;
}

/** Closing band that points every page towards the contact form. */
export function ContactCtaView({ contact }: { contact: SiteContent["contact"] }) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="reveal relative isolate overflow-hidden rounded-2xl bg-linear-to-br from-navy-900 via-navy-800 to-navy-700 px-6 py-12 text-white sm:px-12 sm:py-14 lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div
            aria-hidden="true"
            className="absolute -top-1/2 right-0 -z-10 h-[30rem] w-[40rem] opacity-70"
            style={{
              backgroundImage:
                "radial-gradient(closest-side, rgba(18,184,255,0.35), transparent)",
            }}
          />
          <div>
            <h2 className="text-3xl leading-[1.1] font-extrabold sm:text-4xl">{contact.lead}</h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/80">
              {contact.paragraphs[1] ?? contact.paragraphs[0]}
            </p>
          </div>
          <div className="mt-8 flex shrink-0 flex-col gap-3 sm:flex-row lg:mt-0">
            <Link
              href="/contact"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-sky-brand px-6 py-3.5 text-base font-semibold text-navy-950 transition duration-300 hover:-translate-y-0.5 hover:bg-white"
            >
              Contact us
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center rounded-md border border-white/30 px-6 py-3.5 text-base font-semibold text-white transition duration-300 hover:border-white hover:bg-white/10"
            >
              See our services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
