import { NextResponse } from "next/server";
import { getSession, getUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // Vérifier la session
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Non authentifié" },
      { status: 401 }
    );
  }

  const user = await getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Utilisateur introuvable" },
      { status: 401 }
    );
  }

  // Récupérer le MA associé à l'utilisateur
  const ma = await prisma.ma.findUnique({
    where: { userId: user.id },
  });

  if (!ma) {
    return NextResponse.json(
      { error: "Vous n'êtes pas enregistré en tant que MA." },
      { status: 403 }
    );
  }

  // Récupérer les apprentis rattachés à ce MA
  const apprentis = await prisma.apprenti.findMany({
    where: { idMA: ma.id },
    include: { user: true },
  });

  return NextResponse.json({ apprentis });
}
