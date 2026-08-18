import { NextResponse } from "next/server";
import { requireCurrentUser, SessionRequiredError } from "@/lib/session";
import { regradeBetById } from "@/lib/grading/gradeAll";
import { toBetDTO } from "@/lib/serialize";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireCurrentUser();
  } catch (err) {
    if (err instanceof SessionRequiredError) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }
    throw err;
  }

  const { id } = await params;
  const bet = await regradeBetById(id);
  if (!bet) {
    return NextResponse.json({ error: "Bet not found" }, { status: 404 });
  }
  return NextResponse.json(toBetDTO(bet));
}
