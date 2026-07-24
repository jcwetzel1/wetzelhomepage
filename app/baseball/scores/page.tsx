import { buildDigest, TEAMS } from "@/lib/mlb";
import { getArchivedGames, getProspects, type ArchivedGameRow } from "@/lib/db";
import type { ProspectAppearance } from "@/lib/types";

export const dynamic = "force-dynamic";

function resultBadge(result: "W" | "L" | "T" | null) {
  const styles: Record<string, string> = {
    W: "bg-green-600",
    L: "bg-red-600",
    T: "bg-gray-500",
  };
  if (!result) return null;
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${styles[result]}`}>
      {result}
    </span>
  );
}

function ProspectCard({ p }: { p: ProspectAppearance }) {
  return (
    <div className="bg-amber-50 border border-amber-300 rounded-lg p-3">
      <div className="flex items-baseline justify-between">
        <span className="font-semibold text-amber-800">{p.name}</span>
        <span className="text-xs text-gray-500">{p.team}</span>
      </div>
      {p.battingSummary && (
        <div className="text-sm text-gray-800 mt-1">{p.battingSummary}</div>
      )}
      {p.pitchingSummary && (
        <div className="text-sm text-gray-800 mt-1">{p.pitchingSummary}</div>
      )}
    </div>
  );
}

function GameCard({ row }: { row: ArchivedGameRow }) {
  const prospectIds = new Set(row.prospectAppearances.map((p) => p.mlbId));

  return (
    <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="bg-gray-50 px-4 py-2 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {row.isHome ? "vs" : "@"} {row.opponent} · {row.date}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-gray-900">
            {row.teamScore}–{row.oppScore}
          </span>
          {resultBadge(row.result)}
        </div>
      </div>
      <details className="group">
        <summary className="cursor-pointer list-none px-4 py-2 text-xs text-gray-500 hover:text-gray-800 select-none">
          <span className="group-open:hidden">Show full box score</span>
          <span className="hidden group-open:inline">Hide full box score</span>
        </summary>
        <div className="px-4 pb-4 grid sm:grid-cols-2 gap-4 text-sm">
          {[row.boxscore.away, row.boxscore.home].map((side) => (
            <div key={side.teamName}>
              <div className="text-gray-500 font-medium mb-1">{side.teamName}</div>
              {side.batters.map((b) => (
                <div
                  key={b.id}
                  className={`flex justify-between py-0.5 ${
                    prospectIds.has(b.id) ? "text-amber-700 font-semibold" : "text-gray-700"
                  }`}
                >
                  <span>
                    {b.name} <span className="text-gray-400">{b.position}</span>
                  </span>
                  <span className="font-mono">{b.summary}</span>
                </div>
              ))}
              {side.pitchers.map((p) => (
                <div
                  key={p.id}
                  className={`flex justify-between py-0.5 ${
                    prospectIds.has(p.id) ? "text-amber-700 font-semibold" : "text-gray-500"
                  }`}
                >
                  <span>{p.name}</span>
                  <span className="font-mono">{p.summary}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

export default async function ScoresPage() {
  const prospects = await getProspects();
  const digests = await buildDigest(prospects);
  const allProspectAppearances = digests.flatMap((d) =>
    d.games.flatMap((g) => g.prospectAppearances)
  );

  const archivesByTeam = await Promise.all(
    TEAMS.map(async (team) => ({ team, games: await getArchivedGames(team.id, 10) }))
  );

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Cardinals Farm System</h1>
        <p className="text-gray-500 text-sm mt-1">
          Recent games for Palm Beach, Peoria, Springfield &amp; Memphis
        </p>
      </header>

      {allProspectAppearances.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-amber-800 mb-2">Prospect Watch</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {allProspectAppearances.map((p, i) => (
              <ProspectCard key={`${p.mlbId}-${i}`} p={p} />
            ))}
          </div>
        </section>
      )}

      {archivesByTeam.map(({ team, games }) => (
        <section key={team.id} className="mb-6">
          <h2 className="text-lg font-semibold">{team.name}</h2>
          {games.length === 0 ? (
            <p className="text-gray-400 text-sm mt-2">No archived games yet.</p>
          ) : (
            games.map((row) => <GameCard key={row.gamePk} row={row} />)
          )}
        </section>
      ))}

      <footer className="text-xs text-gray-400 mt-10">
        Data via MLB Stats API. Games are archived permanently as they're fetched.{" "}
        Edit the tracked prospect list under the{" "}
        <a href="/baseball/prospects" className="underline">
          Top Prospects
        </a>{" "}
        tab.
      </footer>
    </main>
  );
}
