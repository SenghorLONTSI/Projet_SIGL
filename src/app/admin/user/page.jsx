//todo: implémente la page qui affiche les utilisateurs pour l'admin
"use client";

import React from "react";
import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, Search, ArrowRight, UserStar, X } from "lucide-react";
import { fonts } from "../../../app/font";
import DropdownMenuUser from "@/components/DropdownMenuUser";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";
const page = () => {
  const [users, setUsers] = useState([]);
  // const [currentUser, setCurrentUser] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [maApp, setMaApp] = useState(null);
  const [tpApp, setTpApp] = useState(null);
  const [appMa, setAppMa] = useState(null);
  const [appTp, setAppTp] = useState(null);
  const [maitresApprentissage, setMaitresApprentissage] = useState([]);
  const [tuteursPedagogiques, setTuteursPedagogiques] = useState([]);
  const [apprentis, setApprentis] = useState([]);
  const [apprentiSearchText, setApprentiSearchText] = useState("");

  //todo : faire
  const currentUser = async () => {
    try {
      const res = await fetch("/api/users/me");
      if (!res.ok) {
        return null;
      }
      return await res.json();
    } catch (error) {
      console.error("Erreur lors de la recuperation du user courant:", error);
      return null;
    }
  };

  const listMaitreApprentissage = async () => {
    try {
      const res = await fetch(`/api/users?role=MA`, {
        method: "GET",
      });
      const data = await res
        .json()
        .then((data) => data.filter((user) => user.role === "MA"));
      console.log("Liste des maîtres d'apprentissage récupérée:", data);
      if (!res.ok) {
        throw new Error(
          "Erreur lors de la récupération des maîtres d'apprentissage"
        );
      }
      console.log("data maitre d'apprentissage", data);
      setMaitresApprentissage(data);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des maîtres d'apprentissage:",
        error
      );
      return [];
    }
  };

  const listTuteurPedagogique = async () => {
    try {
      const res = await fetch(`/api/users?role=TP`, {
        method: "GET",
      });
      const data = await res
        .json()
        .then((data) => data.filter((user) => user.role === "TP"));
      setTuteursPedagogiques(data);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des tuteurs pédagogiques:",
        error
      );
      return [];
    }
  };

  const listApprenti = async () => {
    try {
      const res = await fetch(`/api/users?role=APPRENTI`, {
        method: "GET",
      });
      const data = await res
        .json()
        .then((data) => data.filter((user) => user.role === "APPRENTI"));
      setApprentis(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des apprentis:", error);
      return [];
    }
  };

  const getUserById = async (id) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "GET",
      });
      const data = await res.json();
      console.log("Données utilisateur récupérées:", selectedUserId);
      setSelectedUser(data);
      switch (data.role) {
        case "APPRENTI":
          //fetch maitre d'apprentissage et tuteur pedagogique
          const apprenti = await fetch(`/api/apprenti/${id}`, {
            method: "GET",
          });
          const apprentiData = await apprenti.json();
          const maApp = apprentiData.ma;
          const tpAPP = apprentiData.tp;
          setMaApp(maApp);
          setTpApp(tpAPP);
          break;
        case "MA":
          //fetch apprentis
          const maitreApprentissage = await fetch(`/api/MA/${id}`, {
            method: "GET",
          });
          const maData = await maitreApprentissage.json();
          const apprentisData = maData.apprentis;
          setAppMa(apprentisData);
          break;
        case "TP":
          //fetch apprentis
          const tuteurPedagogique = await fetch(`/api/TP/${id}`, {
            method: "GET",
          });
          const tpData = await tuteurPedagogique.json();
          const apprentisTpData = tpData.apprentis;
          setAppTp(apprentisTpData);
          break;
        default:
          break;
      }
      console.log(data);
      if (!res.ok) {
        throw new Error("Erreur lors de la récupération de l'utilisateur");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
    }
  };
  //recuperer tous les utilisateurs
  useEffect(() => {
    const getAllUsers = async () => {
      try {
        const res = await fetch("/api/users", {
          method: "GET",
        });
        const data = await res.json();
        setUsers(data);
        // setLoadingUsers(false);

        if (!res.ok) {
          throw new Error("Erreur lors de la récupération des utilisateurs");
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des utilisateurs:",
          error
        );
      } finally {
        setLoadingUsers(false);
      }
    };

    getAllUsers();
  }, []);

  const usersFilter = useMemo(() => {
    let userTable = [...users].filter((u) => u.role !== "CA");

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      userTable = userTable.filter((a) => {
        const fullName = `${a.name ?? ""} ${a.subName ?? ""}`.toLowerCase();
        const userRole = a.role?.toLowerCase() ?? "";
        const userEmail = a.email?.toLowerCase() ?? "";

        return (
          fullName.includes(q) || userRole.includes(q) || userEmail.includes(q)
        );
      });
    }

    return userTable;
  }, [users, searchText]);

  const apprentisFilter = useMemo(() => {
    let apprentisTable = [...apprentis];

    if (apprentiSearchText.trim()) {
      const q = apprentiSearchText.toLowerCase();
      apprentisTable = apprentisTable.filter((a) => {
        const fullName = `${a.name ?? ""} ${a.subName ?? ""}`.toLowerCase();
        const userEmail = a.email?.toLowerCase() ?? "";
        return fullName.includes(q) || userEmail.includes(q);
      });
    }

    return apprentisTable;
  }, [apprentis, apprentiSearchText]);

  const apprentisForMa = useMemo(() => {
    if (selectedUser?.role !== "MA") {
      return apprentisFilter;
    }

    const assignedToCurrent = new Set((appMa ?? []).map((a) => a.userId));
    return apprentisFilter.filter(
      (app) => !app.apprenti?.idMA || assignedToCurrent.has(app.id)
    );
  }, [apprentisFilter, selectedUser?.role, appMa]);

  const form = useForm({
    defaultValues: {
      maApprenti: maApp?.userId || "",
      tpApprenti: tpApp?.userId || "",
      appMaitreApprentissage: [],
      appTuteurPedagogique: [],
      userRole: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (selectedUser?.role === "APPRENTI") {
      form.reset({
        maApprenti: maApp?.userId || "",
        tpApprenti: tpApp?.userId || "",
      });
    } else if (selectedUser?.role === "MA") {
      form.reset({
        appMaitreApprentissage: appMa ? appMa.map((a) => a.userId) : [],
      });
    } else if (selectedUser?.role === "TP") {
      form.reset({
        appTuteurPedagogique: appTp ? appTp.map((a) => a.userId) : [],
      });
    } else if (selectedUser?.role === "USER") {
      form.reset({
        userRole: "",
      });
    }
  }, [selectedUser, maApp, tpApp, appMa, appTp, form]);

  const onSubmit = async (values) => {
    if (!selectedUserId || !selectedUser?.role) {
      return;
    }

    if (selectedUser.role === "MA") {
      const res = await fetch(`/api/MA/${selectedUserId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apprentiUserIds: values.appMaitreApprentissage || [],
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.updatedApprentis) {
        setAppMa(data.updatedApprentis);
      }
      return;
    }

    if (selectedUser.role === "TP") {
      const res = await fetch(`/api/TP/${selectedUserId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apprentiUserIds: values.appTuteurPedagogique || [],
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.updatedApprentis) {
        setAppTp(data.updatedApprentis);
      }
      return;
    }

    if (selectedUser.role === "USER") {
      const role = values.userRole;
      if (!role) {
        return;
      }
      const res = await fetch(`/api/users/${selectedUserId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.user) {
        setSelectedUser(data.user);
        setUsers((prev) =>
          prev.map((u) => (u.id === data.user.id ? data.user : u))
        );
        if (role === "MA" || role === "TP") {
          listApprenti();
        } else if (role === "APPRENTI") {
          listMaitreApprentissage();
          listTuteurPedagogique();
        }
        await getUserById(data.user.id);
      }
      return;
    }

    if (selectedUser.role === "APPRENTI") {
      const { maApprenti, tpApprenti } = values;
      await fetch(`/api/apprenti/${selectedUserId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maUserId: maApprenti,
          tpUserId: tpApprenti,
        }),
      });
    }
  };

  //fonction d'affichage
  const showUserDetails = (user) => {
    setSelectedUserId(user.id);
    setIsDetailsOpen(true);
    switch (user.role) {
      case "APPRENTI":
        listMaitreApprentissage();
        listTuteurPedagogique();
        break;
      case "MA":
        listApprenti();
        break;
      case "TP":
        listApprenti();
        break;
      default:
        break;
    }
    getUserById(user.id);
  };

  return (
    <div className={`flex flex-col gap-4 ${fonts.className}`}>
      <div className="flex flex-row items-center justify-between px-1">
        <div className="flex flex-col m-4 gap-2 text-left">
          <p className="text-2xl text-[#1f1b4a] text-left font-semibold mb-2">
            Page de gestion des utilisateurs
          </p>
          <p className="text-left text-xs">
            Ici gérez les rôles et attributions des différents utilisateurs
          </p>
        </div>
        <div className="flex-end">
          {/* <DropdownMenuUser
              name={currentUser()?.name}
              email={currentUser()?.email}
          /> */}
        </div>
      </div>
      <div
        className={`grid grid-cols-1 gap-5 ${
          isDetailsOpen ? "md:grid-cols-2" : ""
        }`}
      >
        {/* Utilisateurs */}
        <Card
          className={`rounded-3xl h-screen bg-white md:col-span-1 flex flex-col overflow-hidden ${fonts.className}`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-[#1f1b4a]">
              Utilisateurs
            </CardTitle>
            <p className="text-xs text-slate-500">
              {usersFilter.length} utilisateurs trouvés
            </p>
          </CardHeader>
          <CardContent className="flex flex-1 min-h-0 flex-col overflow-hidden">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Chercher..."
                className="pl-10 rounded-full bg-[#f7f7fb] border-slate-200"
              />
            </div>
            {loadingUsers ? (
              <Spinner className="mx-auto" />
            ) : (
              <ScrollArea className="flex-1 min-h-0 pr-2 space-y-2 gap-2">
                {usersFilter.map((u) => {
                  const roleLabel =
                    {
                      APPRENTI: "Apprenti",
                      MA: "Maître d'apprentissage",
                      CA: "Coordonateur(trice) apprentissage",
                    }[u.role] ?? "";
                  return (
                    <div
                      key={u.id}
                      className={`flex items-center justify-between gap-5 m-3 rounded-2xl border px-3 py-2 ${
                        u.active
                          ? "bg-[#f0ecff] border-[#d5cdf8]"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div
                        className="flex items-center gap-3"
                        onClick={() => {
                          /* Voir le profil utilisateur */
                          showUserDetails(u);
                        }}
                      >
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
                          <p className="text-sm font-semibold text-[#1f1b4a]">
                            {u.name}
                          </p>
                          <p className="text-xs text-slate-500">{roleLabel}</p>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-9 w-9 rounded-full border-[#d5cdf8] text-[#4a27a8] hover:bg-[#f0ecff]"
                        onClick={() => {
                          /* Voir le profil utilisateur */
                          showUserDetails(u);
                        }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* informations utilisateurs */}
        {isDetailsOpen && (
          <Card
            className={`rounded-3xl bg-white md:col-span-1 ${fonts.className}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-xl font-semibold text-[#1f1b4a] mb-3">
                    Informations sur l'utilisateur
                  </CardTitle>
                  <p className="text-lg font-bold text-[#1f1b4a]">
                    {selectedUser?.name}
                  </p>
                  <p className="text-xs text-slate-500">{selectedUser?.role}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-slate-700"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    setSelectedUserId(null);
                  }}
                  aria-label="Fermer"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedUser && (
                <>
                  {selectedUser.role === "APPRENTI" && (
                    //faire un form ppiur pouvoir chosir le maitre d'apprentissage et le tuteur pedagogique
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                      >
                        <FormField
                          control={form.control}
                          name="maApprenti"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Maître d'apprentissage</FormLabel>
                              <FormControl>
                                {/* <Input
                              placeholder="atanjunior@mail.com"
                              {...field}
                            /> */}
                                <Select
                                  name={field.name}
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger id="select" className="w-full">
                                    <SelectValue placeholder="Choisir un maître d'apprentissage" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {maitresApprentissage.map((ma) => (
                                      <SelectItem key={ma.id} value={ma.id}>
                                        {ma.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="tpApprenti"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tuteur Pédagogique</FormLabel>
                              <FormControl>
                                <Select
                                  name={field.name}
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger
                                    id="select-tp"
                                    className="w-full"
                                  >
                                    <SelectValue placeholder="Choisir un tuteur pédagogique" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {tuteursPedagogiques.map((tp) => (
                                      <SelectItem key={tp.id} value={tp.id}>
                                        {tp.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex flex-col gap-2">
                          <Button
                            className=" relative bg-[#2a176e] hover:bg-[#422c9f] focus:ring-4 focus:ring-blue-300 text-white w-full"
                            type="submit"
                          >
                            Enregistrer les modifications
                          </Button>
                        </div>
                      </form>
                    </Form>
                  )}
                  {selectedUser.role === "TP" && (
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                      >
                        <FormField
                          control={form.control}
                          name="appTuteurPedagogique"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Apprentis affectés</FormLabel>
                              <div className="mt-2 flex flex-col gap-2">
                                {appTp?.length ? (
                                  appTp.map((app) => (
                                    <div
                                      key={app.id}
                                      className={`w-1/2 rounded-sm border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700 ${fonts.className}`}
                                    >
                                      {app.name}
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-xs text-slate-500">
                                    Aucun apprenti affecte.
                                  </span>
                                )}
                              </div>
                              <FormControl>
                                <div>
                                  <div className="relative mb-3 mt-3">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                      value={apprentiSearchText}
                                      onChange={(e) =>
                                        setApprentiSearchText(e.target.value)
                                      }
                                      placeholder="Rechercher un apprenti..."
                                      className="pl-10 rounded-full bg-[#f7f7fb] border-slate-200"
                                    />
                                  </div>
                                  <ScrollArea className="h-48 w-full rounded-md border border-slate-200 bg-slate-50 p-4">
                                    {apprentisForMa.map((app) => (
                                      <div
                                        key={app.id}
                                        className="flex items-center space-x-2 mb-2 last:mb-0"
                                      >
                                        <input
                                          type="checkbox"
                                          id={`app-tp-${app.id}`}
                                          checked={field.value?.includes(
                                            app.id
                                          )}
                                          onChange={(e) => {
                                            const checked = e.target.checked;
                                            const current = field.value || [];
                                            if (checked) {
                                              field.onChange([
                                                ...current,
                                                app.id,
                                              ]);
                                            } else {
                                              field.onChange(
                                                current.filter(
                                                  (val) => val !== app.id
                                                )
                                              );
                                            }
                                          }}
                                          className="h-4 w-4 rounded border-gray-300 text-[#2a176e] focus:ring-[#2a176e]"
                                        />
                                        <label
                                          htmlFor={`app-tp-${app.id}`}
                                          className="text-sm text-gray-700 cursor-pointer select-none font-o"
                                        >
                                          {app.name}
                                        </label>
                                      </div>
                                    ))}
                                  </ScrollArea>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex flex-col gap-2">
                          <Button
                            className=" relative bg-[#2a176e] hover:bg-[#422c9f] focus:ring-4 focus:ring-blue-300 text-white w-full"
                            type="submit"
                          >
                            Enregistrer les modifications
                          </Button>
                        </div>
                      </form>
                    </Form>
                  )}
                  {selectedUser.role === "USER" && (
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                      >
                        <FormField
                          control={form.control}
                          name="userRole"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Changer le role</FormLabel>
                              <FormControl>
                                <Select
                                  name={field.name}
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger
                                    id="select-role"
                                    className="w-full"
                                  >
                                    <SelectValue placeholder="Choisir un role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="MA">
                                      Maitre d'apprentissage
                                    </SelectItem>
                                    <SelectItem value="TP">
                                      Tuteur pedagogique
                                    </SelectItem>
                                    <SelectItem value="APPRENTI">
                                      Apprenti
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex flex-col gap-2">
                          <Button
                            className=" relative bg-[#2a176e] hover:bg-[#422c9f] focus:ring-4 focus:ring-blue-300 text-white w-full"
                            type="submit"
                          >
                            Enregistrer le role
                          </Button>
                        </div>
                      </form>
                    </Form>
                  )}
                  {selectedUser.role === "MA" && (
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                      >
                        <FormField
                          control={form.control}
                          name="appMaitreApprentissage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Apprentis</FormLabel>
                              <div className="mt-2 flex flex-col gap-2">
                                {appMa?.length ? (
                                  appMa.map((app) => (
                                    <div
                                      key={app.id}
                                      className="w-full rounded-sm border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700"
                                    >
                                      {app.name}
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-xs text-slate-500">
                                    Aucun apprenti affecte.
                                  </span>
                                )}
                              </div>
                              <FormControl>
                                <div>
                                  <div className="relative mb-3 mt-3">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                      value={apprentiSearchText}
                                      onChange={(e) =>
                                        setApprentiSearchText(e.target.value)
                                      }
                                      placeholder="Rechercher un apprenti..."
                                      className="pl-10 rounded-full bg-[#f7f7fb] border-slate-200"
                                    />
                                  </div>
                                  <ScrollArea className="h-48 w-full rounded-md border border-slate-200 bg-slate-50 p-4">
                                    {apprentisFilter.map((app) => (
                                      <div
                                        key={app.id}
                                        className="flex items-center space-x-2 mb-2 last:mb-0"
                                      >
                                        <input
                                          type="checkbox"
                                          id={`app-${app.id}`}
                                          checked={field.value?.includes(
                                            app.id
                                          )}
                                          onChange={(e) => {
                                            const checked = e.target.checked;
                                            const current = field.value || [];
                                            if (checked) {
                                              field.onChange([
                                                ...current,
                                                app.id,
                                              ]);
                                            } else {
                                              field.onChange(
                                                current.filter(
                                                  (val) => val !== app.id
                                                )
                                              );
                                            }
                                          }}
                                          className="h-4 w-4 rounded border-gray-300 text-[#2a176e] focus:ring-[#2a176e]"
                                        />
                                        <label
                                          htmlFor={`app-${app.id}`}
                                          className="text-sm text-gray-700 cursor-pointer select-none"
                                        >
                                          {app.name}
                                        </label>
                                      </div>
                                    ))}
                                  </ScrollArea>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex flex-col gap-2">
                          <Button
                            className=" relative bg-[#2a176e] hover:bg-[#422c9f] focus:ring-4 focus:ring-blue-300 text-white w-full"
                            type="submit"
                          >
                            Enregistrer les modifications
                          </Button>
                        </div>
                      </form>
                    </Form>
                  )}
                  {/* Add more cases for other roles if needed */}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  //todo: fetch user data from the backend and display it
};

export default page;
