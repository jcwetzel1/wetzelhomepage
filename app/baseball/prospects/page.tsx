import { getProspects } from "@/lib/db";
import ProspectEditor from "./ProspectEditor";

export const dynamic = "force-dynamic";

export default async function ProspectsPage() {
  const prospects = await getProspects();

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Top Prospects</h1>
        <p className="text-gray-500 text-sm mt-1">
          Players tracked on the Minor League Scores page. Add, remove, or fix an MLB ID
          directly here — changes take effect immediately, no redeploy needed.
        </p>
      </header>
      <ProspectEditor prospects={prospects} />
    </main>
  );
}
