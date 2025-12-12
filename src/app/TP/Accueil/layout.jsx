import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";

export default async function TpAccueilLayout({ children }) {
  const session = await getSession();

  // Pas connecté → vers login
  if (!session?.user) {
    redirect("/auth/login");
  }

  // Connecté mais rôle différent de TP → accès interdit
  if (session.user.role !== "TP") {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}
