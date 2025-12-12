import { getSession } from "@/lib/auth-server";

export async function GET() {
  const session = await getSession();

  if (!session?.user) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  return Response.json({ user: session.user });
}
