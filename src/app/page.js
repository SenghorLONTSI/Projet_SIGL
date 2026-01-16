"use client";
import React from "react";
import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, Search, ArrowRight, CalendarPlus } from "lucide-react";
import { fonts } from "../../app/font";
import DropdownMenuUser from "@/components/DropdownMenuUser";
import { Spinner } from "../ui/spinner";
import Link from "next/link";

const HomePageApprenti = (props) => {
  // 🔹 Journaux
  const [journaux, setJournaux] = useState([]);
  const [searchJournal, setSearchJournal] = useState("");
  const [loadingJournaux, setLoadingJournaux] = useState(true);

  // 🔹 Entretiens
  const [entretiens, setEntretiens] = useState([]);
  const [searchEntretien, setSearchEntretien] = useState("");
  const [loadingEntretiens, setLoadingEntretiens] = useState(true);

  const session = props.session;
  const user = props.user;

  // ✅ Récupérer journaux apprenti
  useEffect(() => {
    const getJournaux = async () => {
      try {
        const res = await fetch("/api/journaux", { method: "GET" });
        const data = await res.json();

        if (!res.ok) throw new Error(data?.error || "Erreur fetch journaux");
        setJournaux(data || []);
      } catch (e) {
        console.error("Erreur journaux:", e);
      } finally {
        setLoadingJournaux(false);
      }
    };
    getJournaux();
  }, []);

  // ✅ Récupérer entretiens apprenti
  useEffect(() => {
    const getEntretiens = async () => {
      try {
        const res = await fetch("/api/entretiens", { method: "GET" });
        const data = await res.json();

        if (!res.ok) throw new Error(data?.error || "Erreur fetch entretiens");
        setEntretiens(data || []);
      } catch (e) {
        console.error("Erreur entretiens:", e);
      } finally {
        setLoadingEntretiens(false);
      }
    };
    getEntretiens();
  }, []);

  // ✅ Filtre journaux
  const journauxFilter = useMemo(() => {
    let list = [...journaux];

    if (searchJournal.trim()) {
      const q = searchJournal.toLowerCase();
      list = list.filter((j) => {
        const titre = (j?.template?.Titre || "").toLowerCase();
        const periode = (j?.template?.periode || "").toLowerCase();
        const statut = (j?.statut || "").toLowerCase();
        return titre.includes(q) || periode.includes(q) || statut.includes(q);
      });
    }

    return list;
  }, [journaux, searchJournal]);

  // ✅ Filtre entretiens
  const entretiensFilter = useMemo(() => {
    let list = [...entretiens];

    if (searchEntretien.trim()) {
      const q = searchEntretien.toLowerCase();
      list = list.filter((e) => {
        const theme = (e?.theme || "").toLowerCase();
        const participants = (e?.participantsLabel || "").toLowerCase(); // optionnel si tu l'ajoutes dans l'API
        return theme.includes(q) || participants.includes(q);
      });
    }

    return list;
  }, [entretiens, searchEntretien]);

  // ✅ Contacts : MA + TP (si ton API "user" les inclut)
  const contacts = [
    {
      label: "Maître d'apprentissage (MA)",
      email: user?.apprenti?.ma?.user?.email || user?.apprenti?.ma?.email || "—",
      phone: user?.apprenti?.ma?.phone || "—",
      name: user?.apprenti?.ma?.name || "—",
    },
    {
      label: "Tuteur pédagogique (TP)",
      email: user?.apprenti?.tp?.user?.email || user?.apprenti?.tp?.email || "—",
      phone: user?.apprenti?.tp?.phone || "—",
      name: user?.apprenti?.tp?.name || "—",
    },
  ];

  return (
    <main className="min-h-fit  bg-[#F3F4FF] text-slate-900">
      <div className=" w-full px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-3 space-y-8">
            <div className="flex items-center justify-between gap-4">
              <h1
                className={`text-xl font-weight-900 font-extrabold text-[#1f1b4a] lg:text-3xl ${fonts.className}`}
              >
                Page d'accueil
              </h1>
              <div className="flex items-center gap-3">
                <div className="relative w-30 sm:w-40 md:w-50 lg:w-72">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Chercher ici..."
                    className="text-sm/10 pl-10 rounded-full bg-white border-slate-200 shadow-sm"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 text-sm px-3 py-2 lg:hidden ">
                  <DropdownMenuUser name={user.name} email={user.email} />
                </div>
              </div>
            </div>

            {/* ✅ PROFIL CARD (même style) */}
            <Card className="overflow-hidden border-none shadow-md rounded-3xl pt-0 bg-white">
              <div className="relative h-32 bg-gradient-to-r rounded-t-3xl from-[#2a176e] via-[#422c9f] to-[#6a51de] overflow-hidden">
                <div className="absolute left-50 md:right-32 bottom-[-28px] h-24 w-24 rounded-full z-20 bg-[#ffb32c]" />
                <div className="absolute left-45 md:right-45 bottom-[-35px] h-20 w-20 rounded-full z-10 bg-[#f05d7f]" />
              </div>
              <CardContent className="flex flex-wrap items-center gap-6 px-6 pb-6">
                <Avatar className="h-20 w-20 border-4 border-white -mt-12 shadow-md">
                  <AvatarFallback className="bg-[#c8bdf7] text-[#1f1b4a] text-xl">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 p-b-4">
                  <p className="text-xl font-bold text-[#1f1b4a]">
                    {session?.user?.name}
                  </p>
                  <p className="text-sm/5 text-slate-500">
                    {session?.user?.role ? "Apprenti(e)" : ""}
                  </p>
                </div>
                <div className="ml-auto grid grid-cols-2 gap-x-1 gap-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 md:h-9 md:w-9 rounded-full bg-[#ffe7dd] flex items-center justify-center text-[#ff7c4c]">
                      <Phone className="h-2 w-2 md:h-4 md:w-4" />
                    </span>
                    <div>
                      <p className="text-xs text-slate-500">Téléphone</p>
                      <p className="font-semibold">{user?.phone || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 md:h-9 md:w-9 rounded-full bg-[#ffe7dd] flex items-center justify-center text-[#ff7c4c]">
                      <Mail className="h-2 w-2 md:h-4 md:w-4" />
                    </span>
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="font-semibold text-sm">
                        {session?.user?.email}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* ✅ JOURNAUX (remplace Utilisateurs) */}
              <Card className="rounded-3xl bg-white md:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-[#1f1b4a]">
                    Mes journaux
                  </CardTitle>
                  <p className="text-xs text-slate-500">
                    {journauxFilter.length} journal(x)
                  </p>
                </CardHeader>

                <CardContent>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={searchJournal}
                      onChange={(e) => setSearchJournal(e.target.value)}
                      placeholder="Chercher un journal..."
                      className="pl-10 rounded-full bg-[#f7f7fb] border-slate-200"
                    />
                  </div>

                  {loadingJournaux ? (
                    <Spinner className="mx-auto" />
                  ) : (
                    <ScrollArea className="h-96 pr-2 space-y-2 gap-2">
                      {journauxFilter.map((j) => {
                        const titre = j?.template?.Titre || "Journal";
                        const periode = j?.template?.periode || "—";
                        const statut = j?.statut || "EN_COURS";

                        const badgeClass =
                          statut === "TERMINE"
                            ? "bg-green-100 text-green-700"
                            : statut === "EN_RETARD"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-blue-100 text-blue-700";

                        return (
                          <div
                            key={j.id}
                            className="flex items-center justify-between gap-5 m-3 rounded-2xl border px-3 py-2 bg-white border-slate-200"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-[#c8bdf7] text-[#1f1b4a]">
                                  {titre.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>

                              <div>
                                <p className="text-sm font-semibold text-[#1f1b4a]">
                                  {titre}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {periode}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <Badge className={`rounded-full ${badgeClass}`}>
                                {statut.replace("_", " ")}
                              </Badge>

                              <Link href={`/journal/${j.id}`}>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-9 w-9 rounded-full border-[#d5cdf8] text-[#4a27a8] hover:bg-[#f0ecff]"
                                >
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </ScrollArea>
                  )}

                  <Link href="/journaux">
                    <Button
                      variant="ghost"
                      className="mt-4 w-full rounded-full bg-[#f1edf8] text-[#1f1b4a] hover:bg-[#e7e0f6]"
                    >
                      Voir plus
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* ✅ ENTRETIENS (remplace Notifications) */}
              <Card className="rounded-3xl bg-white md:col-span-1">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base text-[#1f1b4a]">
                      Mes entretiens
                    </CardTitle>
                    <p className="text-xs text-slate-500">
                      {entretiensFilter.length} entretien(s)
                    </p>
                  </div>

                  <Link href="/entretiens/nouveau">
                    <Button className="rounded-full bg-[#4a27a8] hover:bg-[#3f2095] text-white gap-2">
                      <CalendarPlus className="h-4 w-4" />
                      Créer
                    </Button>
                  </Link>
                </CardHeader>

                <CardContent>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={searchEntretien}
                      onChange={(e) => setSearchEntretien(e.target.value)}
                      placeholder="Chercher un entretien..."
                      className="pl-10 rounded-full bg-[#f7f7fb] border-slate-200"
                    />
                  </div>

                  {loadingEntretiens ? (
                    <Spinner className="mx-auto" />
                  ) : (
                    <ScrollArea className="h-96 pr-2 space-y-2 gap-2">
                      {entretiensFilter.length === 0 ? (
                        <div className="m-3 text-sm text-slate-500">
                          Aucun entretien programmé.
                        </div>
                      ) : (
                        entretiensFilter.map((e) => (
                          <div
                            key={e.id}
                            className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 m-3 hover:bg-[#f7f7fb]"
                          >
                            <div>
                              <p className="text-sm font-semibold text-[#1f1b4a]">
                                {e.theme || "Entretien"}
                              </p>
                              <p className="text-xs text-slate-500">
                                {e.date
                                  ? new Date(e.date).toLocaleString("fr-FR")
                                  : "Date à définir"}
                              </p>
                            </div>

                            <Badge className="rounded-full bg-[#ff7c4c] text-white px-2 py-1 text-[10px]">
                              INFO
                            </Badge>
                          </div>
                        ))
                      )}
                    </ScrollArea>
                  )}

                  <Link href="/entretiens">
                    <Button
                      variant="ghost"
                      className="mt-4 w-full rounded-full bg-[#f1edf8] text-[#1f1b4a] hover:bg-[#e7e0f6]"
                    >
                      Voir plus
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ✅ COLONNE DROITE */}
          <div className="w-full p-5 bg-white md:col-span-1">
            <div className="hidden items-center justify-end gap-3 text-sm bg-white px-3 py-2 lg:flex">
              <div className="text-right">
                <p className="text-sm font-semibold text-[#1f1b4a]">
                  {session?.user?.name}
                </p>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {session?.user?.role}
                </p>
              </div>
              <DropdownMenuUser name={user.name} email={user.email} />
            </div>

            <div className="lg:col-span-1 bg-white space-y-4">
              <Card className="rounded-3xl border-none bg-gradient-to-br from-[#2a176e] via-[#422c9f] to-[#6a51de] text-white shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Contacts importants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {contacts.map((c, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-sm font-semibold">{c.label}</p>
                      <p className="text-xs text-white/80">
                        {c.name} — {c.email} — {c.phone}
                      </p>
                      {idx < contacts.length - 1 && (
                        <Separator className="bg-white/20" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Tu peux laisser ces blocs plus tard si tu veux :
                  écoles / entreprises, ou les retirer. */}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomePageApprenti;
