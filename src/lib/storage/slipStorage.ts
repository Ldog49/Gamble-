import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

function storageRoot(): string {
  return process.env.SLIP_STORAGE_PATH ?? "./local-data/slips";
}

/**
 * Saves a preprocessed slip image and returns just the filename (not a full
 * path) — the DB stores this filename, and the storage root (env var) is
 * resolved separately, so moving/reconfiguring storage never breaks old rows.
 */
export async function saveSlipImage(
  buffer: Buffer,
  extension: string
): Promise<string> {
  const root = storageRoot();
  await fs.mkdir(root, { recursive: true });
  const filename = `${crypto.randomUUID()}.${extension}`;
  await fs.writeFile(path.join(root, filename), buffer);
  return filename;
}

export async function readSlipImage(filename: string): Promise<Buffer> {
  const safeName = path.basename(filename); // guard against path traversal
  const root = storageRoot();
  return fs.readFile(path.join(root, safeName));
}
