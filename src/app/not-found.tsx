import Link from "next/link";

export default function NotFound() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <p className="font-mono text-xs tracking-[0.18em] text-navy-700 uppercase">
          Error 404
        </p>
        <h1 className="mt-4 text-4xl font-extrabold text-navy-800 sm:text-5xl">
          This page does not exist.
        </h1>
        <p className="mt-8">
          <Link
            href="/"
            className="inline-flex bg-navy-800 px-7 py-4 font-semibold text-white transition-colors hover:bg-navy-700"
          >
            Back to home
          </Link>
        </p>
      </div>
    </section>
  );
}
