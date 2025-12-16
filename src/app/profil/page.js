// src/app/profil/page.js
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function ProfilPage() {
  const [tab, setTab] = useState("profil"); // "profil" | "contacts" | "cv" | "password"
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // états d’édition
  const [editPersonal, setEditPersonal] = useState(false);
  const [editSejour, setEditSejour] = useState(false);
  const [editSituation, setEditSituation] = useState(false);

  // photo
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);

  // CV
  const [cvFile, setCvFile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    subName: "",
    email: "",
    phone: "",
    image: "",
    typeTitreSejour: "Étudiant",
    situationAcademique: "Contrat d'apprentissage au CFA NumA",
    cvName: "",
    cvUrl: "",
  });

  const [contacts, setContacts] = useState({
    ma: null,
    tp: null,
    ca: null,
  });

  // Chargement initial profil + contacts + CV
  useEffect(() => {
    async function load() {
      try {
        // Profil + contacts
        const res = await fetch("/api/profil");
        if (!res.ok) throw new Error("");
        const data = await res.json();

        setForm((f) => ({
          ...f,
          name: data.apprenti?.name || "",
          subName: data.apprenti?.subName || "",
          email: data.user?.email || "",
          image: data.user?.image || "",
          typeTitreSejour: data.apprenti?.typeTitreSejour || "Étudiant",
          situationAcademique:
            data.apprenti?.situationAcademique ||
            "Contrat d'apprentissage au CFA NumA",
        }));

        setPreviewImage(data.user?.image || null);

        setContacts({
          ma: data.contacts?.ma || null,
          tp: data.contacts?.tp || null,
          ca: data.contacts?.ca || null,
        });

        // CV (appel dédié)
        const resCv = await fetch("/api/profil/cv");
        if (resCv.ok) {
          const cvData = await resCv.json();
          setForm((f) => ({
            ...f,
            cvName: cvData.cvName || "",
            cvUrl: cvData.cvUrl || "",
          }));
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // avatar
  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setForm((prev) => ({ ...prev, image: base64 }));
      setPreviewImage(base64);
    };
    reader.readAsDataURL(file);
  }

  // Sauvegarde globale profil (pas le CV)
  async function handleSaveAll() {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          subName: form.subName,
          email: form.email,
          image: form.image,
          typeTitreSejour: form.typeTitreSejour,
          situationAcademique: form.situationAcademique,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors de l'enregistrement");
      }

      setEditPersonal(false);
      setEditSejour(false);
      setEditSituation(false);
      setSuccess("Profil mis à jour ✅");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  // Upload / remplacement du CV
  async function handleUploadCV(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!cvFile) {
      setError("Veuillez sélectionner un fichier PDF.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", cvFile);

      const res = await fetch("/api/profil/cv", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors du dépôt du CV");
      }

      // Recharger les infos CV depuis l'API
      const resCv = await fetch("/api/profil/cv");
      if (resCv.ok) {
        const cvData = await resCv.json();
        setForm((f) => ({
          ...f,
          cvName: cvData.cvName || "",
          cvUrl: cvData.cvUrl || "",
        }));
      }

      setSuccess("CV mis à jour ✅");
      setCvFile(null);
    } catch (e) {
      setError(e.message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f6fb] flex items-center justify-center">
        <p className="text-sm text-slate-600">Chargement du profil…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6fb] text-[#1f3254]">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* lien retour */}
        <div className="text-xs mb-2">
          <Link href="/" className="hover:underline">
            &lt; Retour
          </Link>
        </div>

        {/* ENTÊTE : avatar + nom + menu droite */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleAvatarClick}
              className="h-16 w-16 rounded-lg overflow-hidden bg-slate-300 flex items-center justify-center text-xs font-semibold text-white relative group"
            >
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Photo de profil"
                  className="h-full w-full object-cover"
                />
              ) : (
                "IMG"
              )}
              <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-white text-center opacity-0 group-hover:opacity-100 transition">
                Modifier la photo
              </span>
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />

            <div>
              <h1 className="text-lg font-semibold uppercase">
                {form.name} {form.subName}
              </h1>
            </div>
          </div>

          <div className="text-xs text-right space-y-1">
            <div className="font-semibold">Mon profil</div>
            <button
              type="button"
              onClick={() => setTab("password")}
              className="hover:underline"
            >
              Changer mot de passe
            </button>
          </div>
        </div>

        {/* Onglets centre */}
        <div className="flex justify-center mt-2">
          <div className="inline-flex rounded-full bg-[#e5e8f0] p-1 text-xs">
            {/* Profil */}
            <button
              onClick={() => setTab("profil")}
              className={
                "px-6 py-1 rounded-full " +
                (tab === "profil"
                  ? "bg-[#283b70] text-white font-semibold"
                  : "text-[#283b70]")
              }
            >
              Profil
            </button>

            {/* Contacts */}
            <button
              onClick={() => setTab("contacts")}
              className={
                "px-6 py-1 rounded-full " +
                (tab === "contacts"
                  ? "bg-[#283b70] text-white font-semibold"
                  : "text-[#283b70]")
              }
            >
              Contacts
            </button>

            {/* CV PDF */}
            <button
              onClick={() => setTab("cv")}
              className={
                "px-6 py-1 rounded-full " +
                (tab === "cv"
                  ? "bg-[#283b70] text-white font-semibold"
                  : "text-[#283b70]")
              }
            >
              CV PDF
            </button>
          </div>
        </div>

        {error && (
          <p className="text-xs text-center text-red-600">{error}</p>
        )}
        {success && (
          <p className="text-xs text-center text-emerald-600">{success}</p>
        )}

        {/* ---------- ONGLET PROFIL ---------- */}
        {tab === "profil" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              {/* COLONNE GAUCHE */}
              <div className="space-y-4">
                {/* Coordonnées personnelles */}
                <section className="bg-white rounded-lg shadow-sm p-4 text-xs leading-relaxed">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-semibold text-[13px]">
                      Coordonnées et info. personnelles
                    </h2>
                    <button
                      type="button"
                      onClick={() => setEditPersonal((v) => !v)}
                      className="text-[11px] text-[#283b70]"
                    >
                      ✏️
                    </button>
                  </div>

                  {!editPersonal ? (
                    <>
                      <p>Civilité : Madame</p>
                      <p>
                        Prénom NOM : {form.name} {form.subName}
                      </p>
                      <p>Email : {form.email || "(non renseigné)"}</p>
                      <p>Téléphone : {form.phone || "(lecture seule)"}</p>
                    </>
                  ) : (
                    <div className="grid grid-cols-[120px,1fr] gap-y-2 items-center">
                      <span>Prénom :</span>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="border border-slate-300 rounded px-2 py-1 text-xs"
                      />
                      <span>Nom :</span>
                      <input
                        name="subName"
                        value={form.subName}
                        onChange={handleChange}
                        className="border border-slate-300 rounded px-2 py-1 text-xs"
                      />
                      <span>Email :</span>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        className="border border-slate-300 rounded px-2 py-1 text-xs"
                      />
                    </div>
                  )}
                </section>

                {/* Informations de séjour */}
                <section className="bg-white rounded-lg shadow-sm p-4 text-xs leading-relaxed">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-semibold text-[13px]">
                      Informations de séjour
                    </h2>
                    <button
                      type="button"
                      onClick={() => setEditSejour((v) => !v)}
                      className="text-[11px] text-[#283b70]"
                    >
                      ✏️
                    </button>
                  </div>

                  {!editSejour ? (
                    <p>Type de titre : {form.typeTitreSejour}</p>
                  ) : (
                    <div className="grid grid-cols-[120px,1fr] gap-y-2 items-center">
                      <span>Type de titre :</span>
                      <input
                        name="typeTitreSejour"
                        value={form.typeTitreSejour}
                        onChange={handleChange}
                        className="border border-slate-300 rounded px-2 py-1 text-xs"
                      />
                    </div>
                  )}
                </section>
              </div>

              {/* COLONNE DROITE */}
              <div className="space-y-4">
                {/* Situation académique */}
                <section className="bg-white rounded-lg shadow-sm p-4 text-xs leading-relaxed">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-semibold text-[13px]">
                      Situation académique
                    </h2>
                    <button
                      type="button"
                      onClick={() => setEditSituation((v) => !v)}
                      className="text-[11px] text-[#283b70]"
                    >
                      ✏️
                    </button>
                  </div>

                  {!editSituation ? (
                    <p>{form.situationAcademique}</p>
                  ) : (
                    <textarea
                      name="situationAcademique"
                      value={form.situationAcademique}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded px-2 py-1 text-xs resize-none"
                      rows={4}
                    />
                  )}
                </section>
              </div>
            </div>

            {/* BOUTON GLOBAL */}
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={saving}
                className="rounded bg-[#283b70] text-white px-5 py-2 text-xs font-semibold hover:bg-[#1e2f5d] disabled:opacity-60"
              >
                {saving ? "Enregistrement…" : "Enregistrer les modifications"}
              </button>
            </div>
          </>
        )}

        {/* ---------- ONGLET CONTACTS ---------- */}
        {tab === "contacts" && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <ContactCard
              title="Maître d'apprentissage (MA)"
              contact={contacts.ma}
            />
            <ContactCard
              title="Tuteur pédagogique (TP)"
              contact={contacts.tp}
            />
            <ContactCard
              title="Conseiller apprentissage (CA)"
              contact={contacts.ca}
            />
          </div>
        )}

        {/* ---------- ONGLET CV PDF ---------- */}
        {tab === "cv" && (
          <div className="max-w-xl mx-auto mt-6 bg_WHITE rounded-lg shadow-sm p-6 text-xs space-y-4 bg-white">
            <h2 className="text-sm font-semibold mb-2">Mon CV PDF</h2>

            {form.cvName ? (
              <div className="space-y-1">
                <p className="text-xs">
                  <span className="font-semibold">CV actuel :</span>{" "}
                  {form.cvName}
                </p>
                {form.cvUrl && (
                  <a
                    href={form.cvUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-blue-600 underline text-xs"
                  >
                    Ouvrir / télécharger mon CV
                  </a>
                )}
              </div>
            ) : (
              <p className="text-slate-600 text-xs">
                Aucun CV ajouté pour le moment.
              </p>
            )}

            <form className="space-y-3" onSubmit={handleUploadCV}>
              <div>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                  className="text-xs"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Format accepté : PDF uniquement.
                </p>
              </div>

              <button
                type="submit"
                className="rounded bg-[#283b70] text-white px-4 py-2 text-xs font-semibold hover:bg-[#1e2f5d]"
              >
                Déposer / remplacer mon CV
              </button>
            </form>
          </div>
        )}

        {/* ---------- ONGLET MOT DE PASSE ---------- */}
        {tab === "password" && (
          <div className="max-w-xl mx-auto mt-6 bg-white rounded-lg shadow-sm p-6 text-xs">
            <h2 className="text-sm font-semibold mb-4">
              Changer mon mot de passe
            </h2>
            <p className="text-xs text-slate-600 mb-3">
              (À connecter plus tard sur une route API dédiée.)
            </p>
            <form className="space-y-4">
              <div>
                <label className="block mb-1">Ancien mot de passe</label>
                <input
                  type="password"
                  className="w-full rounded border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block mb-1">Nouveau mot de passe</label>
                <input
                  type="password"
                  className="w-full rounded border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block mb-1">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  className="w-full rounded border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <button
                type="submit"
                className="mt-2 rounded bg-[#283b70] text-white px-4 py-2 text-xs font-semibold hover:bg-[#1e2f5d]"
              >
                Enregistrer
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

/** Composant carte de contact */
function ContactCard({ title, contact }) {
  return (
    <section className="bg-white rounded-lg shadow-sm p-4 leading-relaxed">
      <h2 className="font-semibold text-[13px] mb-2">{title}</h2>
      {contact ? (
        <>
          <p>
            Nom : {contact.name} {contact.subName}
          </p>
          <p>Email : {contact.email || "Non renseigné"}</p>
        </>
      ) : (
        <p className="text-slate-500 text-[11px]">
          Aucune personne renseignée pour ce rôle.
        </p>
      )}
    </section>
  );
}
