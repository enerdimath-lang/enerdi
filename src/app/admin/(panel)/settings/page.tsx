import { param } from "@/components/admin/bits";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { PageTitle } from "@/components/admin/PageTitle";
import { defaults, sections } from "@/content/sections";
import { requireAdmin } from "@/lib/auth";
import { getSectionForEditing } from "@/lib/content";

// Waits for the session check on the server instead of showing a prefetched page.
export const instant = false;

export default async function SettingsPage({ searchParams }: PageProps<"/admin/settings">) {
  await requireAdmin();
  const [state, query] = await Promise.all([getSectionForEditing("site"), searchParams]);
  const resetAt = param(query.reset);

  return (
    <>
      <PageTitle eyebrow="Settings" title="Website settings" intro={sections.site.note} />
      {resetAt && (
        <p role="status" className="mb-6 border-l-[6px] border-emerald-600 bg-emerald-50 px-4 py-3 font-medium text-emerald-900">
          Back to the original settings.
        </p>
      )}
      <ContentEditor
        key={resetAt}
        sectionKey="site"
        returnTo="/admin/settings"
        template={defaults.site}
        initial={state.working}
        hasDraft={state.hasDraft}
        isCustomised={state.isCustomised}
        library={[]}
      />
    </>
  );
}
