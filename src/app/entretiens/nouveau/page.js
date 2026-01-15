"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NouvelEntretienPage() {
  const router = useRouter();

  const [date, setDate] = useState("");       // yyyy-mm-dd
  const [heure, setHeure] = useState("");     // hh:mm
  const [theme, setTheme] = useState("");

  const [withMA, setWithMA] = useState(true);
  const [withTP, setWithTP] = useState(true);
  const [withCA, setWithCA] = useState(false);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");

    if (!date || !heure) {
      setMsg("Veuillez renseigner une date et une heure.");
      return;
    }
    if (!withMA && !withTP && !withCA) {
      setMsg("Veuillez choisir au moins un participant (MA, TP ou CA).");
      return;
    }

    setBusy(true);
    try {
      const startsAt = new Date(`${date}T${heure}:00`);

      const res = await fetch("/api/entretiens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startsAt: startsAt.toISOString(),
          theme,
          withMA,
          withTP,
          withCA,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Erreur API");

      router.push("/entretiens");
      router.refresh();
    } catch (err) {
      console.error(err);
      setMsg("Impossible de créer l’entretien.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 sm:px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Créer un entretien</h1>

          <button
            type="button"
            onClick={() => router.push("/entretiens")}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            ← Retour
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow p-6 space-y-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Heure *</label>
              <input
                type="time"
                value={heure}
                onChange={(e) => setHeure(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Thème (libre)</label>
            <input
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Ex: Suivi hebdo, point stage, validation journal…"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-800 mb-3">
              Participants
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={withMA}
                  onChange={(e) => setWithMA(e.target.checked)}
                />
                MA
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={withTP}
                  onChange={(e) => setWithTP(e.target.checked)}
                />
                TP
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={withCA}
                  onChange={(e) => setWithCA(e.target.checked)}
                />
                CA
              </label>
            </div>
          </div>

          {msg && <p className="text-sm text-rose-600">{msg}</p>}

          <div className="flex justify-end">
            <button
              disabled={busy}
              className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60"
            >
              {busy ? "Création..." : "Créer l’entretien"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
