import { logActivity } from "@/lib/activity";
import { getAdmin } from "@/lib/auth";
import { allEnquiries, enquiriesToCsv, isEnquiryStatus } from "@/lib/enquiries";

/** Downloads the enquiries, filtered the same way as the list, as a CSV file. Admins only. */
export async function GET(request: Request) {
  const admin = await getAdmin();
  if (!admin) return new Response("Please sign in.", { status: 401 });

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const search = (url.searchParams.get("q") ?? "").trim().slice(0, 100);

  let csv: string;
  try {
    csv = enquiriesToCsv(
      await allEnquiries({ status: isEnquiryStatus(status) ? status : undefined, search }),
    );
  } catch (error) {
    console.error("Enquiries: the export could not be created.", error);
    return new Response("The export could not be created.", { status: 500 });
  }

  await logActivity(admin, "Exported enquiries", "Enquiries");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="enerdi-enquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
