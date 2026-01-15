import { prisma } from "@/lib/prisma";
import { requireApprenti } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EntretienDetailPage({ params }) {
  try {
    await requireApprenti();
  } catch {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Accès refusé.</p>
      </main>
    );
  }

  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return <p>ID invalide</p>;
  }

  const entretien = await prisma.entretien?.findUnique({
    where: { id },
  });

  if (!entretien) {
    return <p>Entretien introuvable</p>;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/entretiens"
          className="text-sm text-slate-700 hover:underline"
        >
          ← Retour aux entretiens
        </Link>

        <section className="bg-white p-6 rounded-2xl shadow space-y-3">
          <h1 className="text-xl font-bold">
            Entretien
          </h1>

          <p className="text-sm text-slate-700">
            <b>Date :</b>{" "}
            {new Date(entretien.date).toLocaleDateString("fr-FR")}
            <br />
            <b>Heure :</b> {entretien.heure}
            <br />
            <b>Thème :</b> {entretien.theme || "—"}
            <br />
            <b>Statut :</b>{" "}
            {entretien.statut === "TERMINE" ? "TERMINÉ" : "À FAIRE"}
          </p>
        </section>
      </div>
    </main>
  );
}
