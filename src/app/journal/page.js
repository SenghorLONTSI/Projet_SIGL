// src/app/journaux/page.js
import { prisma } from "../../lib/prisma";
import { requireApprenti } from "../../lib/auth";
import Link from "next/link";
import TopNav from "../../components/TopNav";
import heroBg from "./image.png";

export const dynamic = "force-dynamic";

// Image de fond (remplace la chaîne par TON data:image complet)
const HERO_BACKGROUND = heroBg.src;
  
function formatDate(d) {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(d);
  } catch {
    return d.toString();
  }
}

// On ne filtre pas par apprentiId : tous les journaux
async function getAssignments() {
  return prisma.journalAssignment.findMany({
    include: {
      template: {
        include: { slot: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function JournauxPage() {
  try {
    await requireApprenti();
  } catch {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Accès refusé</h1>
          <p>
            Vous devez être connecté en tant qu&apos;apprenti pour accéder à
            cette page.
          </p>
        </div>
      </main>
    );
  }

  const assignments = await getAssignments();

  return (
    <main className="min-h-screen bg-slate-50">
      <TopNav />

      {/* HERO ESEO / ALTERNANCE */}
      <section
        className="w-full"
        style={{
          backgroundImage: `url(${HERO_BACKGROUND})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "260px",
          position: "relative"
        }}
      >
        {/* voile foncé au-dessus de l'image */}
        <div 
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "70%", // zone foncée uniquement en bas
            background:"linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
          }}
        >
          <div className="max-w-6xl mx-auto px-6 py-6 md:py-8 space-y-4">
            <p className="text-sm md:text-base text-white">

              Bonjour{" "}
              <span className="font-bold uppercase">CELIA ORIELLE</span>, bienvenue
              dans votre livret alternance&nbsp;!
            </p>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Bloc identité à gauche */}
              <div className="flex items-center gap-4">
                {/* Avatar – à remplacer par une vraie image si tu veux */}
                <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-white bg-slate-300" />
                <div className="text-white text-sm space-y-1">
                  <div className="font-semibold">
                    CELIA ORIELLE TAKOUDJOU (20 ans)
                  </div>
                  <div className="text-s">Business analyst</div>
                  <div className="text-s">celia.takoudjou@gmail.com</div>
                  <div className="text-s">+33 6 04 10 09 68</div>
                </div>
              </div>

              {/* Bloc alternance / école à droite */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 text-white text-xs md:text-sm">
                <div className="space-y-1">
                  <div className="font-semibold">
                    CAPGEMINI TECHNOLOGY SERVICES
                  </div>
                  <div>02/09/2024 - 04/09/2026</div>
                  <div>16 Mail Pablo Picasso, 44000 Nantes</div>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold">ESEO</div>
                  <div>
                    Ingénieur 3 (M2) Nouvelles technologies – Promo rentrée 2025
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENU EXISTANT : liste des journaux */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Mes journaux</h1>
          <p className="text-slate-600">
            Voici la liste des journaux à compléter.
          </p>
        </header>

        {assignments.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">
            Aucun journal n&apos;a encore été créé.
          </div>
        )}

        <div className="space-y-4">
          {assignments.map((a) => {
            const t = a.template;
            const slot = t?.slot || null;
            const nbSlotsRequis = slot ? 1 : 0;
            const nbSlotsDeposes = slot?.nbFiles ?? 0;

            return (
              <article
                key={a.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 px-6 py-5 flex flex-col gap-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {t?.Titre || t?.code || `Journal`}
                    </h2>
                    <p className="text-sm text-slate-600">
                      Période {t?.periode || "—"} • Échéance{" "}
                      {formatDate(t?.deadline)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-700">
                      {nbSlotsDeposes}/{nbSlotsRequis} dépôt(s) requis
                    </div>
                    <span
                      className={
                        "px-3 py-1 rounded-full text-xs font-medium " +
                        (a.statut === "EN_COURS"
                          ? "bg-blue-100 text-blue-700"
                          : a.statut === "TERMINE"
                          ? "bg-green-100 text-green-700"
                          : a.statut === "EN_RETARD"
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-700")
                      }
                    >
                      {a.statut.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {t?.description && (
                  <p className="text-sm text-slate-700">{t.description}</p>
                )}

                <div className="flex justify-end">
                  <Link
                    href={`/journaux/${a.id}`}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-600 text-white text-sm font-medium px-4 py-2 hover:bg-blue-700 transition"
                  >
                    Compléter
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
