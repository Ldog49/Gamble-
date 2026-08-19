import { NextResponse } from "next/server";
import { requireCurrentUser, SessionRequiredError } from "@/lib/session";
import { syncFixtures } from "@/lib/footballData/syncFixtures";
import { gradeAllPendingBets } from "@/lib/grading/gradeAll";

function hasValidSyncSecret(request: Request): boolean {
  const secret = process.env.SYNC_SECRET;
  if (!secret) return false;
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  // Allow either a logged-in user (the "Sync results" button) or a shared
  // secret (the scheduled GitHub Actions job) to trigger a sync.
  if (!hasValidSyncSecret(request)) {
    try {
      await requireCurrentUser();
    } catch (err) {
      if (err instanceof SessionRequiredError) {
        return NextResponse.json({ error: "Not logged in" }, { status: 401 });
      }
      throw err;
    }
  }

  try {
    const { fixturesUpdated } = await syncFixtures();
    const { betsGraded, betsNeedingReview } = await gradeAllPendingBets();
    return NextResponse.json({ fixturesUpdated, betsGraded, betsNeedingReview });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
