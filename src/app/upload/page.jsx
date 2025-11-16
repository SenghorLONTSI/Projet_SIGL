import { FileUploadBox } from "@/components/upload/FileUploadBox";

export default function UploadPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dépôt des Documents</h1>

      <FileUploadBox label="Rapport" />
      <FileUploadBox label="Fiche de Synthèse" />
      <FileUploadBox label="Documents Complémentaires" multiple />
    </div>
  );
}
