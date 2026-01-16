import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Link from "next/link";

import TopNav from "@/components/TopNav";
import DropdownMenuUser from "@/components/DropdownMenuUser";
import ApprentiCalendarWrapper from "@/components/calendar/ApprentiCalendarWrapper";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { Mail, Search, AlertCircle, Phone } from "lucide-react";

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

async function getTPData(userId) {
  try {
    const tp = await prisma.tp.findUnique({
      where: { userId },
      include: {
        user: true,
        apprenti: {
          include: {
            user: true,
            journalAssignments: {
              include: { template: true },
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });

    if (!tp) return { tp: null, apprentices: [], notifications: [] };

    // Apprentis (name/subName comme MA)
    const apprentices = (tp.apprenti || []).map((a) => ({
      id: a.id,
      name: a.user?.name ?? "",
      subName: a.user?.subName ?? "",
      email: a.user?.email ?? "",
    }));

    // Activités: journaux (name/subName)
    const journalNotifs = (tp.apprenti || []).flatMap((a) =>
      (a.journalAssignments || []).map((j) => ({
        id: `journal-${j.id}`,
        type: "JOURNAL",
        apprentiName: `${a.user?.name ?? ""} ${a.user?.subName ?? ""}`.trim(),
        templateTitle: j.template?.Titre || j.template?.code || "Journal",
        statut: j.statut || "En attente",
        createdAt: j.createdAt,
      }))
    );

    // Activités: entretiens (name/subName)
    const apprentiIds = (tp.apprenti || []).map((a) => a.id);

    const entretiens = await prisma.entretien.findMany({
      where: { apprentiId: { in: apprentiIds } },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { apprenti: { include: { user: true } } },
    });

    const entretienNotifs = entretiens.map((e) => ({
      id: `entretien-${e.id}`,
      type: "ENTRETIEN",
      apprentiName: `${e.apprenti?.user?.name ?? ""} ${e.apprenti?.user?.subName ?? ""}`.trim(),
      templateTitle: e.theme || "Entretien",
      statut: "PLANIFIE",
      createdAt: e.createdAt,
      entretien: {
        date: e.date,
        heure: e.heure,
        participants: e.participants,
      },
    }));

    // Activités: événements du calendrier
    const events = await prisma.event.findMany({
      where: { apprentiId: { in: apprentiIds } },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { apprenti: { include: { user: true } } },
    });

    const eventNotifs = events.map((ev) => ({
      id: `event-${ev.id}`,
      type: "EVENEMENT",
      apprentiName: `${ev.apprenti?.user?.name ?? ""} ${ev.apprenti?.user?.subName ?? ""}`.trim(),
      templateTitle: ev.title || "Événement",
      statut: "PLANIFIE",
      createdAt: ev.createdAt,
      event: {
        date: ev.date,
        description: ev.description,
      },
    }));

    // Fusion + tri
    const notifications = [...journalNotifs, ...entretienNotifs, ...eventNotifs]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);

    return { tp, apprentices, notifications };
  } catch (error) {
    console.error("❌ Erreur dans getTPData:", error);
    return { tp: null, apprentices: [], notifications: [] };
  }
}

export default async function TPAccueilPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const user = session.user;
  if (user.role !== "TP") redirect("/");

  const { tp, apprentices, notifications } = await getTPData(user.id);

  // Fallback si TP pas trouvé en DB
  if (!tp) {
    return (
      <main className="min-h-screen bg-[#F3F4FF] text-slate-900">
        <div className="w-full px-6 py-8">
          <Card className="rounded-3xl bg-white border-slate-200 shadow-sm max-w-3xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-orange-500" />
                <CardTitle className="text-[#1f1b4a]">Compte TP non lié</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-slate-600 text-sm space-y-3">
              <p>
                Vous êtes connecté en tant que <Badge>TP</Badge>, mais aucun
                enregistrement TP n&apos;est lié à ce compte.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <p className="font-semibold mb-2">Informations de votre compte :</p>
                <ul className="text-sm space-y-1">
                  <li>• ID utilisateur : {user.id}</li>
                  <li>• Email : {user.email}</li>
                  <li>• Nom : {user.name ?? "—"} {user.subName ?? ""}</li>
                  <li>• Rôle : {user.role}</li>
                </ul>
              </div>
              <Button asChild className="w-full rounded-full">
                <Link href="/">Retour à l&apos;accueil</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // FullName basé sur la DB (comme MA), fallback session/email
  const fullName =
    `${tp.user?.name ?? ""} ${tp.user?.subName ?? ""}`.trim() ||
    `${user.name ?? ""} ${user.subName ?? ""}`.trim() ||
    user.email ||
    "TP";

  // Colonne droite (comme MA)
  const contacts = [
    { label: "Chargé OPCO", email: "mail@opco.com", phone: "09 99 99 99 99" },
    { label: "Responsable pédagogique", email: "pedago@ecole.fr", phone: "01 22 33 44 55" },
  ];
  const ecoles = ["ESEO", "EFREI", "EPITA"];
  const entreprises = ["AXA", "DASSAULT SYSTEMS", "CAPGEMINI"];

  return (
    <main className="min-h-fit bg-[#F3F4FF] text-slate-900">
      <TopNav role="TP" user={user} />
      <div className="w-full px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* ===================== COLONNE GAUCHE ===================== */}
          <div className="lg:col-span-3 space-y-8">
            {/* Header + search + dropdown (mobile) */}
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-xl font-extrabold text-[#1f1b4a] lg:text-3xl">
                Tableau de bord TP
              </h1>

              <div className="flex items-center gap-3">
                <div className="relative w-30 lg:w-72">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Chercher un apprenti..."
                    className="text-sm/10 pl-10 rounded-full bg-white border-slate-200 shadow-sm"
                  />
                </div>

                {/* Mobile user block */}
                <div className="flex items-center justify-end gap-3 text-sm px-3 py-2 lg:hidden">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#1f1b4a]">{fullName}</p>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      {session?.user?.role}
                    </p>
                  </div>
                  <DropdownMenuUser name={fullName} email={user.email} />
                </div>
              </div>
            </div>

            {/* Carte profil TP (style MA) */}
            <Card className="overflow-hidden border-none shadow-md rounded-3xl pt-0 bg-white">
              <div className="relative h-32 bg-gradient-to-r rounded-t-3xl from-[#2a176e] via-[#422c9f] to-[#6a51de] overflow-hidden">
                <div className="absolute left-50 md:right-32 bottom-[-28px] h-24 w-24 rounded-full z-20 bg-[#ffb32c]" />
                <div className="absolute left-45 md:right-45 bottom-[-35px] h-20 w-20 rounded-full z-10 bg-[#f05d7f]" />
              </div>

              <CardContent className="flex flex-wrap items-center gap-6 px-6 pb-6">
                <Avatar className="h-20 w-20 border-4 border-white -mt-12 shadow-md">
                  <AvatarFallback className="bg-[#c8bdf7] text-[#1f1b4a] text-xl">
                    {(fullName || "TP")
                      .split(" ")
                      .filter(Boolean)
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                  <p className="text-xl font-bold text-[#1f1b4a]">{fullName}</p>
                  <p className="text-sm text-slate-500">TP</p>
                </div>

                <div className="ml-auto grid grid-cols-2 gap-x-1 gap-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 md:h-9 md:w-9 rounded-full bg-[#ffe7dd] flex items-center justify-center text-[#ff7c4c]">
                      <Phone className="h-2 w-2 md:h-4 md:w-4" />
                    </span>
                    <div>
                      <p className="text-xs text-slate-500">Téléphone</p>
                      <p className="font-semibold">{tp?.user?.phone ?? "—"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 md:h-9 md:w-9 rounded-full bg-[#ffe7dd] flex items-center justify-center text-[#ff7c4c]">
                      <Mail className="h-2 w-2 md:h-4 md:w-4" />
                    </span>
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="font-semibold text-sm">
                        {tp?.user?.email ?? user.email ?? "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2 cards : Apprentis + Activités récentes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Apprentis */}
              <Card className="rounded-3xl bg-white md:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-[#1f1b4a]">Mes apprentis</CardTitle>
                  <Link
                    href="/TP/liste_apprentis"
                    className="inline-flex w-full justify-center items-center gap-2 rounded-full bg-blue-600 text-white text-sm font-medium px-5 py-3 hover:bg-blue-700 transition shadow-sm"
                  >
                    Ouvrir la liste des apprentis →
                  </Link>
                  <p className="text-xs text-slate-500">
                    {apprentices.length} apprenti(s) rattaché(s)
                  </p>
                </CardHeader>

                <CardContent>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Chercher..."
                      className="pl-10 rounded-full bg-[#f7f7fb] border-slate-200"
                    />
                  </div>

                  <ScrollArea className="h-96 pr-2">
                    <div className="space-y-2">
                      {apprentices.map((a) => {
                        const initials = `${a.name ?? ""} ${a.subName ?? ""}`
                          .trim()
                          .split(" ")
                          .filter(Boolean)
                          .map((p) => p[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase();

                        return (
                          <div
                            key={a.id}
                            className="flex items-center justify-between gap-5 m-3 rounded-2xl border px-3 py-2 bg-white border-slate-200 hover:bg-[#f7f7fb]"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-[#c8bdf7] text-[#1f1b4a]">
                                  {initials || "A"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-semibold text-[#1f1b4a]">
                                  {a.name} {a.subName}
                                </p>
                                <p className="text-xs text-slate-500">{a.email}</p>
                              </div>
                            </div>

                            <Link
                              href={`/journal/tp/${a.id}`}
                              className="text-xs text-blue-700 hover:color-red-900 font-medium"
                            >
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-[#c8bdf7] text-[#1f1b4a] text-[10px]">
                                  PLUS
                                </AvatarFallback>
                              </Avatar>
                            </Link>
                          </div>
                        );
                      })}

                      {apprentices.length === 0 && (
                        <div className="m-3 text-sm text-slate-500">
                          Aucun apprenti rattaché pour le moment.
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  <Link
                    href="/TP/liste_apprentis"
                    className="mt-4 inline-flex w-full justify-center rounded-full bg-[#f1edf8] text-[#1f1b4a] hover:bg-[#e7e0f6] px-4 py-2 text-sm font-medium"
                  >
                    Voir plus
                  </Link>
                </CardContent>
              </Card>

              {/* Activités récentes */}
              <Card className="rounded-3xl bg-white md:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-[#1f1b4a]">Activités récentes</CardTitle>
                  <p className="text-xs text-slate-500">
                    Derniers journaux, entretiens et événements
                  </p>
                </CardHeader>

                <CardContent>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Filtrer..."
                      className="pl-10 rounded-full bg-[#f7f7fb] border-slate-200"
                    />
                  </div>

                  <ScrollArea className="h-96 pr-2">
                    <div className="space-y-2">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 m-3 hover:bg-[#f7f7fb]"
                        >
                          <div className="space-y-0.5">
                            <p className="text-sm font-semibold text-[#1f1b4a]">
                              {n.apprentiName}
                            </p>

                            {n.type === "ENTRETIEN" ? (
                              <p className="text-xs text-slate-500">
                                A programmé un entretien le {formatDate(n.entretien?.date)} à{" "}
                                {n.entretien?.heure}
                              </p>
                            ) : n.type === "EVENEMENT" ? (
                              <p className="text-xs text-slate-500">
                                {n.templateTitle} — {formatDate(n.event?.date)}
                              </p>
                            ) : (
                              <p className="text-xs text-slate-500">
                                {n.templateTitle} — {String(n.statut || "").replace("_", " ")}
                              </p>
                            )}
                          </div>

                          <Badge className="rounded-full bg-[#ff7c4c] text-white px-2 py-1 text-[10px]">
                            {formatDate(n.createdAt)}
                          </Badge>
                        </div>
                      ))}

                      {notifications.length === 0 && (
                        <div className="m-3 text-sm text-slate-500">
                          Aucune activité récente.
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  <Button
                    variant="ghost"
                    className="mt-4 w-full rounded-full bg-[#f1edf8] text-[#1f1b4a] hover:bg-[#e7e0f6]"
                  >
                    Voir plus
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Calendrier */}
            <Card className="rounded-3xl bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-[#1f1b4a]">Calendrier</CardTitle>
                <p className="text-xs text-slate-500">
                  Gérez les événements de vos apprentis
                </p>
              </CardHeader>
              <CardContent>
                <ApprentiCalendarWrapper userId={user.id} userRole="TP" />
              </CardContent>
            </Card>
          </div>

          {/* ===================== COLONNE DROITE ===================== */}
          <div className="w-full p-5 bg-white md:col-span-1">
            <div className="hidden items-center justify-end gap-3 text-sm bg-white px-3 py-2 lg:flex">
              <div className="text-right">
                <p className="text-sm font-semibold text-[#1f1b4a]">{fullName}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {session?.user?.role}
                </p>
              </div>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-[#c8bdf7] text-[#1f1b4a]">
                  {(fullName || "TP")
                    .split(" ")
                    .filter(Boolean)
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="lg:col-span-1 bg-white space-y-4">
              {/* Contacts importants */}
              <Card className="rounded-3xl border-none bg-gradient-to-br from-[#2a176e] via-[#422c9f] to-[#6a51de] text-white shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Contacts importants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {contacts.map((c, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-sm font-semibold">{c.label}</p>
                      <p className="text-xs text-white/80">
                        {c.email} — {c.phone}
                      </p>
                      {idx < contacts.length - 1 && (
                        <Separator className="bg-white/20" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:space-y-0 lg:grid-rows-2 gap-5">
                {/* Ecoles */}
                <Card className="rounded-none col-span-1 shadow-none border-none px-2 bg-white lg:row-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-[#1f1b4a]">
                      Écoles rattachées
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {ecoles.map((e) => (
                      <div key={e} className="flex items-center gap-3 rounded-xl px-2 py-2">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-[#c8bdf7] text-[#1f1b4a] text-[10px]">
                            LOGO
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-semibold text-[#1f1b4a]">{e}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Entreprises */}
                <Card className="rounded-none col-span-1 sm:col-start-2 shadow-none border-none bg-white lg:row-start-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-[#1f1b4a]">
                      Entreprises rattachées
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {entreprises.map((e) => (
                      <div key={e} className="flex items-center gap-3 rounded-xl px-2 py-2">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-[#c8bdf7] text-[#1f1b4a] text-[10px]">
                            LOGO
                          </AvatarFallback>
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
