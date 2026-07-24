import { buildDigest, type GameDigest, type ProspectAppearance } from "@/lib/mlb";
import prospects from "@/data/prospects.json";

export const revalidate = 3600;

function resultBadge(result: "W" | "L" | "T" | null) {
  const styles: Record<string, string> = {
    W: "bg-green-600",
    L: "bg-red-600",
    T: "bg-gray-500",
  };
  if (!result) return null;
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold ${styles[result]}`}>
      {result}
    </span>
  );
}

function ProspectCard({ p }: { p: ProspectAppearance }) {
  return (
    <div className="bg-gray-900 border border-yellow-700/40 rounded-lg p-3">
      <div className="flex items-baseline justify-between">
        <span className="font-semibold text-yellow-400">{p.name}</span>
        <span className="text-xs text-gray-400">{p.team}</span>
      </div>
      {p.battingSummary && (
        <div className="text-sm text-gray-200 mt-1">{p.battingSummary}</div>
      )}
      {p.pitchingSummary && (
        <div className="text-sm text-gray-200 mt-1">{p.pitchingSummary}</div>
      )}
    </div>
  );
}

function GameCard({ game }: { game: GameDigest }) {
  const { game: g, boxscore, prospectAppearances } = game;
  const prospectIds = new Set(prospectAppearances.map((p) => p.mlbId));

  return (
    <div className="mt-3 border border-gray-800 rounded-lg overflow-hidden">
      <div className="bg-gray-900 px-4 py-2 flex items-center justify-between">
        <div className="text-sm text-gray-300">
          {g.isHome ? "vs" : "@"} {g.opponent} · {g.date}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">
            {g.teamScore}–{g.oppScore}
          </span>
          {resultBadge(g.result)}
        </div>
      </div>
      <details className="group">
        <summary className="cursor-pointer list-none px-4 py-2 text-xs text-gray-400 hover:text-gray-200 select-none">
          <span className="group-open:hidden">Show full box score</span>
          <span className="hidden group-open:inline">Hide full box score</span>
        </summary>
        <div className="px-4 pb-4 grid sm:grid-cols-2 gap-4 text-sm">
          {[boxscore.away, boxscore.home].map((side) => (
            <div key={side.teamName}>
              <div className="text-gray-400 font-medium mb-1">{side.teamName}</div>
              {side.batters.map((b) => (
                <div
                  key={b.id}
                  className={`flex justify-between py-0.5 ${
                    prospectIds.has(b.id) ? "text-yellow-400 font-semibold" : "text-gray-300"
                  }`}
                >
                  <span>
                    {b.name} <span className="text-gray-500">{b.position}</span>
                  </span>
                  <span className="font-mono">{b.summary}</span>
                </div>
              ))}
              {side.pitchers.map((p) => (
                <div
                  key={p.id}
                  className={`flex justify-between py-0.5 ${
                    prospectIds.has(p.id) ? "text-yellow-400 font-semibold" : "text-gray-400"
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

export default async function Home() {
  const digests = await buildDigest(prospects);
  const allProspectAppearances = digests.flatMap((d) =>
    d.games.flatMap((g) => g.prospectAppearances)
  );

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Cardinals Farm System</h1>
        <p className="text-gray-400 text-sm mt-1">
          Most recent completed games for Palm Beach, Peoria, Springfield &amp; Memphis
        </p>
      </header>

      {allProspectAppearances.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-yellow-400 mb-2">Prospect Watch</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {allProspectAppearances.map((p, i) => (
              <ProspectCard key={`${p.mlbId}-${i}`} p={p} />
            ))}
          </div>
        </section>
      )}

      {digests.map((d) => (
        <section key={d.team.id} className="mb-6">
          <h2 className="text-lg font-semibold">{d.team.name}</h2>
          {d.games.length === 0 ? (
            <p className="text-gray-500 text-sm mt-2">No recent completed game found.</p>
          ) : (
            d.games.map((g) => <GameCard key={g.game.gamePk} game={g} />)
          )}
        </section>
      ))}

      <footer className="text-xs text-gray-600 mt-10">
        Data via MLB Stats API. Prospect list is manually maintained in{" "}
        <code>data/prospects.json</code>.
      </footer>
    </main>
  );
}
