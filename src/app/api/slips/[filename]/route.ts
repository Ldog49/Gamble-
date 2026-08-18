import { NextResponse } from "next/server";
import { requireCurrentUser, SessionRequiredError } from "@/lib/session";
import { readSlipImage } from "@/lib/storage/slipStorage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    await requireCurrentUser();
  } catch (err) {
    if (err instanceof SessionRequiredError) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }
    throw err;
  }

  const { filename } = await params;
  try {
    const buffer = await readSlipImage(filename);
    const contentType = filename.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
