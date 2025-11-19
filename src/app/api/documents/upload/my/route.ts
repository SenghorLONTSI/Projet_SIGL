// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { auth } from "@/lib/auth";

// export async function GET(req: Request) {
//   try {
//     // 1️⃣ Récupération de la session BetterAuth
//     const session = await auth.api.getSession({
//       headers: req.headers,
//     });

//     if (!session?.user?.id) {
//       return NextResponse.json(
//         { error: "Utilisateur non authentifié." },
//         { status: 401 }
//       );
//     }

//     const userId = session.user.id;

//     // 2️⃣ Récupérer les documents liés au user
//     const docs = await prisma.document.findMany({
//       where: { userId },
//       orderBy: { createdAt: "desc" }
//     });

//     return NextResponse.json({ documents: docs });
//   } catch (e) {
//     console.error("GET /documents/my error", e);
//     return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
//   }
// }
