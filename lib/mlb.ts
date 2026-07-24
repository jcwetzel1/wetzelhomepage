import { archiveGame } from "./db";
import type {
  Boxscore,
  BoxscoreTeam,
  GameDigest,
  GameSummary,
  PlayerLine,
  Prospect,
  ProspectAppearance,
  Team,
  TeamDigest,
} from "./types";

export type {
  Boxscore,
  BoxscoreTeam,
  GameDigest,
  GameSummary,
  PlayerLine,
  Prospect,
  ProspectAppearance,
  Team,
  TeamDigest,
};

export const TEAMS: Team[] = [
  { name: "Palm Beach Cardinals", id: 279, sportId: 14 },
  { name: "Peoria Chiefs", id: 443, sportId: 13 },
  { name: "Springfield Cardinals", id: 440, sportId: 12 },
  { name: "Memphis Redbirds", id: 235, sportId: 11 },
];

const API_BASE = "https://statsapi.mlb.com/api/v1";

type ScheduleGame = {
  gamePk: number;
  status: { detailedState: string };
  teams: {
    away: { team: { id: number; name: string }; score?: number; isWinner?: boolean };
    home: { team: { id: number; name: string }; score?: number; isWinner?: boolean };
  };
};

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * MiLB off-days are common, so we look back up to `lookbackDays` for the
 * most recent completed game rather than assuming exactly "yesterday" had one.
 */
export async function getMostRecentGames(
  team: Team,
  lookbackDays = 5
): Promise<GameSummary[]> {
  const end = yesterdayISO();
  const start = new Date();
  start.setDate(start.getDate() - lookbackDays);
  const startISO = start.toISOString().slice(0, 10);

  const url = `${API_BASE}/schedule?teamId=${team.id}&sportId=${team.sportId}&startDate=${startISO}&endDate=${end}&hydrate=team,linescore`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`MLB schedule fetch failed: ${res.status}`);
  const data = await res.json();

  const dates: { date: string; games: ScheduleGame[] }[] = data.dates || [];
  const finalGamesByDate = dates
    .filter((d) => d.games.some((g) => g.status.detailedState === "Final"))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  if (finalGamesByDate.length === 0) return [];

  const mostRecentDate = finalGamesByDate[0];
  return mostRecentDate.games
    .filter((g) => g.status.detailedState === "Final")
    .map((g) => {
      const isHome = g.teams.home.team.id === team.id;
      const mine = isHome ? g.teams.home : g.teams.away;
      const opp = isHome ? g.teams.away : g.teams.home;
      const teamScore = mine.score ?? null;
      const oppScore = opp.score ?? null;
      let result: "W" | "L" | "T" | null = null;
      if (teamScore !== null && oppScore !== null) {
        result = teamScore > oppScore ? "W" : teamScore < oppScore ? "L" : "T";
      }
      return {
        gamePk: g.gamePk,
        date: mostRecentDate.date,
        status: g.status.detailedState,
        opponent: opp.team.name,
        isHome,
        teamScore,
        oppScore,
        result,
      };
    });
}

export async function getBoxscore(gamePk: number): Promise<Boxscore> {
  const res = await fetch(`${API_BASE}/game/${gamePk}/boxscore`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`MLB boxscore fetch failed: ${res.status}`);
  const data = await res.json();

  function extract(sideKey: "away" | "home"): BoxscoreTeam {
    const side = data.teams[sideKey];
    const players = side.players as Record<
      string,
      {
        person: { id: number; fullName: string };
        position: { abbreviation: string };
        stats: { batting?: { summary?: string }; pitching?: { summary?: string } };
      }
    >;

    const batters: PlayerLine[] = (side.batters as number[])
      .map((id) => players[`ID${id}`])
      .filter((p) => p && p.stats.batting?.summary)
      .map((p) => ({
        id: p.person.id,
        name: p.person.fullName,
        position: p.position.abbreviation,
        summary: p.stats.batting!.summary!,
      }));

    const pitchers: PlayerLine[] = (side.pitchers as number[])
      .map((id) => players[`ID${id}`])
      .filter((p) => p && p.stats.pitching?.summary)
      .map((p) => ({
        id: p.person.id,
        name: p.person.fullName,
        position: p.position.abbreviation,
        summary: p.stats.pitching!.summary!,
      }));

    return { teamName: side.team.name, batters, pitchers };
  }

  return {
    gamePk,
    away: extract("away"),
    home: extract("home"),
  };
}

export function matchProspects(
  boxscore: Boxscore,
  prospects: Prospect[]
): ProspectAppearance[] {
  const tracked = prospects.filter((p) => p.mlbId !== null);
  const appearances: ProspectAppearance[] = [];
  for (const side of [boxscore.away, boxscore.home]) {
    for (const prospect of tracked) {
      const batLine = side.batters.find((p) => p.id === prospect.mlbId);
      const pitchLine = side.pitchers.find((p) => p.id === prospect.mlbId);
      if (batLine || pitchLine) {
        appearances.push({
          ...prospect,
          team: side.teamName,
          battingSummary: batLine?.summary,
          pitchingSummary: pitchLine?.summary,
        });
      }
    }
  }
  return appearances;
}

export async function buildDigest(prospects: Prospect[]): Promise<TeamDigest[]> {
  return Promise.all(
    TEAMS.map(async (team): Promise<TeamDigest> => {
      const games = await getMostRecentGames(team);
      const gameDigests = await Promise.all(
        games.map(async (game): Promise<GameDigest> => {
          const boxscore = await getBoxscore(game.gamePk);
          const prospectAppearances = matchProspects(boxscore, prospects);
          await archiveGame({
            gamePk: game.gamePk,
            teamId: team.id,
            teamName: team.name,
            opponent: game.opponent,
            isHome: game.isHome,
            date: game.date,
            teamScore: game.teamScore,
            oppScore: game.oppScore,
            result: game.result,
            boxscore,
            prospectAppearances,
          });
          return { game, boxscore, prospectAppearances };
        })
      );
      return { team, games: gameDigests };
    })
  );
}
