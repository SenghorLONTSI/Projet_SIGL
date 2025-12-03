// <<<<<<< HEAD
// import Image from "next/image";
// import { getUser, getSession } from "@/lib/auth-server";
// import { redirect } from "next/navigation";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// export default async function Home() {
//   const session = await getSession();
//   if (!session) {
//     redirect("/login");
//   }

//   const user = await getUser();
//   if (!user) {
//     redirect("/login");
//   }
// =======
// src/app/page.js
import { prisma } from "../lib/prisma";
import { requireApprenti } from "../lib/auth";
import { getUser, getSession, requireRole } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import TopNav from "../components/TopNav";

export const dynamic = "force-dynamic";

function getInitials(name = "", subName = "") {
  const parts = `${name} ${subName}`.trim().split(" ");
  return parts
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

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

// ---------------------- APPRENTI ----------------------

// Récupère les journaux de l'apprenti connecté
async function getApprentiJournals(apprentiId) {
  return prisma.journalAssignment.findMany({
    where: { apprentiId },
    include: {
      template: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

// ------------------------- MA -------------------------

// Récupère les infos du MA + ses apprentis + activités récentes
async function getMaDashboardData(userId) {
  const ma = await prisma.ma.findUnique({
    where: { userId },
    include: {
      user: true,
      apprenti: {
        include: {
          user: true,
          journalAssignments: {
            include: { template: true },
          },
        },
      },
    },
  });

  if (!ma) {
    return { ma: null, apprentices: [], notifications: [] };
  }

  const apprentices = ma.apprenti.map((a) => ({
    id: a.id,
    name: a.user.name,
    subName: a.user.subName,
    email: a.user.email,
  }));

  const notifications = ma.apprenti
    .flatMap((a) =>
      a.journalAssignments.map((assign) => ({
        id: assign.id,
        apprentiName: a.user.name,
        templateTitle:
          assign.template?.Titre || assign.template?.code || "Journal",
        statut: assign.statut,
        createdAt: assign.createdAt,
      }))
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5); // par exemple : les 5 dernières activités

  return { ma, apprentices, notifications };
}

// --------------------- HOME PAGE ----------------------

export default async function HomePage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  // ---------- ESPACE APPRENTI ----------
  if (session?.user?.role === "APPRENTI") {
    requireRole(session, "home:apprenti:view");
    try {
      // rien ici, ton try/catch juste pour sécurité
    } catch {
      return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 via-sky-100 to-sky-50">
          <div className="bg-white/90 rounded-3xl shadow-lg px-8 py-6 text-center space-y-3 border border-sky-100">
            <h1 className="text-2xl font-semibold text-slate-900">
              Bienvenue
            </h1>
            <p className="text-slate-600">
              Vous devez être connecté en tant qu&apos;apprenti pour accéder à
              votre espace.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-1 rounded-full bg-blue-600 text-white text-sm font-medium px-5 py-2.5 hover:bg-blue-700 transition shadow-sm"
            >
              Se connecter
            </Link>
          </div>
        </main>
      );
    }

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

        <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
          {/* Header : bienvenue */}
          <header className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Bonjour {user.firstName || ""} {user.lastName || ""}
            </h1>
            <p className="text-slate-700 text-sm sm:text-base">
              Bienvenue sur votre espace apprenti. Retrouvez ici une synthèse de
              vos journaux.
            </p>
          </header>

          {/* Cartes de synthèse */}
          <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white/95 rounded-2xl shadow-sm border border-sky-300 p-4">
              <div className="text-[11px] tracking-wide uppercase text-slate-500">
                Tous mes journaux
              </div>
              <div className="mt-2 text-3xl font-bold text-slate-900">
                {total}
              </div>
            </div>
            <div className="bg-white/95 rounded-2xl shadow-sm border border-sky-400 p-4">
              <div className="text-[11px] tracking-wide uppercase text-slate-500">
                En cours
              </div>
              <div className="mt-2 text-3xl font-bold text-sky-700">
                {enCours}
              </div>
            </div>
            <div className="bg-white/95 rounded-2xl shadow-sm border border-rose-300 p-4">
              <div className="text-[11px] tracking-wide uppercase text-slate-500">
                En retard
              </div>
              <div className="mt-2 text-3xl font-bold text-rose-600">
                {enRetard}
              </div>
            </div>
            <div className="bg-white/95 rounded-2xl shadow-sm border border-emerald-300 p-4">
              <div className="text-[11px] tracking-wide uppercase text-slate-500">
                Terminés
              </div>
              <div className="mt-2 text-3xl font-bold text-emerald-600">
                {termines}
              </div>
            </div>
          </section>

          {/* Prochaine échéance */}
          <section className="bg-white/95 rounded-3xl shadow-sm border border-sky-100 p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-slate-900">
                Prochaine échéance
              </h2>
              <Link
                href="/journaux"
                className="text-sm text-blue-700 hover:underline font-medium"
              >
                Voir tous mes journaux →
              </Link>
            </div>

            {!nextDeadline && (
              <p className="text-sm text-slate-600">
                Vous n&apos;avez pas encore de journal avec une date limite
                configurée.
              </p>
            )}

            {nextDeadline && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4 space-y-1">
                <div className="text-sm font-semibold text-slate-900">
                  {nextDeadline.template?.Titre ||
                    nextDeadline.template?.code ||
                    "Journal"}
                </div>
                <div className="text-xs text-slate-600">
                  À rendre pour le{" "}
                  <span className="font-medium">
                    {formatDate(nextDeadline.template.deadline)}
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  Statut :{" "}
                  <span className="uppercase tracking-wide font-medium">
                    {nextDeadline.statut.replace("_", " ")}
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* Prochains journaux */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">
              Mes prochains journaux
            </h2>

            {prochains.length === 0 && (
              <p className="text-sm text-slate-600">
                Aucun journal à venir pour le moment.
              </p>
            )}

            {prochains.length > 0 && (
              <div className="space-y-3">
                {prochains.map((a) => (
                  <div
                    key={a.id}
                    className="bg-white/95 rounded-3xl shadow-sm border border-slate-200 px-5 py-4 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-slate-900">
                        {a.template?.Titre || a.template?.code || "Journal"}
                      </div>
                      <div className="text-xs text-slate-600">
                        À rendre pour le{" "}
                        <span className="font-medium">
                          {formatDate(a.template?.deadline)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600">
                        Période : {a.template?.periode || "—"}
                      </div>
                    </div>

                    <Link
                      href={`/journaux/${a.id}`}
                      className="inline-flex items-center gap-1 rounded-full bg-blue-600 text-white text-xs font-medium px-4 py-2.5 hover:bg-blue-700 transition shadow-sm"
                    >
                      Compléter
                      <span aria-hidden>→</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    );
  }

// ---------- ESPACE MA ----------
if (session?.user?.role === "MA") {
  requireRole(session, "home:ma:view");

  const { ma, apprentices, notifications } = await getMaDashboardData(user.id);

  if (!ma) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 via-sky-100 to-sky-50">
        <TopNav />
        <p className="mt-10 text-slate-700">
          Vous êtes connecté en tant que MA, mais aucun enregistrement MA n'est lié à ce compte.
        </p>
      </main>
    );
  }

  const fullName = `${ma.user.name ?? ""} ${ma.user.subName ?? ""}`.trim()
    || session?.user?.name;

  return (
    <main className="min-h-screen bg-slate-50">
      <TopNav />

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* HEADER */}
        <header className="flex items-center gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Bonjour {fullName}
            </h1>
            <p className="text-slate-700 text-sm sm:text-base mt-1">
              Espace MA. Consultez vos apprentis et le suivi de leurs journaux.
            </p>
          </div>
        </header>

        {/* CARTE PROFIL MA */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg">
          <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-indigo-400/40" />
          <div className="absolute -right-16 -bottom-10 h-40 w-40 rounded-full bg-amber-300/80" />

          <div className="relative px-8 py-7 flex items-center justify-between gap-8">
            <div className="flex items-center gap-5">
              {/* ⬅️ On remet le rond “plein” d’origine, SANS texte */}
              <div className="h-16 w-16 rounded-full bg-indigo-200 border-4 border-white/40" />
              <div>
                <h2 className="text-2xl font-semibold">{fullName}</h2>
                <p className="text-sm text-indigo-100">MA</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-8 text-sm">
              <div>
                <div className="text-indigo-100/80">Email</div>
                <div className="font-medium">{ma.user.email}</div>
              </div>
            </div>
          </div>
        </section>


        {/* 2 COLONNES */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Apprentis */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Mes apprentis</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {apprentices.length} apprenti(s) rattaché(s)
                </p>
              </div>
              <Link
                href="/MA/liste_apprentis"
                className="inline-flex items-center gap-1 rounded-full bg-blue-600 text-white text-xs font-medium px-4 py-2.5 hover:bg-blue-700 transition shadow-sm"
              >
                +
              </Link>
            </div>
            <ul className="space-y-2">
              {apprentices.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-2xl px-3 py-2.5 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    {/* Initiales */}
                    <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 
                      flex items-center justify-center text-xs font-semibold">
                      {getInitials(a.name, a.subName)}
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {a.name} {a.subName}
                      </div>
                      <div className="text-xs text-slate-500">{a.email}</div>
                    </div>
                  </div>

                  <Link
                    href={`/journal/ma/${a.id}`}
                    className="text-xs text-blue-700 hover:underline"
                  >
                    Voir les journaux
                  </Link>
                </li>
              ))}

              {apprentices.length === 0 && (
                <li className="text-sm text-slate-500">
                  Aucun apprenti rattaché pour le moment.
                </li>
              )}
            </ul>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h3 className="text-base font-semibold text-slate-900">Notifications</h3>
            <ul className="space-y-3">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className="flex items-center justify-between rounded-2xl px-3 py-2.5 bg-slate-50"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-900">
                      {n.apprentiName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {n.templateTitle} — {n.statut.replace("_", " ")}
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {formatDate(n.createdAt)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}


  //redirect("/login");
}
