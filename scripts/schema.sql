-- Run this once against your Vercel Postgres database (Vercel dashboard ->
-- Storage -> your database -> Query, or any Postgres client using the
-- connection string) to set up tables and seed the initial prospect list.
-- Safe to re-run: everything uses IF NOT EXISTS / ON CONFLICT DO NOTHING.

CREATE TABLE IF NOT EXISTS prospects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  mlb_id INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS game_archive (
  game_pk BIGINT PRIMARY KEY,
  team_id INTEGER NOT NULL,
  team_name TEXT NOT NULL,
  opponent TEXT NOT NULL,
  is_home BOOLEAN NOT NULL,
  game_date DATE NOT NULL,
  team_score INTEGER,
  opp_score INTEGER,
  result TEXT,
  boxscore JSONB NOT NULL,
  prospect_appearances JSONB NOT NULL,
  archived_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_game_archive_team_date
  ON game_archive (team_id, game_date DESC);

-- Seeded from C:\Users\jwetzel\Desktop\Top Prospect List.xlsx (53 names),
-- resolved to MLB person IDs against the full Cardinals org roster
-- (MLB, Memphis, Springfield, Peoria, Palm Beach, FCL Cardinals, DSL Cardinals).
INSERT INTO prospects (name, mlb_id) VALUES
  ('JJ Wetherholt', 802139),
  ('Liam Doyle', 824604),
  ('Rainiel Rodriguez', 823787),
  ('Jimmy Crooks', 699625),
  ('Jurrangelo Cijntje', 701388),
  ('Brandon Clarke', 700251),
  ('Joshua Báez', 695491),
  ('Yairo Padilla', 821107),
  ('Leo Bernal', 699024),
  ('Quinn Mathews', 687273),
  ('Tink Hence', 693311),
  ('Tekoah Roby', 694358),
  ('Ryan Mitchell', 815829),
  ('Tai Peete', 806191),
  ('Chen-Wei Lin', 813820),
  ('Ixan Henderson', 809100),
  ('Brycen Mautz', 802408),
  ('Hancel Rincon', 684516),
  ('Pete Hansen', 677337),
  ('Jesús Báez', 800305),
  ('Cooper Hjerpe', 687309),
  ('Sem Robberse', 691828),
  ('Cade Crossland', 827265),
  ('Tanner Franklin', 815119),
  ('Nathan Church', 701675),
  ('Blaze Jordan', 691458),
  ('César Prieto', 693409),
  ('Leonel Sequera', 800320),
  ('Juan Rujano', 829794),
  ('Emanuel Luna', 836587),
  ('Luis Gastelum', 703725),
  ('Austin Love', 676153),
  ('Yhoiker Fajardo', 823369),
  ('Nate Dohm', 702296),
  ('Blake Aita', 820832),
  ('Braden Davis', 801078),
  ('José Davila', 692369),
  ('Skylar Hales', 813766),
  ('Jack Martinez', 822956),
  ('Ethan Young', 831273),
  ('Mason Molina', 695766),
  ('Frank Elissalt', 692284),
  ('Matt Pushard', 690155),
  ('Yordy Herrera', 800277),
  ('Randel Clemente', 695003),
  ('Colton Ledbetter', 807742),
  ('Bryan Torres', 663494),
  ('Jack Gurevitch', 813668),
  ('Won-Bin Cho', 800231),
  ('Chase Davis', 690971),
  ('Carlos Carrión', 837618),
  ('Sebastian Dos Santos', 829741),
  ('Branneli Franco', 815919)
ON CONFLICT (name) DO NOTHING;
