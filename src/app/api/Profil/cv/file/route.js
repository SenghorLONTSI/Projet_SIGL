import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-server";

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const apprenti = await prisma.apprenti.findUnique({
    where: { userId: user.id },
  });

  if (!apprenti || !apprenti.cvUrl) {
    return NextResponse.json({ error: "Aucun CV trouvé" }, { status: 404 });
  }

  // cvUrl est de type "data:application/pdf;base64,AAAA..."
  const dataUrl = apprenti.cvUrl;
  const parts = dataUrl.split(",");
  if (parts.length !== 2) {
    return NextResponse.json({ error: "CV invalide" }, { status: 500 });
  }

  const base64 = parts[1];
  const buffer = Buffer.from(base64, "base64");

  const fileName = apprenti.cvName || "cv.pdf";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${fileName}"`,
    },
  });
}
