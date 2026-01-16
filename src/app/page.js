import { prisma } from "@/lib/prisma";
import { getUser, getSession, requireRole } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import TopNav from "../components/TopNav";
import { fonts } from "../app/font";
import { Search, Mail, Phone, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import DropdownMenuUser from "@/components/DropdownMenuUser";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import UploadDashboard from "@/components/dashboard/UploadDashboard";
import HomePageCA from "@/components/homePage/HomePageCA";
import ApprentiCalendar from "@/components/calendar/CalendarManagement";
import ApprentiCalendarWrapper from "@/components/calendar/ApprentiCalendarWrapper";

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

// ------------------------- MA -------------------------
// Récupère les infos du MA + ses apprentis + activités récentes
async function getMaDashboardData(userId) {
  const ma = await prisma.ma.findUnique({
    where: { userId },
    include: {
      user: true,
      apprenti: {
        include: {
          user: true,
          journalAssignments: { include: { template: true } },
        },
      },
    },
  });

  if (!ma) {
    return { ma: null, apprentices: [], notifications: [] };
  }

  // ===== Mes apprentis (inchangé) =====
  const apprentices = ma.apprenti.map((a) => ({
    id: a.id,
    name: a.user?.name ?? "",
    subName: a.user?.subName ?? "",
    email: a.user?.email ?? "",
  }));

  // ===== Activités récentes - JOURNAUX (comme avant, format proche) =====
  const journalNotifs = ma.apprenti.flatMap((a) =>
    (a.journalAssignments ?? []).map((assign) => ({
      id: `journal-${assign.id}`,
      type: "JOURNAL",
      apprentiName: `${a.user?.name ?? ""} ${a.user?.subName ?? ""}`.trim(),
      templateTitle: assign.template?.Titre || assign.template?.code || "Journal",
      statut: assign.statut,
      createdAt: assign.createdAt,
    }))
  );

  // ===== Activités récentes - ENTRETIENS (nouveau) =====
  const apprentiIds = ma.apprenti.map((a) => a.id);

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
    statut: "PLANIFIE", // affichage
    createdAt: e.createdAt,
    entretien: {
      date: e.date,
      heure: e.heure,
      participants: e.participants,
    },
  }));

  // ===== Fusion + tri =====
  const notifications = [...journalNotifs, ...entretienNotifs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  return { ma, apprentices, notifications };
}


// ==========================
// PAGE PRINCIPALE
// ==========================
export default async function HomePage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const user = await getUser();
  if (!user) redirect("/login");
  
  console.log("User info:", user.role);
  console.log("Session info:", session.user.role);

  // ==========================
  // APPRENTI
  // ==========================
  if (session.user.role === "APPRENTI") {
    requireRole(session, "home:apprenti:view");

    const assignments = await prisma.journalAssignment.findMany({
      where: { apprentiId: user.id },
      include: { template: true },
      orderBy: { createdAt: "desc" },
    });

    const total = assignments.length;
    const enCours = assignments.filter((a) => a.statut === "EN_COURS").length;
    const enRetard = assignments.filter((a) => a.statut === "EN_RETARD").length;
    const termines = assignments.filter((a) => a.statut === "TERMINE").length;

    const nextDeadline = assignments
      .filter((a) => a.template?.deadline && a.statut !== "TERMINE")
      .sort((a, b) => new Date(a.template.deadline) - new Date(b.template.deadline))[0];

    const prochains = assignments
      .filter((a) => a.statut === "EN_COURS" || a.statut === "EN_RETARD")
      .slice(0, 5);

    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-100 to-sky-50">
        <TopNav role="APPRENTI" />

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

          {/* Section Upload Documents */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">
              Mes documents
            </h2>
            <UploadDashboard user={session.user} />
          </section>
        </div>
      </main>
    );
  }

  // ==========================
  // MA
  // ==========================
  if (session?.user?.role === "MA") {
    requireRole(session, "home:ma:view");

    const { ma, apprentices, notifications } = await getMaDashboardData(user.id);

    // Fallback si MA pas trouvé en DB
    if (!ma) {
      return (
        <main className="min-h-screen bg-[#F3F4FF] text-slate-900">
          <TopNav role="MA" />
          <div className="w-full px-6 py-8">
            <Card className="rounded-3xl bg-white border-slate-200 shadow-sm max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="text-[#1f1b4a]">Compte MA non lié</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-600 text-sm">
                Vous êtes connecté en tant que MA, mais aucun enregistrement MA n'est lié à ce compte.
              </CardContent>
            </Card>
          </div>
        </main>
      );
    }

    const fullName =
      `${ma.user?.name ?? ""} ${ma.user?.subName ?? ""}`.trim() ||
      session?.user?.name ||
      "MA";

    const contacts = [
      { label: "Référent CFA", email: "cfa@ecole.fr", phone: "01 00 00 00 00" },
      { label: "Chargé OPCO", email: "opco@opco.fr", phone: "09 99 99 99 99" },
    ];
    const ecoles = ["ESEO", "EFREI", "EPITA"];
    const entreprises = ["AXA", "DASSAULT SYSTEMS", "CAPGEMINI"];

    return (
      <main className="min-h-fit bg-[#F3F4FF] text-slate-900">
        <TopNav role="MA" />

        <div className="w-full px-6 py-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            {/* COLONNE GAUCHE */}
            <div className="lg:col-span-3 space-y-8">
              {/* Header + search + dropdown (mobile) */}
              <div className="flex items-center justify-between gap-4">
                <h1
                  className={`text-xl font-extrabold text-[#1f1b4a] lg:text-3xl ${fonts.className}`}
                >
                  Tableau de bord MA
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
                      <p className="text-sm font-semibold text-[#1f1b4a]">
                        {fullName}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        {session?.user?.role}
                      </p>
                    </div>
                    <DropdownMenuUser name={user.name} email={user.email} />
                  </div>
                </div>
              </div>

              {/* Carte profil MA */}
              <Card className="overflow-hidden border-none shadow-md rounded-3xl pt-0 bg-white">
                <div className="relative h-32 bg-gradient-to-r rounded-t-3xl from-[#2a176e] via-[#422c9f] to-[#6a51de] overflow-hidden">
                  <div className="absolute left-50 md:right-32 bottom-[-28px] h-24 w-24 rounded-full z-20 bg-[#ffb32c]" />
                  <div className="absolute left-45 md:right-45 bottom-[-35px] h-20 w-20 rounded-full z-10 bg-[#f05d7f]" />
                </div>

                <CardContent className="flex flex-wrap items-center gap-6 px-6 pb-6">
                  <Avatar className="h-20 w-20 border-4 border-white -mt-12 shadow-md">
                    <AvatarFallback className="bg-[#c8bdf7] text-[#1f1b4a] text-xl">
                      {(fullName || "MA")
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
                    <p className="text-sm text-slate-500">MA</p>
                  </div>

                  <div className="ml-auto grid grid-cols-2 gap-x-1 gap-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 md:h-9 md:w-9 rounded-full bg-[#ffe7dd] flex items-center justify-center text-[#ff7c4c]">
                        <Phone className="h-2 w-2 md:h-4 md:w-4" />
                      </span>
                      <div>
                        <p className="text-xs text-slate-500">Téléphone</p>
                        <p className="font-semibold">{ma.user?.phone ?? "—"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 md:h-9 md:w-9 rounded-full bg-[#ffe7dd] flex items-center justify-center text-[#ff7c4c]">
                        <Mail className="h-2 w-2 md:h-4 md:w-4" />
                      </span>
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="font-semibold text-sm">
                          {ma.user?.email ?? session?.user?.email ?? "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 2 cards : Apprentis + Notifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Apprentis */}
                <Card className="rounded-3xl bg-white md:col-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-[#1f1b4a]">
                      Mes apprentis
                    </CardTitle>
                    <Link
                      href="/MA/liste_apprentis"
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
                                href={`/journal/ma/${a.id}`}
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
                      href="/MA/liste_apprentis"
                      className="mt-4 inline-flex w-full justify-center rounded-full bg-[#f1edf8] text-[#1f1b4a] hover:bg-[#e7e0f6] px-4 py-2 text-sm font-medium"
                    >
                      Voir plus
                    </Link>
                  </CardContent>
                </Card>

                {/* Notifications */}
                <Card className="rounded-3xl bg-white md:col-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-[#1f1b4a]">
                      Activités récentes
                    </CardTitle>
                    <p className="text-xs text-slate-500">
                      Derniers journaux mis à jour
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

                                {/* Ligne secondaire */}
                                {n.type === "ENTRETIEN" ? (
                                  <p className="text-xs text-slate-500"> A programmé un entretien avec vous le 
                                    {/*n.templateTitle} —*/} {formatDate(n.entretien?.date)} à {n.entretien?.heure}
                                  </p>
                                ) : (
                                  <p className="text-xs text-slate-500">
                                    {n.templateTitle} — {n.statut.replace("_", " ")}
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
            </div>

            {/* COLONNE DROITE */}
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
                    {(fullName || "MA")
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

  // ==========================
  // CA
  // ==========================
  if (session?.user?.role === "CA") {
    requireRole(session, "home:ca:view");

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
      <main className="min-h-fit bg-[#F3F4FF] text-slate-900">
        <TopNav role="CA" />

        <div className="w-full px-6 py-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-3 space-y-8">
              <div className="flex items-center justify-between gap-4">
                <h1 className={`text-xl font-weight-900 font-extrabold text-[#1f1b4a] lg:text-3xl ${fonts.className}`}>Page d'accueil</h1>
                <div className="flex items-center gap-3">
                  <div className="relative w-30 lg:w-72">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Chercher ici..."
                      className="text-sm/10 pl-10 rounded-full bg-white border-slate-200 shadow-sm"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 text-sm px-3 py-2 lg:hidden">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#1f1b4a]">{session?.user?.name}</p>
                      <p className="text-xs uppercase tracking-wide text-slate-500">{session?.user?.role}</p>
                    </div>
                    <DropdownMenuUser name={user.name} email={user.email} />
                  </div>
                </div>
              </div>

              <Card className="overflow-hidden border-none shadow-md rounded-3xl pt-0 bg-white">
                <div className="relative h-32 bg-gradient-to-r rounded-t-3xl from-[#2a176e] via-[#422c9f] to-[#6a51de] overflow-hidden">
                  <div className="absolute left-50 md:right-32 bottom-[-28px] h-24 w-24 rounded-full z-20 bg-[#ffb32c]" />
                  <div className="absolute left-45 md:right-45 bottom-[-35px] h-20 w-20 rounded-full z-10 bg-[#f05d7f]" />
                </div>
                <CardContent className="flex flex-wrap items-center gap-6 px-6 pb-6">
                  <Avatar className="h-20 w-20 border-4 border-white -mt-12 shadow-md">
                    <AvatarFallback className="bg-[#c8bdf7] text-[#1f1b4a] text-xl">NA</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 p-b-4">
                    <p className="text-xl font-bold text-[#1f1b4a]">{session?.user?.name}</p>
                    <p className="text-sm text-slate-500">{session?.user?.role}</p>
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
                    <p className="text-xs text-slate-500">74 personnes trouvées</p>
                  </CardHeader>
                  <CardContent>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Chercher..."
                        className="pl-10 rounded-full bg-[#f7f7fb] border-slate-200"
                      />
                    </div>
                    <ScrollArea className="h-96 pr-2 space-y-2 gap-2">
                      {utilisateurs.map((u) => (
                        <div
                          key={u.name}
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
                              <p className="text-xs text-slate-500">{u.info}</p>
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-9 w-9 rounded-full border-[#d5cdf8] text-[#4a27a8] hover:bg-[#f0ecff]"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
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
                <div className="grid grid-cols-1 lg:space-y-0 lg:grid-rows-2 gap-5">
                  <Card className="rounded-none col-span-1 shadow-none border-none px-2 bg-white lg:row-span-1">
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

                  <Card className="rounded-none col-span-1 sm:col-start-2 shadow-none border-none bg-white lg:row-start-2">
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

  // ==========================
  // TP
  // ==========================
  if (session.user.role === "TP") {
    requireRole(session, "home:tp:view");
     redirect("/TP/Accueil");
  }

  // ==========================
  // FALLBACK
  // ==========================
  return (
    <main className="min-h-screen p-8 bg-slate-100">
      <h1 className="text-2xl font-bold">
        Bonjour {session.user.firstName} {session.user.lastName}
      </h1>
      <p className="text-gray-600">
        Rôle non reconnu: {session.user.role}
      </p>
    </main>
  );
}