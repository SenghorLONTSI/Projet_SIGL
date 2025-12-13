"use client";

import React, { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { useForm } from "react-hook-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { fonts } from "../font";
import { z } from "zod";

const pageSignIn = () => {
  const formSchema = z.object({
    email: z.string().email("Veuillez entrer une adresse email valide"),
    password: z
      .string()
      .min(8, "Veuillez entrer au moins huit (8) caractères ")
      .max(50, "Veuillez entrer moins de carctères"),
  });
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });
  const [loading, setLoading] = useState("false");
  const router = useRouter();
  async function onSubmit(values) {
    const { password, email } = values;
    const { data, error } = await signIn.email(
      {
        email,
        password,
        // callbackURL: "/",
      },
      {
        onRequest: () => {
          //show loading
          setLoading(false);
        },
        onSuccess: (ctx) => {
          toast.success("🤪 Connexion réussie", {
            description: "Direction la page d'accueil !",
          });
          router.push("/");
          setLoading(true);
        },
        onError: (ctx) => {
          toast.error("Erreur de connexion", {
            description: "Vérifie tes identifiants et réessaie.",
            closeButton: true,
            duration: 4000,
          });
          setLoading(true);
        },
      }
    );
  }

  //put a button to trigger handleSubmit
  //met le bouton au centre de l'ecran
  //style le bouton avec tailwindcss
  //quand on clique sur le bouton, on appelle handleSubmit
  //affiche data et error dans la console
  return (
    <div className="flex items-center justify-center h-screen">
      <Toaster
        richColors={true}
        swipeDirections={"bottom"}
        // className="flex items-start justify-self-start none"
        expand={false}
        theme="system"
        mobileOffset={{ bottom: "16px" }}
      />
      <div className="grid grid-cols-2 w-full">
        <div className="hidden min-h-screen w-full md:block md:-mx-4 md:-right-16 bg-gradient-to-r rounded-r-xl from-[#2a176e] via-[#422c9f] to-[#6a51de] overflow-hidden"></div>

        <div className="w-full col-start-2 ">
          <div className="flex flex-col justify-center min-h-screen px-4">
            <h1
              className={`text-xl text-center font-weight-900 font-extrabold m-4 text-[#1f1b4a] lg:text-3xl ${fonts.className}`}
            >
              Page de connexion
            </h1>
            <Card
              className={`w-full h-fit max-w-md mx-auto my-20 ${fonts.className}`}
            >
              <CardHeader>
                <CardTitle>Connecte toi à ton compte</CardTitle>
                <CardDescription>
                  Veuillez remplir les informations ci-dessous
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                  >
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="atanjunior@mail.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mot de passe</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="********"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex flex-col gap-2">
                      <Button
                        className=" relative "
                        type="submit"
                        disabled={!loading}
                      >
                        Se connecter
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <p className="text-sm text-muted-foreground text-center font-light">
                  Tu n'as pas de compte ?{" "}
                  <a href="/signup" className="text-blue-500 hover:underline">
                    Inscris-toi
                  </a>
                </p>
              </CardFooter>
            </Card>
            <span
              className={`text-sm text-center text-gray-500 ${fonts.className}`}
            >
              © Projet SIGLE. Fait par le groupe 3.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default pageSignIn;
