import Link from "next/link";
import { ContactCtaView } from "@/components/ContactCta";
import { PageHero } from "@/components/PageHero";
import { ProductCard } from "@/components/ProductCard";
import type { SiteContent } from "@/content/sections";
import type { CatalogItem } from "@/lib/catalog";


/**
 * The page itself, given its content. The public route passes the published
 * content; the admin preview passes the saved draft.
 */
export function ProductsView({
  content,
  products,
}: {
  content: SiteContent;
  products: CatalogItem[];
}) {
  const { productsPage } = content;
  return (
    <>
      <PageHero
        eyebrow={productsPage.eyebrow}
        title={productsPage.title}
        intro={productsPage.intro}
      />

      <section className="bg-paper">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                index={index}
                name={product.name}
                fullName={product.full_name}
                category={product.category}
                text={product.description}
                image={product.image_url}
              />
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

      <ContactCtaView contact={content.contact} />
    </>
  );
}
