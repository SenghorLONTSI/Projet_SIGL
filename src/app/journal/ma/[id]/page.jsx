//FE afficher les journaux de l'apprenti selélectionner du MA
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { set } from "zod";
import ReviewComponent from "@/components/review/reviewComponent";

export default function Page({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [journaux, setJournaux] = useState([]);
  const [apprenti, setApprenti] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReview, setIsReview] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function fetchJournaux() {
      try {
        setLoading(true);
        const res = await fetch(`/api/journal/${id}`, { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Erreur de chargement");
        }
        if (!cancelled) setJournaux(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Erreur inconnue");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    //recuperer les informations de l'apprenti
    async function fetchApprenti() {
      try {
        const res = await fetch(`/api/apprenti/${id}`, { cache: "no-store" });
        const data = await res.json();
        setApprenti(data);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Erreur inconnue");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchApprenti();

    fetchJournaux();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Journaux de l'apprenti
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Apprenti(e) : {apprenti?.name ?? "—"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Retour
        </Button>
      </header>
      {loading && <p className="text-sm text-slate-600">Chargement...</p>}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          {journaux.length === 0 ? (
            <p className="text-sm text-slate-500">
              Aucun journal pour cet apprenti.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {journaux.map((j) => {
                const created = j?.createdAt ? new Date(j.createdAt) : null;
                return (
                  <Card key={j.id} className="border-slate-200 ">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Journal #{j.id}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-700 space-y-1.5">
                      <p>
                        <span className="text-slate-500">Template:</span>{" "}
                        <span className="font-medium">
                          {j.templateId ?? "—"}
                        </span>
                      </p>
                      <p>
                        <span className="text-slate-500">Apprenti ID:</span>{" "}
                        <span className="font-medium">
                          {j.apprentiId ?? "—"}
                        </span>
                      </p>
                      <p>
                        <span className="text-slate-500">Créé le:</span>{" "}
                        <span className="font-medium">
                          {created
                            ? created.toLocaleString()
                            : (j.createdAt ?? "—")}
                        </span>
                      </p>
                      <div className="pt-2">
                        {true && <ReviewComponent assignmentId={j.id} />}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
