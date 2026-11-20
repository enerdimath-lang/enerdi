import type { Metadata } from "next";
import Link from "next/link";
import { ContactCta } from "@/components/ContactCta";
import { PageHero } from "@/components/PageHero";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/content/site";

export const metadata: Metadata = {
  title: "Products",
  description: "Technology products from ENERDI.",
};

export default function ProductsPage() {
  return (
    <>
      <PageHero
        eyebrow="Products"
        title="Our products"
        intro="Technology products built from the problems we meet in the field."
      />

      <section className="bg-paper">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {products.map((product, index) => (
              <ProductCard key={product.name} index={index} {...product} />
            ))}
          </div>
          <p className="mt-10 text-lg text-muted">
            Want to know more about a product?{" "}
            <Link
              href="/contact"
              className="font-semibold text-navy-800 underline decoration-sky-brand decoration-2 underline-offset-[6px] hover:text-navy-700"
            >
              Ask us
            </Link>
            .
          </p>
        </div>
      </section>

      <ContactCta />
    </>
  );
}
