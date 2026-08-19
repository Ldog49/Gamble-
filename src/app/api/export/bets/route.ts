import JSZip from "jszip";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser, SessionRequiredError } from "@/lib/session";
import { computeReturn, computeProfit } from "@/lib/stats/aggregate";
import { toCsv } from "@/lib/export/csv";
import { readSlipImage } from "@/lib/storage/slipStorage";

export async function GET() {
  try {
    await requireCurrentUser();
  } catch (err) {
    if (err instanceof SessionRequiredError) {
      return new Response("Not logged in", { status: 401 });
    }
    throw err;
  }

  const bets = await prisma.bet.findMany({
    include: { user: true, fixture: true },
    orderBy: [{ gameweek: "asc" }, { createdAt: "asc" }],
  });

  const header = [
    "Gameweek",
    "User",
    "HomeTeam",
    "AwayTeam",
    "BetType",
    "Selection",
    "Odds",
    "Stake",
    "PotentialReturn",
    "Status",
    "Return",
    "Profit",
    "HomeScore",
    "AwayScore",
    "FixtureStatus",
    "GradeNote",
    "CreatedAt",
  ];

  const rows = bets.map((bet) => [
    bet.gameweek,
    bet.user.name,
    bet.homeTeam,
    bet.awayTeam,
    bet.betType,
    bet.selection,
    Number(bet.odds),
    Number(bet.stake),
    Number(bet.potentialReturn),
    bet.status,
    computeReturn(bet),
    computeProfit(bet),
    bet.fixture?.homeScore ?? null,
    bet.fixture?.awayScore ?? null,
    bet.fixture?.status ?? null,
    bet.gradeNote,
    bet.createdAt.toISOString(),
  ]);

  const csv = toCsv([header, ...rows]);
  const date = new Date().toISOString().slice(0, 10);

  const zip = new JSZip();
  zip.file("bets.csv", csv);
  const slipsFolder = zip.folder("slips");

  await Promise.all(
    bets.map(async (bet) => {
      try {
        const buffer = await readSlipImage(bet.slipImagePath);
        const ext = bet.slipImagePath.split(".").pop() || "jpg";
        slipsFolder?.file(`gw${bet.gameweek ?? "unknown"}-${bet.user.name}-${bet.id}.${ext}`, buffer);
      } catch {
        // Photo missing from storage — backup is best-effort, skip it.
      }
    })
  );

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

  return new Response(new Uint8Array(zipBuffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="bets-backup-${date}.zip"`,
    },
  });
}
