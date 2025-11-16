"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export function FileUploadBox({ label, multiple = false }) {
  const [files, setFiles] = useState([]);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(multiple ? [...files, ...selected] : selected);
  };

  return (
    <Card className="border border-muted/40 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{label}</CardTitle>
      </CardHeader>

      <CardContent>
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

        {files.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium">Fichiers :</h4>
            <ul className="text-sm text-muted-foreground mt-1 space-y-1">
              {files.map((file, idx) => (
                <li key={idx}>• {file.name}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
