// src/app/calendrier/page.js
import { prisma } from "@/lib/prisma";
import { getSession, getUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import CalendarClient from "./CalendarClient";

export default async function CalendrierPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await getUser();
  if (!user) redirect("/login");

  if (session.user.role !== "APPRENTI") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f5f6fb]">
        <p className="text-lg font-semibold">
          Le calendrier est réservé aux apprentis.
        </p>
      </main>
    );
  }

  const apprenti = await prisma.apprenti.findUnique({
    where: { userId: user.id },
    include: {
      journalAssignments: {
        include: { template: true },
      },
    },
  });

  if (!apprenti) redirect("/login");

  const events = apprenti.journalAssignments.map((j) => {
    const dateSource = j.template?.deadline ?? j.createdAt;
    return {
      id: j.id,
      title: j.template?.Titre || j.template?.code || "Journal",
      statut: j.statut,
      date: dateSource,
    };
  });

  return (
    <main className="min-h-screen bg-[#f5f6fb] text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8">

        {/* 🔙 BOUTON RETOUR */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#5141d6] font-medium hover:underline mb-6"
        >
          ← Retour au tableau de bord
        </Link>

        <h1 className="text-2xl font-bold mb-4">Calendrier de mes journaux</h1>
        <p className="text-sm text-slate-600 mb-6">
          Les journaux apparaissent aux dates de deadline (ou à la date de
          création si aucune deadline n&apos;est définie).
        </p>

        <div className="bg-white rounded-3xl shadow p-4">
          <CalendarClient events={events} />
        </div>
      </div>
    </main>
  );
}
