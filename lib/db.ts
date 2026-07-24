import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import type { Boxscore, Prospect, ProspectAppearance } from "./types";

export type { Prospect };

let cached: NeonQueryFunction<false, false> | null = null;

function sql(strings: TemplateStringsArray, ...values: unknown[]) {
  if (!cached) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is not set. Add it to .env.local (see .env.local.example)."
      );
    }
    cached = neon(process.env.DATABASE_URL);
  }
  return cached(strings, ...values);
}

export async function getProspects(): Promise<Prospect[]> {
  const rows = (await sql`
    SELECT id, name, mlb_id FROM prospects ORDER BY name ASC
  `) as { id: number; name: string; mlb_id: number | null }[];
  return rows.map((r) => ({ id: r.id, name: r.name, mlbId: r.mlb_id }));
}

export async function addProspect(name: string): Promise<void> {
  await sql`
    INSERT INTO prospects (name) VALUES (${name})
    ON CONFLICT (name) DO NOTHING
  `;
}

export async function removeProspect(id: number): Promise<void> {
  await sql`DELETE FROM prospects WHERE id = ${id}`;
}

export async function updateProspectMlbId(id: number, mlbId: number | null): Promise<void> {
  await sql`UPDATE prospects SET mlb_id = ${mlbId} WHERE id = ${id}`;
}

export type ArchivedGameRow = {
  gamePk: number;
  teamId: number;
  teamName: string;
  opponent: string;
  isHome: boolean;
  date: string;
  teamScore: number | null;
  oppScore: number | null;
  result: "W" | "L" | "T" | null;
  boxscore: Boxscore;
  prospectAppearances: ProspectAppearance[];
};

export async function archiveGame(row: ArchivedGameRow): Promise<void> {
  await sql`
    INSERT INTO game_archive (
      game_pk, team_id, team_name, opponent, is_home, game_date,
      team_score, opp_score, result, boxscore, prospect_appearances
    ) VALUES (
      ${row.gamePk}, ${row.teamId}, ${row.teamName}, ${row.opponent}, ${row.isHome}, ${row.date},
      ${row.teamScore}, ${row.oppScore}, ${row.result},
      ${JSON.stringify(row.boxscore)}, ${JSON.stringify(row.prospectAppearances)}
    )
    ON CONFLICT (game_pk) DO NOTHING
  `;
}

type ArchivedGameDbRow = {
  game_pk: string | number;
  team_id: number;
  team_name: string;
  opponent: string;
  is_home: boolean;
  game_date: string | Date;
  team_score: number | null;
  opp_score: number | null;
  result: "W" | "L" | "T" | null;
  boxscore: Boxscore;
  prospect_appearances: ProspectAppearance[];
};

export async function getArchivedGames(
  teamId: number,
  limit = 10
): Promise<ArchivedGameRow[]> {
  const rows = (await sql`
    SELECT game_pk, team_id, team_name, opponent, is_home, game_date,
           team_score, opp_score, result, boxscore, prospect_appearances
    FROM game_archive
    WHERE team_id = ${teamId}
    ORDER BY game_date DESC, game_pk DESC
    LIMIT ${limit}
  `) as ArchivedGameDbRow[];
  return rows.map((r) => ({
    gamePk: Number(r.game_pk),
    teamId: r.team_id,
    teamName: r.team_name,
    opponent: r.opponent,
    isHome: r.is_home,
    date: r.game_date instanceof Date ? r.game_date.toISOString().slice(0, 10) : r.game_date,
    teamScore: r.team_score,
    oppScore: r.opp_score,
    result: r.result,
    boxscore: r.boxscore,
    prospectAppearances: r.prospect_appearances,
  }));
}
