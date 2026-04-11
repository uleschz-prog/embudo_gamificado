import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/** Subidas largas (videos grandes) */
export const maxDuration = 300;

const MAX_BYTES = 150 * 1024 * 1024;

const ALLOWED_EXT = new Set([
  ".mp4",
  ".webm",
  ".mov",
  ".m4v",
  ".mkv",
  ".avi",
]);

function safeExtension(fileName: string, mime: string): string {
  const ext = path.extname(fileName || "").toLowerCase();
  if (ext && ALLOWED_EXT.has(ext)) return ext;
  if (mime.includes("webm")) return ".webm";
  if (mime.includes("quicktime") || mime.includes("mov")) return ".mov";
  return ".mp4";
}

export async function POST(request: NextRequest) {
  const secret = process.env.UPLOAD_SECRET;
  if (secret) {
    const sent = request.headers.get("x-upload-secret");
    if (sent !== secret) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "No se pudo leer el formulario" },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo (campo file)" }, { status: 400 });
  }

  if (!file.type.startsWith("video/")) {
    return NextResponse.json({ error: "Solo se permiten videos" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "El archivo supera el máximo permitido (150 MB)" },
      { status: 413 },
    );
  }

  const ext = safeExtension(file.name, file.type);
  const name = `${randomUUID()}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "funnel");
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, name), buffer);

  const url = `/uploads/funnel/${name}`;
  return NextResponse.json({ url });
}
