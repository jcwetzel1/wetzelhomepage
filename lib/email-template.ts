import type { TeamDigest } from "./mlb";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function renderDigestEmail(digests: TeamDigest[]): { subject: string; html: string } {
  const allProspectAppearances = digests.flatMap((d) =>
    d.games.flatMap((g) => g.prospectAppearances)
  );

  const prospectSection = allProspectAppearances.length
    ? `
    <h2 style="font-size:16px;color:#b45309;margin:24px 0 8px;">Prospect Watch</h2>
    ${allProspectAppearances
      .map(
        (p) => `
      <div style="border:1px solid #fcd34d;border-radius:8px;padding:10px 12px;margin-bottom:8px;">
        <div style="font-weight:600;color:#b45309;">${esc(p.name)} <span style="font-weight:400;color:#6b7280;font-size:12px;">(${esc(
          p.team
        )})</span></div>
        ${p.battingSummary ? `<div style="font-size:14px;">${esc(p.battingSummary)}</div>` : ""}
        ${p.pitchingSummary ? `<div style="font-size:14px;">${esc(p.pitchingSummary)}</div>` : ""}
      </div>`
      )
      .join("")}
  `
    : "";

  const teamSections = digests
    .map((d) => {
      if (d.games.length === 0) {
        return `
        <h2 style="font-size:16px;margin:24px 0 4px;">${esc(d.team.name)}</h2>
        <p style="color:#6b7280;font-size:13px;margin:0;">No recent completed game found.</p>`;
      }
      const games = d.games
        .map((gd) => {
          const g = gd.game;
          const line = `${g.isHome ? "vs" : "@"} ${esc(g.opponent)} &middot; ${g.date} &mdash; ${g.teamScore}-${g.oppScore} (${g.result ?? ""})`;
          const rows = [gd.boxscore.away, gd.boxscore.home]
            .map(
              (side) => `
            <div style="margin-top:6px;">
              <div style="font-size:12px;color:#6b7280;font-weight:600;">${esc(side.teamName)}</div>
              ${[...side.batters, ...side.pitchers]
                .map(
                  (p) => `
                <div style="display:flex;justify-content:space-between;font-size:13px;padding:2px 0;">
                  <span>${esc(p.name)}</span>
                  <span style="font-family:monospace;color:#374151;">${esc(p.summary)}</span>
                </div>`
                )
                .join("")}
            </div>`
            )
            .join("");
          return `
          <div style="border:1px solid #e5e7eb;border-radius:8px;padding:10px 12px;margin-top:8px;">
            <div style="font-size:13px;color:#374151;">${line}</div>
            ${rows}
          </div>`;
        })
        .join("");
      return `<h2 style="font-size:16px;margin:24px 0 4px;">${esc(d.team.name)}</h2>${games}`;
    })
    .join("");

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#111827;max-width:600px;margin:0 auto;">
    <h1 style="font-size:20px;margin-bottom:4px;">Cardinals Farm System — Daily Digest</h1>
    <p style="color:#6b7280;font-size:13px;margin-top:0;">${new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })}</p>
    ${prospectSection}
    ${teamSections}
  </div>`;

  return { subject: "Cardinals Farm System — Daily Digest", html };
}
