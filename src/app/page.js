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
import React, { useEffect, useMemo } from "react";
import { useState } from "react";
import { requireApprenti } from "../lib/auth";
import { getUser, getSession, requireRole } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import TopNav from "../components/TopNav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, Search, ArrowRight } from "lucide-react";
import { fonts } from "./font";
import DropdownMenuUser from "@/components/DropdownMenuUser";
import { get } from "react-hook-form";
export const dynamic = "force-dynamic";

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

export default async function HomePage() {
  // 1) Vérifier que l'utilisateur est bien un apprenti connecté
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  if (session?.user?.role === "APPRENTI") {
    requireRole(session, "home:apprenti:view");
    try {

    } catch {
      return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 via-sky-100 to-sky-50">
          <div className="bg-white/90 rounded-3xl shadow-lg px-8 py-6 text-center space-y-3 border border-sky-100">
            <h1 className="text-2xl font-semibold text-slate-900">Bienvenue</h1>
            <p className="text-slate-600">
              Vous devez être connecté en tant qu&apos;apprenti pour accéder à votre
              espace.
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

    // 2) Récupérer les journaux de cet apprenti
    const assignments = await getApprentiJournals(user.id);
    // >>>>>>> f2e30048f0a338eb972523b965fb107dcf55e2b6

    const total = assignments.length;
    const enCours = assignments.filter((a) => a.statut === "EN_COURS").length;
    const enRetard = assignments.filter((a) => a.statut === "EN_RETARD").length;
    const termines = assignments.filter((a) => a.statut === "TERMINE").length;

    // Prochaine échéance (la plus proche parmi les deadlines)
    const withDeadline = assignments
      .filter((a) => a.template?.deadline)
      .sort(
        (a, b) =>
          new Date(a.template.deadline) - new Date(b.template.deadline)
      );
    const nextDeadline = withDeadline[0] || null;

    // Les 3 prochains journaux à rendre
    const prochains = withDeadline.slice(0, 3);

    return (

      <main className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-100 to-sky-50">
        {/* <TopNav /> */}

        <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
          {/* Header : bienvenue */}
          <header className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Bonjour {user.firstName || ""} {user.lastName || ""}
            </h1>
            <p className="text-slate-700 text-sm sm:text-base">
              Bienvenue sur votre espace apprenti. Retrouvez ici une synthèse de vos journaux.
            </p>
          </header>

          {/* Cartes de synthèse */}
          <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white/95 rounded-2xl shadow-sm border border-sky-300 p-4">
              <div className="text-[11px] tracking-wide uppercase text-slate-500">
                Tous mes journaux
              </div>
              <div className="mt-2 text-3xl font-bold text-slate-900">{total}</div>
              {/* >>>>>>> f2e30048f0a338eb972523b965fb107dcf55e2b6 */}
            </div>
            <div className="bg-white/95 rounded-2xl shadow-sm border border-sky-400 p-4">
              <div className="text-[11px] tracking-wide uppercase text-slate-500">
                En cours
              </div>
              <div className="mt-2 text-3xl font-bold text-sky-700">{enCours}</div>
            </div>
            <div className="bg-white/95 rounded-2xl shadow-sm border border-rose-300 p-4">
              <div className="text-[11px] tracking-wide uppercase text-slate-500">
                En retard
              </div>
              <div className="mt-2 text-3xl font-bold text-rose-600">{enRetard}</div>
            </div>
            <div className="bg-white/95 rounded-2xl shadow-sm border border-emerald-300 p-4">
              <div className="text-[11px] tracking-wide uppercase text-slate-500">
                Terminés
              </div>
              <div className="mt-2 text-3xl font-bold text-emerald-600">{termines}</div>
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
                Vous n&apos;avez pas encore de journal avec une date limite configurée.
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

          {/* Prochains journaux à compléter */}
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
  if (session?.user?.role === "MA") {
    //TODO: Fais la même chose pour le MA en t'inspirant de ce qui est fait pour l'apprenti
    requireRole(session, "home:ma:view");
    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-100 to-sky-50">
        {/* <TopNav /> */}
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
          <header className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Bonjour {session?.user?.name ?? ""}
            </h1>
            <p className="text-slate-700 text-sm sm:text-base">
              Espace MA. Accédez à la liste de vos apprentis pour consulter et évaluer leurs journaux.
            </p>
          </header>    <section className="bg-white/95 rounded-3xl shadow-sm border border-sky-100 p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-slate-900">Mes apprentis</h2>
              <Link
                href="/MA/liste_apprentis"
                className="inline-flex items-center gap-1 rounded-full bg-blue-600 text-white text-sm font-medium px-5 py-2.5 hover:bg-blue-700 transition shadow-sm"
              >
                Ouvrir la liste
              </Link>
            </div>
            <p className="text-sm text-slate-600">
              Retrouvez la liste de vos apprentis, leurs informations et accédez à leurs journaux.
            </p>
          </section>
        </div>
      </main>
    )
  }
  if (session?.user?.role === "CA") {
    requireRole(session, "home:ca:view");

    //recuper tous les utilisateurs

    // useEffect(() => {
    // async const getAllUsers = () => {
    // const users = await prisma.user.findMany({
    //   where: {id: {not: session.user.id}, role: {not: "CA"}},
    //   orderBy : {createdAt: 'desc'}
    // })}getAllUsers()}, []);
    const [searchText, setSearchText] = useState("");

      const usersFilter = useMemo(() => {
        let userTable = [...users];
    
        if (searchText.trim()) {
          const q = searchText.toLowerCase();
          userTable = userTable.filter((a) => {
            const fullName = `${a.name ?? ""} ${a.subName ?? ""}`.toLowerCase();
            const userRole = a.role?.toLowerCase() ?? "";
            const userEmail =a.email ?.toLowerCase() ?? "";
    
            return (
              fullName.includes(q) ||
              userRole.includes(q) ||
              userEmail.includes(q)
            );
          });
        }
    
      return userTable;
      }, [users, searchText]);
    

    const utilisateurs = [
      { name: "Samantha William", info: "Class VII-A", active: false },
      { name: "Tony Soap", info: "Class VII-A", active: true },
      { name: "Karen Hope", info: "Class VII-A", active: false },
      { name: "Jordan Nico", info: "Class VII-B", active: false },
      { name: "Nadila Adja", info: "Class VII-C", active: false },
    ];

    const notifications = [
      { name: "Samantha William", text: "Lorem ipsum dolor sit amet...", time: "12:45 PM", unread: 2 },
      { name: "Tony Soap", text: "Lorem ipsum dolor sit amet...", time: "12:45 PM", unread: 3 },
      { name: "Karen Hope", text: "Lorem ipsum dolor sit amet...", time: "12:45 PM", unread: 2 },
      { name: "Jordan Nico", text: "Lorem ipsum dolor sit amet...", time: "12:45 PM", unread: 1 },
      { name: "Nadila Adja", text: "Lorem ipsum dolor sit amet...", time: "12:45 PM", unread: 2 },
    ];

    const contacts = [
      { label: "Chargé OPCO", email: "mail@opco.com", phone: "09 99 99 99" },
      { label: "Chargé OPCO", email: "mail@opco.com", phone: "09 99 99 99" },
      { label: "Chargé OPCO", email: "mail@opco.com", phone: "09 99 99 99" },
    ];

    const ecoles = ["ESEO", "EFREI", "EPITA"];
    const entreprises = ["AXA", "DASSAULT SYSTEMS", "CAPGEMINI"];

    return (
      <main className="min-h-fit  bg-[#F3F4FF] text-slate-900">
        {/* <TopNav /> */}

        <div className=" w-full px-6 py-8 space-y-6">

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

            <div className="lg:col-span-3 space-y-8">
              <div className="flex items-center justify-between gap-4">
                <h1 className={`text-xl font-weight-900 font-extrabold text-[#1f1b4a] lg:text-3xl ${fonts.className}`}>Page d'accueil</h1>
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

              <Card className="overflow-hidden border-none shadow-md rounded-3xl pt-0 bg-white">
                <div className="relative h-32 bg-gradient-to-r rounded-t-3xl from-[#2a176e] via-[#422c9f] to-[#6a51de] overflow-hidden">
                  {/* from-[#2a176e] via-[#4b27a8] to-[#ffb32c] */}
                  <div className="absolute left-50 md:right-32 bottom-[-28px] h-24 w-24 rounded-full z-20 bg-[#ffb32c]" />
                  <div className="absolute left-45 md:right-45 bottom-[-35px] h-20 w-20 rounded-full z-10 bg-[#f05d7f]" />
                </div>
                <CardContent className="flex flex-wrap items-center gap-6 px-6 pb-6">
                  <Avatar className="h-20 w-20 border-4 border-white -mt-12 shadow-md">
                    <AvatarFallback className="bg-[#c8bdf7] text-[#1f1b4a] text-xl">{user.name ? user.name.charAt(0).toUpperCase() : "U"}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 p-b-4">
                    <p className="text-xl font-bold text-[#1f1b4a]">{session?.user?.name}</p>
                    <p className="text-sm/5 text-slate-500">{session?.user?.role ? "Coordonateur(rice) apprentissage" : ""}</p>
                  </div>
                  <div className="ml-auto grid grid-cols-2 gap-x-1 gap-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 md:h-9 md:w-9 rounded-full bg-[#ffe7dd] flex items-center justify-center text-[#ff7c4c]">
                        <Phone className="h-2 w-2 md:h-4 md:w-4" />
                      </span>
                      <div>
                        <p className="text-xs text-slate-500">Téléphone</p>
                        <p className="font-semibold">test</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 md:h-9 md:w-9 rounded-full bg-[#ffe7dd] flex items-center justify-center text-[#ff7c4c]">
                        <Mail className="h-2 w-2 md:h-4 md:w-4" />
                      </span>
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="font-semibold text-sm">{session?.user?.email}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Utilisateurs */}
                <Card className="rounded-3xl bg-white md:col-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-[#1f1b4a]">Utilisateurs</CardTitle>
                    <p className="text-xs text-slate-500">{ users.length} utilisateurs trouvés</p>
                  </CardHeader>
                  <CardContent>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Chercher..."
                        className="pl-10 rounded-full bg-[#f7f7fb] border-slate-200"
                      />
                    </div>
                    <ScrollArea className="h-96 pr-2 space-y-2 gap-2">
                      {usersFilter.map((u) => {const roleLabel = {
                          APPRENTI: "Apprenti",
                          MA: "Maître d'apprentissage",
                          CA: "Coordonateur(trice) apprentissage",
                          }[u.role] ?? "";
                        return (
                        <div
                          key={u.id}
                          className={`flex items-center justify-between gap-5 m-3 rounded-2xl border px-3 py-2 ${u.active
                            ? "bg-[#f0ecff] border-[#d5cdf8]"
                            : "bg-white border-slate-200"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-[#c8bdf7] text-[#1f1b4a]">
                                {u.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-semibold text-[#1f1b4a]">{u.name}</p>
                              <p className="text-xs text-slate-500">{roleLabel}</p>
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-9 w-9 rounded-full border-[#d5cdf8] text-[#4a27a8] hover:bg-[#f0ecff]"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )})}
                    </ScrollArea>
                    <Button
                      variant="ghost"
                      className="mt-4 w-full rounded-full bg-[#f1edf8] text-[#1f1b4a] hover:bg-[#e7e0f6]"
                    >
                      Voir plus
                    </Button>
                  </CardContent>
                </Card>

                {/* Notifications */}
                <Card className="rounded-3xl bg-white md:col-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-[#1f1b4a]">Notifications</CardTitle>
                    <p className="text-xs text-slate-500">74 personnes trouvées</p>
                  </CardHeader>
                  <CardContent>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Search here..."
                        className="pl-10 rounded-full bg-[#f7f7fb] border-slate-200"
                      />
                    </div>
                    <ScrollArea className="h-96 pr-2 space-y-2 gap-2">
                      {notifications.map((n) => (
                        <div
                          key={n.name + n.time}
                          className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 m-3 hover:bg-[#f7f7fb]"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-[#c8bdf7] text-[#1f1b4a]">
                                {n.name
                                  .split(" ")
                                  .map((p) => p[0])
                                  .join("")
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-0.5">
                              <p className="text-sm font-semibold text-[#1f1b4a]">{n.name}</p>
                              <p className="text-xs text-slate-500">{n.text}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="text-xs text-slate-400">{n.time}</p>
                            <Badge className="rounded-full bg-[#ff7c4c] text-white px-2 py-1 text-[10px]">
                              {n.unread}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                    <Button
                      variant="ghost"
                      className="mt-4 w-full rounded-full bg-[#f1edf8] text-[#1f1b4a] hover:bg-[#e7e0f6]"
                    >
                      Voir plus
                    </Button>
                  </CardContent>
                </Card>

                {/* Colonne droite */}

              </div>
            </div>

            <div className="w-full p-5 bg-white md:col-span-1">
              <div className="hidden items-center justify-end gap-3 text-sm bg-white px-3 py-2 lg:flex">
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#1f1b4a]">{session?.user?.name}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-500">{session?.user?.role}</p>
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-[#c8bdf7] text-[#1f1b4a]">NA</AvatarFallback>
                </Avatar>
              </div>

              <div className="lg:col-span-1 bg-white space-y-4">
                <Card className="rounded-3xl border-none bg-gradient-to-br from-[#2a176e] via-[#422c9f] to-[#6a51de] text-white shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Contact importants</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {contacts.map((c, idx) => (
                      <div key={idx} className="space-y-1">
                        <p className="text-sm font-semibold">{c.label}</p>
                        <p className="text-xs text-white/80">{c.email} — {c.phone}</p>
                        {idx < contacts.length - 1 && <Separator className="bg-white/20" />}
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <div className="grid grid-cols-1 lg:space-y-0  lg:grid-rows-2 gap-5">
                  <Card className=" rounded-none col-span-1 shadow-none border-none px-2 bg-white lg:row-span-1">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-[#1f1b4a]">Ecoles rattachées</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {ecoles.map((e) => (
                        <div key={e} className="flex items-center gap-3 rounded-xl px-2 py-2">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-[#c8bdf7] text-[#1f1b4a] text-[10px]">LOGO</AvatarFallback>
                          </Avatar>
                          <p className="text-sm font-semibold text-[#1f1b4a]">{e}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="rounded-none  col-span-1 sm:col-start-2 shadow-none border-none bg-white lg:row-start-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-[#1f1b4a]">Entreprises rattachées</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {entreprises.map((e) => (
                        <div key={e} className="flex items-center gap-3 rounded-xl px-2 py-2">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-[#c8bdf7] text-[#1f1b4a] text-[10px]">LOGO</AvatarFallback>
                          </Avatar>
                          <p className="text-sm font-semibold text-[#1f1b4a]">{e}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    );
  }

}
