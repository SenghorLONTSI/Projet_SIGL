import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    // ------------------------------------------------------
    // 1️⃣ Récupérer la session Better-Auth (VERSION CORRECTE)
    // ------------------------------------------------------
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Utilisateur non authentifié." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // ------------------------------------------------------
    // 2️⃣ Vérifier si l'utilisateur est un apprenti
    // ------------------------------------------------------
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { apprenti: true },
    });

    if (!user?.apprenti) {
      return NextResponse.json(
        { error: "Accès refusé : Cette page est uniquement réservé aux apprentis." },
        { status: 403 }
      );
    }

    // ------------------------------------------------------
    // 3️⃣ Lire les données du formulaire
    // ------------------------------------------------------
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const journalSlotId = formData.get("journalSlotId");
    const journalAssignmentId = formData.get("journalAssignmentId");

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier reçu." },
        { status: 400 }
      );
    }

    // ------------------------------------------------------
    // 4️⃣ Stocker le fichier dans /public/documents
    // ------------------------------------------------------
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "documents");
    await mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    const url = `/documents/${fileName}`;

    // ------------------------------------------------------
    // 5️⃣ Enregistrer en base via Prisma
    // ------------------------------------------------------
    const doc = await prisma.document.create({
      data: {
        fileName,
        mimeType: file.type,
        size: file.size,
        url,
        journalSlotId: journalSlotId ? Number(journalSlotId) : null,
        journalAssignmentId: journalAssignmentId ? Number(journalAssignmentId) : null,
      },
    });

    return NextResponse.json({ success: true, document: doc });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
/////////////////////////////Cette fonction GET permet de récupérer les documents liés aux journaux d'apprentissage/////////////////////////////
export async function GET(req: Request) {
  try {
    // ----------------------------------------
    // 1️⃣ Récupérer la session Better-Auth
    // ----------------------------------------
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Utilisateur non authentifié." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // ----------------------------------------
    // 2️⃣ Vérifier que c’est un apprenti
    // ----------------------------------------
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { apprenti: true },
    });

    if (!user?.apprenti) {
      return NextResponse.json(
        { error: "Accès refusé : Réservé aux apprentis." },
        { status: 403 }
      );
    }

    const apprentiId = user.apprenti.id;

    // ----------------------------------------
    // 3️⃣ Récupérer les documents liés
    // ----------------------------------------
    const documents = await prisma.document.findMany({
      where: {
        OR: [
          { journalSlotId: { not: null } },
          { journalAssignmentId: { not: null } },
        ],
      },
      include: {
        slot: true,
        assignment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ documents });

  } catch (error) {
    console.error("GET documents error:", error);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
