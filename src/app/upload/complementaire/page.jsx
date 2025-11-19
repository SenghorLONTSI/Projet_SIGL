import { FileUploadBox } from "@/components/upload/FileUploadBox";

export default function DocsComplementairesUploadPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Documents Complémentaires</h1>

      <FileUploadBox 
        label="Upload des Documents"
        multiple
        journalSlotId="complementaires"
      />
    </div>
  );
}
