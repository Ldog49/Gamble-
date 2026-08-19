import type { Fixture } from "@prisma/client";

function formatKickoff(kickoff: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  }).format(kickoff);
}

function matchStatus(fixture: Fixture): { label: string; live: boolean } {
  const { status, homeScore, awayScore } = fixture;
  const hasScore = homeScore != null && awayScore != null;

  if (status === "FINISHED" && hasScore) {
    return { label: `FT ${homeScore}-${awayScore}`, live: false };
  }
  if ((status === "IN_PLAY" || status === "PAUSED") && hasScore) {
    return { label: `${homeScore}-${awayScore}`, live: true };
  }
  if (status === "POSTPONED") return { label: "Postponed", live: false };
  if (status === "CANCELLED") return { label: "Cancelled", live: false };
  if (status === "SUSPENDED") return { label: "Suspended", live: false };
  return { label: formatKickoff(fixture.kickoff), live: false };
}

export default function GameweekFixtures({ fixtures }: { fixtures: Fixture[] }) {
  if (fixtures.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
        This gameweek&apos;s matches
      </h2>
      <ul className="flex flex-col divide-y divide-border">
        {fixtures.map((fixture) => {
          const status = matchStatus(fixture);
          return (
            <li
              key={fixture.id}
              className="flex items-center justify-between gap-2 py-2 text-sm"
            >
              <span>
                {fixture.homeTeam} <span className="text-muted-foreground">v</span>{" "}
                {fixture.awayTeam}
              </span>
              <span
                className={
                  status.live
                    ? "flex items-center gap-1 font-semibold text-danger"
                    : "text-muted-foreground"
                }
              >
                {status.live && (
                  <span aria-hidden className="size-1.5 rounded-full bg-danger" />
                )}
                {status.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
