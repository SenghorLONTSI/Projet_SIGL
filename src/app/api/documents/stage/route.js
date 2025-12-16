import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";

// 📂 dossier temporaire
const TMP_DIR = path.join(process.cwd(), "public", "uploads", "tmp");

// 🔧 s’assurer que le dossier existe
async function ensureTmpDir() {
  try {
    await fs.mkdir(TMP_DIR, { recursive: true });
  } catch {}
}

/**
 * POST /api/documents/stage
 * ➜ upload TEMPORAIRE (brouillon)
 * ➜ PAS de base de données
 */
export async function POST(req) {
  try {
    await ensureTmpDir();

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { ok: false, error: "Aucun fichier reçu" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name);
    const tempKey = crypto.randomUUID() + ext;
    const filePath = path.join(TMP_DIR, tempKey);

    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      ok: true,
      tempKey,
      tempUrl: `/uploads/tmp/${tempKey}`,
      meta: {
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
      },
    });
  } catch (e) {
    console.error("STAGE POST ERROR:", e);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur (stage upload)" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents/stage
 * ➜ supprime le brouillon (poubelle)
 * ➜ PAS de base de données
 */
export async function DELETE(req) {
  try {
    const body = await req.json();
    const tempKey = body?.tempKey;

    if (!tempKey) {
      return NextResponse.json(
        { ok: false, error: "tempKey manquant" },
        { status: 400 }
      );
    }

    const filePath = path.join(TMP_DIR, tempKey);

    // suppression silencieuse
    await fs.unlink(filePath).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("STAGE DELETE ERROR:", e);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur (stage delete)" },
      { status: 500 }
    );
  }
}
