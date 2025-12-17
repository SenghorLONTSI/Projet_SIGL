import { prisma } from "@/lib/prisma";
import { getSession, getUser, requireRole } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import UploadDashboard from "@/components/dashboard/UploadDashboard";

export const dynamic = "force-dynamic";

function formatDate(d) {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeZone: "Europe/Paris",
    }).format(d);
  } catch {
    return d.toString();
  }
}

// ==========================
// PAGE PRINCIPALE
// ==========================
export default async function HomePage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const user = await getUser();
  if (!user) redirect("/login");
  
  console.log("User info:", user.role);
  console.log("Session info:", session.user.role);

  // ==========================
  // APPRENTI
  // ==========================
  if (session.user.role === "APPRENTI") {
    requireRole(session, "home:apprenti:view");

    const assignments = await prisma.journalAssignment.findMany({
      where: { apprentiId: user.id },
      include: { template: true },
      orderBy: { createdAt: "desc" },
    });

    return (
      <main className="min-h-screen bg-slate-100 p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">
            Bonjour {session.user.firstName} {session.user.lastName}
          </h1>
          <p className="text-gray-600">
            Vous pouvez déposer vos document via les liens ci-dessous.
          </p>
        </div>

        {/* 👇 ESPACE DE DEPOT */}
        <UploadDashboard user={session.user} />
      </main>
    );
  }

  // ==========================
  // MA
  // ==========================
  if (session.user.role === "MA") {
    requireRole(session, "home:ma:view");

    return (
      <main className="min-h-screen p-8 bg-slate-100">
        <h1 className="text-2xl font-bold mb-4">
          Bonjour {session.user.firstName} {session.user.lastName}
        </h1>
        <p className="text-gray-600">
          Espace Maître d'apprentissage
        </p>

        <Link
          href="/MA/liste_apprentis"
          className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Voir mes apprentis
        </Link>
      </main>
    );
  }

  // ==========================
  // TP - REDIRECTION VERS LA PAGE DÉDIÉE
  // ==========================
  if (session.user.role === "TP") {
    // On redirige directement vers la page TP au lieu de l'inclure ici
    redirect("/TP/Accueil");
  }

  // ==========================
  // CA
  // ==========================
  if (session.user.role === "CA") {
    requireRole(session, "home:ca:view");

    return (
      <main className="min-h-screen p-8 bg-slate-100">
        <h1 className="text-2xl font-bold">
          Bonjour {session.user.firstName} {session.user.lastName}
        </h1>
        <p className="text-gray-600">
          Espace Coordinateur d'apprentissage
        </p>
      </main>
    );
  }

  // ==========================
  // FALLBACK
  // ==========================
  return (
    <main className="min-h-screen p-8 bg-slate-100">
      <h1 className="text-2xl font-bold">
        Bonjour {session.user.firstName} {session.user.lastName}
      </h1>
      <p className="text-gray-600">
        Rôle non reconnu: {session.user.role}
      </p>
    </main>
  );
}