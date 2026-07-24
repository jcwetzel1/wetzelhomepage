export type Team = {
  name: string;
  id: number;
  sportId: number;
};

export type GameSummary = {
  gamePk: number;
  date: string;
  status: string;
  opponent: string;
  isHome: boolean;
  teamScore: number | null;
  oppScore: number | null;
  result: "W" | "L" | "T" | null;
};

export type PlayerLine = {
  id: number;
  name: string;
  position: string;
  summary: string;
};

export type BoxscoreTeam = {
  teamName: string;
  batters: PlayerLine[];
  pitchers: PlayerLine[];
};

export type Boxscore = {
  gamePk: number;
  away: BoxscoreTeam;
  home: BoxscoreTeam;
};

export type Prospect = {
  id: number;
  name: string;
  mlbId: number | null;
};

export type ProspectAppearance = Prospect & {
  team: string;
  battingSummary?: string;
  pitchingSummary?: string;
};

export type GameDigest = {
  game: GameSummary;
  boxscore: Boxscore;
  prospectAppearances: ProspectAppearance[];
};

export type TeamDigest = {
  team: Team;
  games: GameDigest[];
};
