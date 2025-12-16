import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { requireApprenti } from "@/lib/auth";

export const runtime = "nodejs";

const TMP_DIR = path.join(process.cwd(), "public", "uploads", "tmp");
const FINAL_DIR = path.join(process.cwd(), "public", "uploads", "documents");

async function ensureFinalDir() {
  try {
    await fs.mkdir(FINAL_DIR, { recursive: true });
  } catch {}
}

function safeName(name = "document") {
  return name
    .replaceAll("\\", "_")
    .replaceAll("/", "_")
    .replace(/[<>:"|?*\x00-\x1F]/g, "_")
    .slice(0, 180);
}

export async function POST(req) {
  try {
    await requireApprenti();
    await ensureFinalDir();

    const body = await req.json();
    const journalAssignmentId = Number(body?.journalAssignmentId);
    const tempKey = body?.tempKey;
    const meta = body?.meta || {};

    if (!journalAssignmentId || Number.isNaN(journalAssignmentId)) {
      return NextResponse.json(
        { ok: false, error: "journalAssignmentId manquant" },
        { status: 400 }
      );
    }
    if (!tempKey) {
      return NextResponse.json(
        { ok: false, error: "tempKey manquant" },
        { status: 400 }
      );
    }

    // Si déjà soumis -> on bloque
    const existing = await prisma.document.findFirst({
      where: { journalAssignmentId },
      orderBy: { createdAt: "desc" },
    });
    if (existing) {
      return NextResponse.json({
        ok: true,
        document: existing,
        alreadySubmitted: true,
      });
    }

    // Lire le fichier tmp
    const tmpPath = path.join(TMP_DIR, tempKey);
    const buffer = await fs.readFile(tmpPath);

    // Conserver le vrai nom
    const originalName = safeName(meta.fileName || "document");
    const ext = path.extname(originalName) || path.extname(tempKey) || "";
    const storedName = `${crypto.randomUUID()}${ext}`;
    const finalPath = path.join(FINAL_DIR, storedName);

    await fs.writeFile(finalPath, buffer);

    const url = `/uploads/documents/${storedName}`;

    const created = await prisma.document.create({
      data: {
        journalAssignmentId,
        fileName: originalName,          // ✅ vrai nom
        mimeType: meta.mimeType || "application/octet-stream",
        size: meta.size || buffer.length,
        url,                             // ✅ url fichier stocké
        status: "UPLOADED",
      },
    });

    // Supprimer le brouillon tmp
    await fs.unlink(tmpPath).catch(() => {});

    return NextResponse.json({ ok: true, document: created });
  } catch (e) {
    console.error("SUBMIT ERROR:", e);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur (submit)" },
      { status: 500 }
    );
  }
}
