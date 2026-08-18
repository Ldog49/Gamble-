import { NextResponse } from "next/server";
import { requireCurrentUser, SessionRequiredError } from "@/lib/session";
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

  const result = await gradeAllPendingBets();
  return NextResponse.json(result);
}
