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

    // ✅ IMPORTANT : ton front envoie fileName/mimeType/size au niveau root,
    // pas dans body.meta. Donc on reconstruit meta ici :
    const meta = {
      fileName: body?.fileName,
      mimeType: body?.mimeType,
      size: body?.size,
    };

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

    // Si déjà soumis -> on renvoie le doc existant + on force TERMINE
    const existing = await prisma.document.findFirst({
      where: { journalAssignmentId },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      // ✅ Assure que le statut est bien TERMINE
      await prisma.journalAssignment.update({
        where: { id: journalAssignmentId },
        data: { statut: "TERMINE" },
      });

      return NextResponse.json({
        ok: true,
        document: existing,
        alreadySubmitted: true,
      });
    }

    // Lire le fichier tmp
    const tmpPath = path.join(TMP_DIR, tempKey);
    const buffer = await fs.readFile(tmpPath);

    // Conserver le vrai nom (pour affichage)
    const originalName = safeName(meta.fileName || "document");

    // ✅ Nom stocké (fichier physique) = unique pour éviter collisions
    const ext = path.extname(originalName) || path.extname(tempKey) || "";
    const storedName = `${crypto.randomUUID()}${ext}`;
    const finalPath = path.join(FINAL_DIR, storedName);

    await fs.writeFile(finalPath, buffer);

    const url = `/uploads/documents/${storedName}`;

    // Création en base du Document
    const created = await prisma.document.create({
      data: {
        journalAssignmentId,
        fileName: originalName, // ✅ nom réel affiché
        mimeType: meta.mimeType || "application/octet-stream",
        size: Number(meta.size) || buffer.length,
        url,
        status: "UPLOADED",
      },
    });

    // ✅ STATUT AUTO : soumis => TERMINE
    await prisma.journalAssignment.update({
      where: { id: journalAssignmentId },
      data: { statut: "TERMINE" },
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
