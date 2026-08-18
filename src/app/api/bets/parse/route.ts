import { NextResponse } from "next/server";
import { requireCurrentUser, SessionRequiredError } from "@/lib/session";
import { preprocessSlipImage } from "@/lib/image/preprocess";
import { saveSlipImage } from "@/lib/storage/slipStorage";
import { parseBetSlip } from "@/lib/anthropic/parseBetSlip";

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    await requireCurrentUser();
  } catch (err) {
    if (err instanceof SessionRequiredError) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }
    throw err;
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Image is too large (max 15MB)" }, { status: 400 });
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  let processed;
  try {
    processed = await preprocessSlipImage(inputBuffer, file.type || null);
  } catch (err) {
    return NextResponse.json(
      { error: `Could not read that image: ${(err as Error).message}` },
      { status: 400 }
    );
  }

  const slipImagePath = await saveSlipImage(processed.buffer, processed.extension);

  try {
    const extraction = await parseBetSlip(processed.buffer);
    return NextResponse.json({ slipImagePath, extraction });
  } catch (err) {
    // The photo is safely saved even though auto-read failed — the client
    // falls back to a blank, manually-fillable form using this path.
    return NextResponse.json(
      {
        slipImagePath,
        error: `Could not automatically read the slip: ${(err as Error).message}`,
      },
      { status: 422 }
    );
  }
}
