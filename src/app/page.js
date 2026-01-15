// src/app/page.js
import { prisma } from "@/lib/prisma";
import { getUser, getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await getUser();
  if (!user) redirect("/login");

  if (session.user.role !== "APPRENTI") {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold">
          Espace non disponible pour ce rôle
        </h1>
      </div>
    );
  }

  const apprenti = await prisma.apprenti.findUnique({
    where: { userId: user.id },
    include: {
      user: true,
      journalAssignments: {
        include: { template: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!apprenti) redirect("/login");

  const journaux = apprenti.journalAssignments;
  const total = journaux.length;
  const valides = journaux.filter((j) => j.statut === "TERMINE").length;
  const aTraiter = total - valides;

  return (
    <div className="min-h-screen bg-[#f5f6fb] text-slate-900">
      {/* HEADER PROFIL */}
      <section className="mx-auto max-w-6xl mt-6 rounded-[32px] bg-white shadow overflow-hidden">
        <div className="relative h-24 bg-[#5141d6]">
          <div className="absolute bottom-[-32px] left-6 h-24 w-24 rounded-full bg-[#c9c3ff] border-4 border-white" />
          <div className="absolute right-[-40px] bottom-[-40px] h-40 w-40 rounded-full bg-[#ffcc33]" />
          <div className="absolute right-[30px] bottom-[-30px] h-28 w-28 rounded-full bg-[#ff8a4a]" />
        </div>

        <div className="px-6 pb-6 pt-10 flex justify-between items-center">
          <div className="ml-28 space-y-2">
            <h1 className="text-2xl font-bold">
              {apprenti.name} {apprenti.subName ?? ""}
            </h1>

            <div className="text-sm text-slate-700 space-y-1">
              <div className="flex items-center gap-2">
                <span className="h-7 w-7 flex items-center justify-center rounded-full bg-[#ff8a4a] text-white">
                  📞
                </span>
                <span>+33 0 00 00 00 00</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-7 w-7 flex items-center justify-center rounded-full bg-[#ff8a4a] text-white">
                  ✉️
                </span>
                <span>{apprenti.user.email}</span>
              </div>
            </div>
          </div>

          {/* zone boutons à droite */}
          <div className="flex items-center gap-3 mr-4">
            {/* bouton Calendrier */}
            <Link
              href="/calendrier"
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white/90 border border-[#5141d6]/20 px-4 py-1.5 text-xs font-medium text-[#5141d6] hover:bg-[#f4f2ff] transition"
            >
              <span>📅</span>
              <span>Calendrier</span>
            </Link>

            {/* bouton profil */}
            <Link
              href="/profil"
              className="h-9 w-9 rounded-full text-xl text-[#ff8a4a] hover:bg-[#fff1e6] flex items-center justify-center"
            >
              ✏️
            </Link>
          </div>
        </div>
      </section>

      {/* 3 colonnes */}
      <div className="mx-auto max-w-6xl px-4 py-8 grid gap-4 lg:grid-cols-[1fr,1.6fr,1fr]">
        {/* COLONNE 1 */}
        <div className="space-y-4">
          <div className="rounded-3xl bg-white p-4 shadow">
            <h2 className="text-sm font-semibold mb-2">
              Dernières informations
            </h2>
            <p className="text-xs">
              Vous n&apos;avez aucune conversation non lue.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-4 shadow">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-semibold">Évènements</h2>
              <Link
                href="/entretiens"
                className="text-xs text-[#5141d6] font-medium"
              >
                Voir plus
              </Link>
            </div>
            <p className="text-xs">Aucun évènement.</p>
          </div>
        </div>

        {/* COLONNE 2 : Journaux de bord */}
        <div className="rounded-3xl bg-white p-4 shadow">
          <div className="flex justify-between mb-3">
            <h2 className="text-sm font-semibold">Journaux de bord</h2>
            {/* Voir plus -> page /journaux */}
            <Link
              href="/journaux"
              className="text-xs text-[#5141d6] font-medium"
            >
              Voir plus
            </Link>
          </div>

          <div className="space-y-2">
            {journaux.slice(0, 4).map((j) => (
              <Link
                key={j.id}
                href={`/journal/${j.id}`}
                className="block rounded-2xl bg-[#f4f2ff] p-3 flex justify-between items-start hover:bg-[#e7e2ff] transition"
              >
                <div>
                  <p className="font-medium">
                    {j.template?.Titre ?? j.template?.code ?? "Journal"}
                  </p>
                  <p className="text-xs text-slate-600">
                    {new Date(j.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <span className="text-xs bg-[#e3dcff] text-[#5141d6] px-2 py-1 rounded-full">
                  {j.statut}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* COLONNE 3 : Statuts rapides */}
        <div className="rounded-3xl bg-white p-4 shadow space-y-4">
          <div>
            <h2 className="text-sm font-semibold mb-2">Statuts rapides</h2>
            <div className="grid grid-cols-3 gap-2">
              <Link
                href="/journal"
                className="rounded-xl bg-[#f4f2ff] p-2 text-center hover:bg-[#e7e2ff] transition"
              >
                <p className="text-[11px] text-slate-500">Total</p>
                <p className="text-lg font-bold text-[#5141d6]">{total}</p>
              </Link>

              <Link
                href="/journal"
                className="rounded-xl bg-[#e3f9e7] p-2 text-center hover:bg-[#cff5d8] transition"
              >
                <p className="text-[11px] text-emerald-600">Validé</p>
                <p className="text-lg font-bold text-emerald-700">{valides}</p>
              </Link>

              <Link
                href="/journal"
                className="rounded-xl bg-[#ffe9e3] p-2 text-center hover:bg-[#ffd7c9] transition"
              >
                <p className="text-[11px] text-[#d9480f]">À traiter</p>
                <p className="text-lg font-bold text-[#d9480f]">{aTraiter}</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
