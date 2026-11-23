import { PageTitle } from "@/components/admin/PageTitle";
import { PasswordForm } from "@/components/admin/PasswordForm";
import { ui } from "@/components/admin/ui";
import { ProfileForm } from "@/components/admin/UserForms";
import { requireAdmin } from "@/lib/auth";

// Waits for the session check on the server instead of showing a prefetched page.
export const instant = false;

export default async function AccountPage() {
  const admin = await requireAdmin();
  return (
    <>
      <PageTitle eyebrow="Account" title="Your account" intro={`Signed in as ${admin.email}.`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className={`${ui.card} p-6`}>
          <h2 className="mb-5 text-xl font-extrabold text-navy-800">Name and email</h2>
          <ProfileForm name={admin.name} email={admin.email} />
        </section>
        <section className={`${ui.card} p-6`}>
          <h2 className="mb-5 text-xl font-extrabold text-navy-800">Change password</h2>
          <PasswordForm />
        </section>
      </div>
    </>
  );
}
