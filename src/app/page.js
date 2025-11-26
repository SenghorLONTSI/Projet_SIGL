import Image from "next/image";
import Link from "next/link";
import TopNav from "../components/TopNav";
import UploadDashboard from "@/components/dashboard/UploadDashboard";

import { prisma } from "../lib/prisma";
import { getUser, getSession, requireRole } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Format date FR
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

// Récupère les journaux d'un apprenti
async function getApprentiJournals(apprentiId) {
  return prisma.journalAssignment.findMany({
    where: { apprentiId },
    include: { template: true },
    orderBy: { createdAt: "desc" },
  });
}

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await getUser();
  if (!user) redirect("/login");

  // ——————————————————————————————————————————
  // 📌 1) ESPACE APPRENTI
  // ——————————————————————————————————————————
  if (session.user.role === "APPRENTI") {
    requireRole(session, "home:apprenti:view");

    const assignments = await getApprentiJournals(user.id);

    const total = assignments.length;
    const enCours = assignments.filter((a) => a.statut === "EN_COURS").length;
    const enRetard = assignments.filter((a) => a.statut === "EN_RETARD").length;
    const termines = assignments.filter((a) => a.statut === "TERMINE").length;

    const withDeadline = assignments
      .filter((a) => a.template?.deadline)
      .sort(
        (a, b) =>
          new Date(a.template.deadline) - new Date(b.template.deadline)
      );

    const nextDeadline = withDeadline[0] || null;
    const prochains = withDeadline.slice(0, 3);

    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-100 to-sky-50">
        <TopNav />

        <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
          {/* HEADER */}
          <header className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Bonjour {user.firstName || ""} {user.lastName || ""}
            </h1>
            <p className="text-slate-700 text-sm sm:text-base">
              Bienvenue sur votre espace apprenti.
            </p>
          </header>

          {/* 📌 ——— TON UploadDashboard ——— */}
          <UploadDashboard user={user} />

          {/* ——— Cartes de synthèse Journaux ——— */}
          <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white/95 rounded-2xl shadow-sm border border-sky-300 p-4">
              <div className="text-[11px] tracking-wide uppercase text-slate-500">Tous mes journaux</div>
              <div className="mt-2 text-3xl font-bold text-slate-900">{total}</div>
            </div>

            <div className="bg-white/95 rounded-2xl shadow-sm border border-sky-400 p-4">
              <div className="text-[11px] tracking-wide uppercase text-slate-500">En cours</div>
              <div className="mt-2 text-3xl font-bold text-sky-700">{enCours}</div>
            </div>

            <div className="bg-white/95 rounded-2xl shadow-sm border border-rose-300 p-4">
              <div className="text-[11px] tracking-wide uppercase text-slate-500">En retard</div>
              <div className="mt-2 text-3xl font-bold text-rose-600">{enRetard}</div>
            </div>

            <div className="bg-white/95 rounded-2xl shadow-sm border border-emerald-300 p-4">
              <div className="text-[11px] tracking-wide uppercase text-slate-500">Terminés</div>
              <div className="mt-2 text-3xl font-bold text-emerald-600">{termines}</div>
            </div>
          </section>

          {/* Prochaine échéance */}
          <section className="bg-white/95 rounded-3xl shadow-sm border border-sky-100 p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-slate-900">Prochaine échéance</h2>
              <Link href="/journaux" className="text-sm text-blue-700 hover:underline font-medium">
                Voir tous mes journaux →
              </Link>
            </div>

            {!nextDeadline ? (
              <p className="text-sm text-slate-600">Aucune date limite définie.</p>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4">
                <div className="text-sm font-semibold text-slate-900">
                  {nextDeadline.template?.Titre || nextDeadline.template?.code}
                </div>
                <div className="text-xs text-slate-600">
                  À rendre pour le{" "}
                  <span className="font-medium">{formatDate(nextDeadline.template.deadline)}</span>
                </div>
              </div>
            )}
          </section>

          {/* Prochains journaux */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Mes prochains journaux</h2>

            {prochains.length === 0 ? (
              <p className="text-sm text-slate-600">Aucun journal à venir.</p>
            ) : (
              prochains.map((a) => (
                <div
                  key={a.id}
                  className="bg-white/95 rounded-3xl shadow-sm border border-slate-200 px-5 py-4 flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {a.template?.Titre || a.template?.code}
                    </div>
                    <div className="text-xs text-slate-600">
                      À rendre pour{" "}
                      <span className="font-medium">{formatDate(a.template?.deadline)}</span>
                    </div>
                  </div>

                  <Link
                    href={`/journaux/${a.id}`}
                    className="rounded-full bg-blue-600 text-white text-xs font-medium px-4 py-2 hover:bg-blue-700"
                  >
                    Compléter →
                  </Link>
                </div>
              ))
            )}
          </section>
        </div>
      </main>
    );
  }

  // ——————————————————————————————————————————
  // 📌 2) ESPACE MA
  // ——————————————————————————————————————————
  if (session.user.role === "MA") {
    requireRole(session, "home:ma:view");

    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-100 to-sky-50">
        <TopNav />

        <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
          <header>
            <h1 className="text-4xl font-extrabold text-slate-900">
              Bonjour {session.user.name}
            </h1>
            <p className="text-slate-700 text-sm">
              Accédez à la liste de vos apprentis pour consulter leurs journaux.
            </p>
          </header>

          <section className="bg-white/95 rounded-3xl shadow-sm border border-sky-100 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Mes apprentis</h2>
              <Link
                href="/MA/liste_apprentis"
                className="rounded-full bg-blue-600 text-white text-sm font-medium px-5 py-2 hover:bg-blue-700"
              >
                Ouvrir la liste
              </Link>
            </div>
            <p className="text-sm text-slate-600">
              Accédez aux journaux et évaluations de vos apprentis.
            </p>
          </section>
        </div>
      </main>
    );
  }

  // Si autre rôle
  return redirect("/login");
}
