"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function JournalDocumentUpload({ journalAssignmentId, initialDocument }) {
  const router = useRouter();
  const inputRef = useRef(null);

  // Document déjà en base (après soumission)
  const [savedDoc, setSavedDoc] = useState(initialDocument ?? null);

  // Fichier sélectionné (local navigateur)
  const [selectedFile, setSelectedFile] = useState(null);

  // Fichier "enregistré" en tmp côté serveur (PAS en base)
  const [staged, setStaged] = useState(null); // { tempKey, tempUrl, meta }

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  function pickFile() {
    setMsg("");
    inputRef.current?.click();
  }

  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setMsg(`Fichier sélectionné : ${file.name}`);
  }

  function clearSelected() {
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = "";
    setMsg("");
  }

  // 🟦 ENREGISTRER = stage (tmp) => RIEN en base
  async function handleSaveDraft() {
    if (!selectedFile) return;
    setBusy(true);
    setMsg("");

    try {
      // Si un fichier tmp existe déjà, on le supprime avant de remplacer
      if (staged?.tempKey) {
        await fetch("/api/documents/stage", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tempKey: staged.tempKey }),
        }).catch(() => {});
      }

      const fd = new FormData();
      fd.append("file", selectedFile);

      const res = await fetch("/api/documents/stage", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Stage failed");

      setStaged(data); // { tempKey, tempUrl, meta }
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = "";
      setMsg("Document enregistré (brouillon) ✅ — pas encore soumis.");
    } catch (e) {
      console.error(e);
      setMsg("Erreur lors de l’enregistrement.");
    } finally {
      setBusy(false);
    }
  }

  // 🗑️ Poubelle = supprime le tmp (si pas soumis)
  async function handleDeleteDraft() {
    if (!staged?.tempKey) return;
    setBusy(true);
    setMsg("");

    try {
      const res = await fetch("/api/documents/stage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempKey: staged.tempKey }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Delete tmp failed");

      setStaged(null);
      setMsg("Brouillon supprimé.");
    } catch (e) {
      console.error(e);
      setMsg("Erreur lors de la suppression.");
    } finally {
      setBusy(false);
    }
  }

  // 🟩 SOUMETTRE = crée en base (Document)
  async function handleSubmit() {
    if (!staged?.tempKey) return;
    setBusy(true);
    setMsg("");

    try {
      const res = await fetch("/api/documents/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journalAssignmentId,
          tempKey: staged.tempKey,
          // optionnel : tu peux passer les meta si tu veux
          fileName: staged.meta?.fileName,
          mimeType: staged.meta?.mimeType,
          size: staged.meta?.size,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Submit failed");

      // data.document = ligne Prisma Document
      setSavedDoc(data.document);
      setStaged(null);
      setMsg("Document soumis ✅ ");

      router.refresh(); // recharge server component (liste docs)
    } catch (e) {
      console.error(e);
      setMsg("Erreur lors de la soumission.");
    } finally {
      setBusy(false);
    }
  }

  // Si déjà soumis (en base) => on affiche seulement l’état (modifiable plus tard)
  if (savedDoc) {
    return (
      <section className="bg-white p-6 rounded-2xl shadow space-y-3">
        <h2 className="text-lg font-semibold">Dépôt de document</h2>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-sm text-slate-800">
            <div className="font-medium">Document soumis</div>
            <div className="text-xs text-slate-600">
              {savedDoc.fileName} • {(savedDoc.size / 1024).toFixed(0)} Ko
            </div>
          </div>

          <a
            href={savedDoc.url}
            target="_blank"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            Télécharger
          </a>
        </div>

        {msg && <p className="text-xs text-slate-600">{msg}</p>}
      </section>
    );
  }

  return (
    <section className="bg-white p-6 rounded-2xl shadow space-y-4">
      <h2 className="text-lg font-semibold">Dépôt de document</h2>

      <input ref={inputRef} type="file" className="hidden" onChange={onFileChange} />

      {/* Si un brouillon existe (tmp) */}
      {staged && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-sm text-slate-800">
            <div className="font-medium">Document enregistré (brouillon)</div>
            <div className="text-xs text-slate-600">
              {staged.meta?.fileName} • {Math.round((staged.meta?.size || 0) / 1024)} Ko
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Remplacer = choisir un nouveau fichier (puis Enregistrer) */}
            <button
              type="button"
              onClick={pickFile}
              disabled={busy}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
              title="Remplacer le document"
            >
              Remplacer
            </button>

            {/* Poubelle = supprime le brouillon */}
            <button
              type="button"
              onClick={handleDeleteDraft}
              disabled={busy}
              className="h-9 w-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition"
              title="Supprimer"
            >
              🗑️
            </button>
          </div>
        </div>
      )}

      {/* Fichier sélectionné (avant enregistrement) */}
      {selectedFile && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 space-y-3">
          <div className="text-sm text-slate-800">
            <div className="font-medium">Fichier sélectionné</div>
            <div className="text-xs text-slate-600">
              {selectedFile.name} • {Math.round(selectedFile.size / 1024)} Ko
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={clearSelected}
              disabled={busy}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              Annuler
            </button>

            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={busy}
              className="rounded-full bg-blue-600 text-white px-5 py-2 text-xs font-semibold hover:bg-blue-700 transition"
            >
              Enregistrer en brouillon
            </button>
          </div>
        </div>
      )}

      {/* Aucun fichier + aucun brouillon */}
      {!staged && !selectedFile && (
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50">
          <p className="text-slate-600 mb-4">
            Glissez-déposez un fichier ici ou utilisez le bouton ci-dessous.
          </p>

          <button
            type="button"
            onClick={pickFile}
            className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-full text-sm shadow hover:bg-blue-700 transition inline-block"
          >
            Choisir un fichier
          </button>
        </div>
      )}

      {/* Bouton Soumettre (visible quand brouillon existe) */}
      {staged && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={busy}
            className="rounded-full bg-blue-600 text-white px-6 py-2 text-sm font-medium hover:bg-blue-700 transition"
          >
            Soumettre
          </button>
        </div>
      )}

      {msg && <p className="text-xs text-slate-600">{msg}</p>}
    </section>
  );
}
