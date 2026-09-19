import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { storage } from "@/lib/storage";

type Params = { params: Promise<{ id: string }> };

/** GET /api/verification/documents/[id] — stream a document to its owner or an admin. */
export async function GET(_req: Request, { params }: Params) {
  const auth = await requireRole("CLIENT", "TALENT", "ADMIN");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc || doc.deletedAt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (auth.role !== "ADMIN" && doc.userId !== auth.userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const blob = await storage.get(doc.storageKey);
  if (!blob) return NextResponse.json({ error: "File is no longer available" }, { status: 410 });

  return new Response(new Uint8Array(blob.data), {
    headers: {
      "Content-Type": blob.mimeType,
      "Content-Length": String(blob.data.byteLength),
      "Content-Disposition": `inline; filename="${doc.type.toLowerCase()}-${doc.id.slice(0, 8)}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

/** DELETE /api/verification/documents/[id] — owner removes an upload that hasn't been submitted yet. */
export async function DELETE(_req: Request, { params }: Params) {
  const auth = await requireRole("CLIENT", "TALENT");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc || doc.userId !== auth.userId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (doc.verificationRequestId) return NextResponse.json({ error: "This document is part of a submitted request" }, { status: 409 });

  await storage.delete(doc.storageKey);
  await prisma.document.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
