import { NextResponse } from "next/server";
import { getSession, getUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

  const tp = await prisma.tp.findUnique({
    where: { userId: user.id },
  });

  if (!tp) {
    return NextResponse.json(
      { error: "Vous n'êtes pas enregistré en tant que TP." },
      { status: 403 }
    );
  }

  const apprentis = await prisma.apprenti.findMany({
    where: { idTP: tp.id },
    include: { user: true },
  });

  return NextResponse.json({ apprentis });
}
