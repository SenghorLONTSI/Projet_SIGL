import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export type ApprentiAuth = { userId: number; apprentiId: number; role: "APPRENTI" | "ADMIN" | "USER" | "MA" | "TP" | "CA" | "RH" };

export async function requireApprenti(): Promise<ApprentiAuth> {
  // Simple lecture d'un token "session" (ou header Authorization Bearer)
  const token = cookies().get("session")?.value;
  if (!token) throw new Error("UNAUTHENTICATED");

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) throw new Error("UNAUTHENTICATED");

  const user = session.user;
  if (user.role !== "APPRENTI") throw new Error("FORBIDDEN");

  const apprenti = await prisma.apprenti.findUnique({ where: { userId: user.id } });
  if (!apprenti) throw new Error("APPRENTI_NOT_FOUND");

  return { userId: user.id, apprentiId: apprenti.id, role: user.role as any };
}
