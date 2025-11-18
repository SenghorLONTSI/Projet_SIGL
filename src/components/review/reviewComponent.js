"use client";
import { useState } from "react";

export default function ReviewComponent({ assignmentId, onSaved }) {
    const [open, setOpen] = useState(false);
    const [note, setNote] = useState("");
    const [commentaire, setCommentaire] = useState("");

    async function submit() {
        const res = await fetch(`/api/journaux/${assignmentId}/review`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                note: note === "" ? null : Number(note),
                commentaire,
            }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            alert(err?.error || "Erreur");
            return;
        }
        onSaved?.();
        setOpen(false);
        setNote("");
        setCommentaire("");
    }

    if (!open) return <button onClick={() => setOpen(true)}>Noter / Commenter</button>;

    return (
        <div className="p-4 border rounded">
            <div className="mb-2">
                <label>Note</label>
                <input value={note} onChange={(e) => setNote(e.target.value)} type="number" min="0" max="20" />
            </div>
            <div className="mb-2">
                <label>Commentaire</label>
                <textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)} />
            </div>
            <button onClick={submit}>Enregistrer</button>
            <button onClick={() => setOpen(false)}>Annuler</button>
        </div>
    );
}
