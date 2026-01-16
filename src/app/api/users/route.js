//TODO: implemente l'api pour recuperer tous les utilisateurs

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    const select = {
      id: true,
      name: true,
      subName: true,
      email: true,
      role: true,
    };

    if (role === "APPRENTI") {
      select.apprenti = {
        select: {
          idMA: true,
          idTP: true,
        },
      };
    }

    const users = await prisma.user.findMany({
      where: role ? { role } : undefined,
      select,
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Erreur lors de la recuperation des utilisateurs:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
