import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DropdownMenuUser from "@/components/DropdownMenuUser";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, Search, AlertCircle } from "lucide-react";

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
    console.log("🔍 Recherche profil TP pour userId:", userId);
    
    const tp = await prisma.tp.findUnique({
      where: { userId },
      include: {
        user: true,
        apprenti: {
          include: {
            user: true,
            journalAssignments: { 
              include: { 
                template: true 
              },
              orderBy: {
                createdAt: 'desc'
              }
            },
          },
        },
      },
    });

    console.log("📊 Résultat recherche TP:", {
      found: !!tp,
      tpId: tp?.id,
      apprentisCount: tp?.apprenti?.length || 0
    });

    if (!tp) {
      console.warn("⚠️ Aucun profil TP trouvé pour userId:", userId);
      return { tp: null, apprentices: [], notifications: [] };
    }

    const apprentices = (tp.apprenti || []).map((a) => ({
      id: a.id,
      name: a.user?.firstName ?? "",
      lastName: a.user?.lastName ?? "",
      email: a.user?.email ?? "",
      journals: a.journalAssignments ?? [],
    }));

    const notifications = (tp.apprenti || [])
      .flatMap((a) =>
        (a.journalAssignments || []).map((j) => ({
          id: j.id,
          apprentiName: `${a.user?.firstName ?? ""} ${a.user?.lastName ?? ""}`.trim(),
          templateTitle: j.template?.Titre || j.template?.code || "Journal",
          statut: j.statut || "En attente",
          createdAt: j.createdAt,
        }))
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);

    console.log("✅ Données TP récupérées:", {
      apprentices: apprentices.length,
      notifications: notifications.length
    });

    return { tp, apprentices, notifications };
  } catch (error) {
    console.error("❌ Erreur dans getTPData:", error);
    return { tp: null, apprentices: [], notifications: [] };
  }
}

export default async function TPAccueilPage() {
  try {
    console.log("🚀 === Début TPAccueilPage ===");
    
    const session = await getSession();
    
    if (!session?.user) {
      console.log("❌ Pas de session, redirection vers /login");
      redirect("/login");
    }

    const user = session.user;
    console.log("👤 Utilisateur connecté:", {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    });

    // Vérification du rôle TP
    if (user.role !== "TP") {
      console.log("❌ Rôle incorrect:", user.role, "- Redirection vers /");
      redirect("/");
    }

    console.log("✅ Rôle TP vérifié");

    const { tp, apprentices, notifications } = await getTPData(user.id);

    // Si pas de profil TP, afficher un message au lieu de rediriger
    if (!tp) {
      console.warn("⚠️ Pas de profil TP - Affichage message d'erreur");
      
      return (
        <div className="min-h-screen w-full bg-[#F4F5FF] p-8">
          <Card className="max-w-2xl mx-auto mt-20 border-2 border-orange-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-orange-500" />
                <CardTitle className="text-xl">Profil TP non configuré</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">
                Votre compte utilisateur est bien configuré avec le rôle <Badge>TP</Badge>, 
                mais aucun profil de Tuteur Pédagogique n'a été créé dans la base de données.
              </p>
              <div className="bg-slate-100 p-4 rounded-lg">
                <p className="font-semibold mb-2">Informations de votre compte :</p>
                <ul className="text-sm space-y-1">
                  <li>• ID utilisateur : {user.id}</li>
                  <li>• Email : {user.email}</li>
                  <li>• Nom : {user.firstName} {user.lastName}</li>
                  <li>• Rôle : {user.role}</li>
                </ul>
              </div>
              <p className="text-sm text-slate-500">
                Contactez un administrateur pour créer votre profil TP dans la base de données.
              </p>
              <Button asChild className="w-full">
                <Link href="/">Retour à l'accueil</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    console.log("✅ Profil TP trouvé, rendu de la page");

    const contacts = [
      { label: "Chargé OPCO", email: "mail@opco.com", phone: "09 99 99 99 99" },
      { label: "Responsable pédagogique", email: "pedago@ecole.fr", phone: "01 22 33 44 55" },
    ];

    const ecoles = ["ESEO", "EFREI", "EPITA"];
    const entreprises = ["AXA", "DASSAULT SYSTEMS", "CAPGEMINI"];

    return (
      <div className="min-h-screen w-full bg-[#F4F5FF] p-4 md:p-8">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4 w-full justify-between">
            <h1 className="text-2xl font-bold text-[#1f1b4a]">Page d'accueil</h1>
            <DropdownMenuUser name={user.firstName || user.email || "TP"} email={user.email} />
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input placeholder="Rechercher..." className="pl-10 rounded-full bg-white" />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* COLONNE PRINCIPALE (3/4) */}
          <div className="xl:col-span-3 space-y-6">
            {/* PROFIL TP */}
            <Card className="relative overflow-hidden rounded-3xl border-2 border-blue-500">
              <div className="h-28 bg-gradient-to-r from-[#4B3FBF] to-[#5E55E7]" />
              <CardContent className="relative pt-16 pb-6">
                <Avatar className="absolute -top-12 left-6 h-24 w-24 border-4 border-white">
                  <AvatarFallback className="bg-[#c8bdf7] text-[#1f1b4a] text-xl">
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="pl-0 md:pl-32">
                    <h2 className="text-xl font-bold text-[#1f1b4a]">
                      {user.firstName} {user.lastName}
                    </h2>
                    <Badge className="mt-1 bg-[#ECEBFF] text-[#4B3FBF]">TP</Badge>
                  </div>

                  <div className="flex gap-6 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-orange-500" />
                      <span className="truncate max-w-[220px]">{user.email}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CARTE APPRENTIS */}
            <Card className="rounded-3xl bg-white">
              <CardHeader>
                <CardTitle>Mes apprentis</CardTitle>
                <p className="text-xs text-slate-500">{apprentices.length} apprenti(s) rattaché(s)</p>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2 pr-4">
                    {apprentices.map((a) => {
                      const initials = `${a.name} ${a.lastName}`
                        .split(" ")
                        .filter(Boolean)
                        .map((p) => p[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase();
                      return (
                        <div 
                          key={a.id} 
                          className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 bg-white border-slate-200 hover:bg-[#f7f7fb] transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Avatar className="h-10 w-10 flex-shrink-0">
                              <AvatarFallback className="bg-[#c8bdf7] text-[#1f1b4a]">
                                {initials || "A"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-[#1f1b4a] truncate">
                                {a.name} {a.lastName}
                              </p>
                              <p className="text-xs text-slate-500 truncate">{a.email}</p>
                            </div>
                          </div>
                          <Link 
                            href={`/journal/tp/${a.id}`} 
                            className="text-xs text-blue-700 font-medium hover:text-blue-900 flex-shrink-0"
                          >
                            PLUS
                          </Link>
                        </div>
                      );
                    })}
                    {apprentices.length === 0 && (
                      <p className="text-sm text-slate-500 p-4 text-center">
                        Aucun apprenti rattaché pour le moment.
                      </p>
                    )}
                  </div>
                </ScrollArea>
                <Button asChild className="mt-4 w-full rounded-full bg-[#f1edf8] text-[#1f1b4a] hover:bg-[#e7e0f6]">
                  <Link href="/TP/liste_apprentis">Voir plus</Link>
                </Button>
              </CardContent>
            </Card>

            {/* NOTIFICATIONS / ACTIVITÉS RÉCENTES */}
            <Card className="rounded-3xl bg-white">
              <CardHeader>
                <CardTitle>Activités récentes</CardTitle>
                <p className="text-xs text-slate-500">Derniers journaux mis à jour</p>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2 pr-4">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 hover:bg-[#f7f7fb] transition-colors"
                      >
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#1f1b4a] truncate">
                            {n.apprentiName || "Apprenti"}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {n.templateTitle} — {n.statut.replace("_", " ")}
                          </p>
                        </div>
                        <Badge className="rounded-full bg-[#ff7c4c] text-white px-2 py-1 text-[10px] whitespace-nowrap flex-shrink-0">
                          {formatDate(n.createdAt)}
                        </Badge>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <p className="text-sm text-slate-500 p-4 text-center">
                        Aucune activité récente.
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* COLONNE DROITE (1/4) */}
          <div className="xl:col-span-1 space-y-6">
            {/* CONTACTS */}
            <Card className="rounded-3xl bg-gradient-to-br from-[#3B2F8F] to-[#4B44C6] text-white">
              <CardHeader>
                <CardTitle className="text-white">Contacts importants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {contacts.map((c, i) => (
                  <div key={i} className="space-y-1">
                    <p className="font-semibold">{c.label}</p>
                    <p className="text-white/80 text-xs break-words">{c.email}</p>
                    <p className="text-white/80 text-xs">{c.phone}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* ÉCOLES */}
            <Card className="rounded-3xl bg-white">
              <CardHeader>
                <CardTitle className="text-base">Écoles rattachées</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {ecoles.map((e) => (
                  <div key={e} className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 flex-shrink-0">
                      <AvatarFallback className="bg-[#E7E5FF] text-[#4B3FBF] text-[10px]">
                        LOGO
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{e}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* ENTREPRISES */}
            <Card className="rounded-3xl bg-white">
              <CardHeader>
                <CardTitle className="text-base">Entreprises rattachées</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {entreprises.map((e) => (
                  <div key={e} className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 flex-shrink-0">
                      <AvatarFallback className="bg-[#E7E5FF] text-[#4B3FBF] text-[10px]">
                        LOGO
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{e}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("❌ Erreur fatale dans TPAccueilPage:", error);
    
    // Gestion des erreurs de redirection Next.js
    if (error.message?.includes("NEXT_REDIRECT")) {
      throw error;
    }
    
    // Autres erreurs
    redirect("/");
  }
}