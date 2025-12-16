import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// dossier final (public)
const FINAL_DIR = path.join(process.cwd(), "public", "uploads", "documents");

// petit nettoyage du nom (évite ../ etc.)
function safeName(name = "document") {
  return name
    .replaceAll("\\", "_")
    .replaceAll("/", "_")
    .replace(/[<>:"|?*\x00-\x1F]/g, "_")
    .slice(0, 180);
}

async function ensureFinalDir() {
  try {
    await fs.mkdir(FINAL_DIR, { recursive: true });
  } catch {}
}

/**
 * POST /api/documents/upload
 * - reçoit: file, journalAssignmentId (optionnel), journalSlotId (optionnel)
 * - enregistre fichier sur disque avec uuid
 * - crée Document en DB avec fileName = NOM ORIGINAL
 */
export async function POST(req) {
  try {
    await ensureFinalDir();

    const formData = await req.formData();
    const file = formData.get("file");

    const journalAssignmentId = formData.get("journalAssignmentId");
    const journalSlotId = formData.get("journalSlotId");

    if (!file) {
      return NextResponse.json({ ok: false, error: "Aucun fichier reçu" }, { status: 400 });
    }

    // --- nom original (celui que tu veux afficher)
    const originalName = safeName(file.name || "document");
    const mimeType = file.type || "application/octet-stream";
    const size = file.size ?? 0;

    // --- nom technique sur disque
    const ext = path.extname(originalName) || "";
    const storedName = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(FINAL_DIR, storedName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const url = `/uploads/documents/${storedName}`;

    const created = await prisma.document.create({
      data: {
        journalAssignmentId: journalAssignmentId ? Number(journalAssignmentId) : null,
        journalSlotId: journalSlotId ? Number(journalSlotId) : null,
        fileName: originalName,          // ✅ IMPORTANT: nom réel
        mimeType,
        size,
        url,                             // ✅ chemin du fichier stocké (uuid)
        status: "UPLOADED",
      },
    });

    return NextResponse.json({ ok: true, document: created });
  } catch (e) {
    console.error("UPLOAD FINAL ERROR:", e);
    return NextResponse.json({ ok: false, error: "Erreur serveur (upload final)" }, { status: 500 });
  }
}
