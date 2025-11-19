import Link from "next/link";

export default function UploadHome() {
  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Dépôt des Documents</h1>

      <div className="space-y-3">
        <Link href="/upload/rapport" className="block underline">Rapport</Link>
        <Link href="/upload/journal" className="block underline">Journal</Link>
        <Link href="/upload/synthese" className="block underline">Fiche de Synthèse</Link>
        <Link href="/upload/complementaires" className="block underline">Documents Complémentaires</Link>
      </div>
    </div>
  );
}
