import { NextResponse } from "next/server";
import { requireCurrentUser, SessionRequiredError } from "@/lib/session";
import { syncFixtures } from "@/lib/footballData/syncFixtures";
import { gradeAllPendingBets } from "@/lib/grading/gradeAll";

export async function POST() {
  try {
    await requireCurrentUser();
  } catch (err) {
    if (err instanceof SessionRequiredError) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }
    throw err;
  }

  try {
    const { fixturesUpdated } = await syncFixtures();
    const { betsGraded, betsNeedingReview } = await gradeAllPendingBets();
    return NextResponse.json({ fixturesUpdated, betsGraded, betsNeedingReview });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
