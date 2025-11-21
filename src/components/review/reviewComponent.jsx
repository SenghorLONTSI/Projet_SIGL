"use client";
import { useEffect, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";

export default function ReviewComponent({ assignmentId, onSaved }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loadingReview, setLoadingReview] = useState(true);
  const [errors, setErrors] = useState({
    note: undefined,
    commentaire: undefined,
    form: undefined,
  });
  const noteFieldId = useId();
  const commentFieldId = useId();

  const reviewSchema = z.object({
    note: z.preprocess(
      (val) => {
        if (typeof val === "string") {
          const trimmed = val.trim();
          if (trimmed === "") return null; // note facultative
          const parsed = Number(trimmed.replace(",", "."));
          if (Number.isNaN(parsed)) return NaN;
          return parsed;
        }
        return val;
      },
      z
        .number({
          invalid_type_error: "La note doit être un nombre.",
        })
        .min(0, "La note doit être au minimum 0.")
        .max(20, "La note doit être au maximum 20.")
        .nullable()
    ),
    commentaire: z
      .string()
      .trim()
      .max(2000, "Le commentaire doit faire moins de 2000 caractères.")
      .optional()
      .transform((val) => val ?? ""),
  });

  //Vérifier si une revue existe déjà pour cet assignmentId
  useEffect(() => {
    if (!assignmentId) {
      setLoadingReview(false);
      return;
    }
    let cancelled = false;
    async function fetchReview() {
      setLoadingReview(true);
      try {
        const res = await fetch(`/api/journal/${assignmentId}/review`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          if (!cancelled) {
            setNote("");
            setCommentaire("");
            setIsSubmitted(false);
          }
          return;
        }
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            const review = Array.isArray(data) ? data[0] : data;
            if (!review) {
              setIsSubmitted(false);
              setNote("");
              setCommentaire("");
              return;
            } else {
              //une revue existe déjà
              setIsSubmitted(true);
              setNote(review.note ?? "");
              setCommentaire(review.commentaire ?? "");
            }
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Erreur lors de la récupération de la revue :", error);
          setIsSubmitted(false);
        }
      } finally {
        if (!cancelled) {
          setLoadingReview(false);
        }
      }
    }
    fetchReview();
    return () => {
      cancelled = true;
    };
  }, [assignmentId]);

  async function saveReview(method) {
    if (submitting) return;
    setSubmitting(true);

    //validation zod
    const parsed = reviewSchema.safeParse({ note, commentaire });

    if (!parsed.success) {
      const { fieldErrors, formErrors } = parsed.error.flatten();
      setErrors({
        note: fieldErrors.note?.[0],
        commentaire: fieldErrors.commentaire?.[0],
        form: formErrors[0],
      });
      setSubmitting(false);
      return;
    }
    const { note: validatedNote, commentaire: validatedCommentaire } =
      parsed.data;

    setErrors({ note: undefined, commentaire: undefined, form: undefined });
    try {
      const res = await fetch(`/api/journal/${assignmentId}/review`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note: validatedNote, // number | null
          commentaire: validatedCommentaire, // string
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err?.error || "Erreur lors de l'enregistrement.");
        return;
      }

      onSaved?.();
      setIsSubmitted(true); // à partir de là, une revue existe
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert("Impossible d'enregistrer pour le moment.");
    } finally {
      setSubmitting(false);
    }
  }
  function handleSave() {
    if (isSubmitted) {
      return saveReview("PUT");
    } else {
      return saveReview("POST");
    }
  }
  if (!open)
    return (
      <Button
        variant="outline"
        size="lg"
        className="gap-2"
        onClick={() => setOpen(true)}
        disabled={loadingReview}
      >
        {isSubmitted ? "Modifier la revue" : "Noter / Commenter"}
      </Button>
    );

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Partager un retour</CardTitle>
        <CardDescription>
          Attribuez une note et un commentaire pour guider l&apos;étudiant.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor={noteFieldId}>Note (0 - 20)</Label>
          <Input
            id={noteFieldId}
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setErrors((prev) => ({ ...prev, note: undefined }));
            }}
            type="number"
            min="0"
            max="20"
            placeholder="Laisser vide pour aucune note"
            inputMode="numeric"
          />
          <p className="text-xs text-muted-foreground">
            Laissez vide pour marquer uniquement un commentaire.
          </p>
          {errors.note && (
            <p className="text-xs text-destructive mt-1">{errors.note}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor={commentFieldId}>Commentaire</Label>
          <Textarea
            id={commentFieldId}
            value={commentaire}
            onChange={(e) => {
              setCommentaire(e.target.value);
              setErrors((prev) => ({ ...prev, commentaire: undefined }));
            }}
            placeholder="Ajoutez un retour détaillé pour l'étudiant..."
            rows={5}
          />
          {errors.commentaire && (
            <p className="text-xs text-destructive mt-1">
              {errors.commentaire}
            </p>
          )}
        </div>
        {errors.form && (
          <p className="text-xs text-destructive mt-1">{errors.form}</p>
        )}
      </CardContent>
      <CardFooter className="flex w-full justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setOpen(false)}
          disabled={submitting}
        >
          Annuler
        </Button>
        <Button onClick={handleSave} disabled={submitting}>
          {submitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </CardFooter>
    </Card>
  );
}
