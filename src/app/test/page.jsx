"use client";

import React from "react";
import { signUp } from "@/lib/auth-client";

const page = () => {
  async function handleSubmit(event) {
    const { data, error } = await signUp.email({
      email: "test@email44.com",
      password: "ttest1234",
      name: "Test",
      callbackURL: "/",
    });
  } //put a button to trigger handleSubmit
  //met le bouton au centre de l'ecran
  //style le bouton avec tailwindcss
  //quand on clique sur le bouton, on appelle handleSubmit
  //affiche data et error dans la console
  return (
    <div className="flex items-center justify-center h-screen">
      <button
        onClick={handleSubmit}
        className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
      >
        Test Sign Up
      </button>
    </div>
  );
};

export default page;
