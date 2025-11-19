"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Save, CheckCircle } from "lucide-react";

export function FileUploadBox({ 
  label, 
  multiple = false,
  journalSlotId,
  journalAssignmentId,
  onUploaded
}) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ----------------------------------------------------
  // 1️⃣ L’utilisateur choisit des fichiers
  // ----------------------------------------------------
  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    const newFiles = multiple ? [...files, ...selected] : selected;
    setFiles(newFiles);
  };

  // ----------------------------------------------------
  // 2️⃣ Upload déclenché SEULEMENT quand on clique
  // ----------------------------------------------------
  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setSuccess(false);

    for (const file of files) {
      const form = new FormData();
      form.append("file", file);

      if (journalSlotId) 
        form.append("journalSlotId", journalSlotId);

      if (journalAssignmentId)
        form.append("journalAssignmentId", journalAssignmentId);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: form,
      });

      const result = await res.json();
      if (onUploaded) onUploaded(result.document);
    }

    setUploading(false);
    setFiles([]);

    // Afficher un message "succès"
    setSuccess(true);

    // Auto-disparition après 3 sec
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Card className="border border-muted/40 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{label}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* Zone de dépôt */}
        <label className="flex flex-col items-center justify-center gap-3 border border-dashed border-muted-foreground/30 rounded-xl p-6 cursor-pointer hover:bg-muted transition">
          <Upload className="w-6 h-6 text-muted-foreground" />
          <span className="text-muted-foreground text-sm">
            Cliquez ou glissez-déposez vos fichiers
          </span>

          <input
            type="file"
            className="hidden"
            onChange={handleFiles}
            multiple={multiple}
          />
        </label>

        {/* Liste des fichiers */}
        {files.length > 0 && (
          <div>
            <h4 className="text-sm font-medium">Fichiers sélectionnés :</h4>
            <ul className="text-sm text-muted-foreground mt-1 space-y-1">
              {files.map((file, idx) => (
                <li key={idx}>• {file.name}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Bouton Enregistrer (visible seulement si un fichier est sélectionné) */}
        {files.length > 0 && (
          <Button 
            className="w-full mt-2"
            onClick={uploadFiles}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Enregistrer
          </Button>
        )}

        {/* Message de succès */}
        {success && (
          <div className="flex items-center text-green-600 text-sm gap-2 mt-2">
            <CheckCircle className="w-4 h-4" />
            Enregistrement réussi !
          </div>
        )}

      </CardContent>
    </Card>
  );
}
