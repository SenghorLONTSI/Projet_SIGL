"use client";

import React from "react";
import { useState } from "react";
import { signUp } from "@/lib/auth-client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { fonts } from "../font";

const pageSignUp = () => {
  const formSchema = z.object({
    name: z
      .string()
      .min(3, "Veuillez entrer au moins trois (3) caractères ")
      .max(50, "Veuillez entrer moins de carctères"),

    email: z.string().email("Veuillez entrer une adresse email valide"),
    password: z
      .string()
      .min(8, "Veuillez entrer au moins huit (8) caractères ")
      .max(50, "Veuillez entrer moins de carctères"),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      password: "",
      email: "",
    },
    mode: "onChange",
  });

  const [loading, setLoading] = useState("false");
  const router = useRouter();
  async function onSubmit(values) {
    const { name, password, email } = values;
    const { data, error } = await signUp.email(
      {
        email,
        password,
        name,
        //callbackURL: "/",
      },
      {
        onRequest: () => {
          //show loading
          setLoading(false);
        },
        onSuccess: () => {
          //redirect to the dashboard or sign in page
          toast.success("🤪 Compte créé", {
            description: "Direction la page d'accueil !",
          });
          router.push("/");
          setLoading(true);
        },

        onError: (ctx) => {
          // display the error message

          toast.warning("Attention !", {
            description:
              ctx.error.message ||
              "Une erreur est survenue lors de la création du compte.",
            closeButton: true,
            duration: 3000,
            action: {
              label: "Connecte-toi",
              onClick: () => router.push("/login"),
            },
          });
          setLoading(true);
        },
      }
    );
    console.log(values);
  }

  //put a button to trigger handleSubmit
  //met le bouton au centre de l'ecran
  //style le bouton avec tailwindcss
  //quand on clique sur le bouton, on appelle handleSubmit
  //affiche data et error dans la console
  return (
    <div className="flex items-center max-h-screen justify-center h-screen">
      <Toaster
        richColors={true}
        swipeDirections={"bottom"}
        // className="flex items-start justify-self-start none"
        expand={false}
        theme="system"
        mobileOffset={{ bottom: "16px" }}
      />

      <div className="flex md:grid md:grid-cols-2 w-full">
        <div className="hidden min-h-screen w-full md:block md:-mx-4 md:-right-16 bg-gradient-to-r rounded-r-xl from-[#2a176e] via-[#422c9f] to-[#6a51de] overflow-hidden"></div>

        <div className="w-full col-start-2 ">
          <div className="grid grid-row min-h-screen px-4">
            <h1
              className={`text-xl text-center md:text-left font-weight-900 font-extrabold m-8 text-[#1f1b4a] lg:text-3xl ${fonts.className}`}
            >
              Page d'inscription
            </h1>
            <div className="flex flex-col justify-center align-center">
              <Card
                className={`w-full max-w-md mx-auto my-20 ${fonts.className}`}
              >
                <CardHeader>
                  <CardTitle>Crée ton compte</CardTitle>
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
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Atango"
                                {...field}
                              />
                            </FormControl>
                            {/* <FormDescription>
                    This is your public display name.
                  </FormDescription> */}
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
                      <div className="flex flex-col gap-2">
                        <Button
                          className=" relative bg-[#2a176e] hover:bg-[#422c9f] focus:ring-4 focus:ring-blue-300 text-white w-full"
                          type="submit"
                          disabled={!loading}
                        >
                          Crée ton compte
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                  <p className="text-sm text-muted-foreground text-center font-light">
                    Tu as déjà un compte ?{" "}
                    <a href="/login" className="text-blue-500 hover:underline">
                      Connecte-toi
                    </a>
                  </p>
                </CardFooter>
              </Card>
            </div>
            <span
              className={`flex flex-col justify-end p-4 text-sm text-center text-gray-500 ${fonts.className}`}
            >
              © Projet SIGLE. Fait par le groupe 3.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default pageSignUp;
