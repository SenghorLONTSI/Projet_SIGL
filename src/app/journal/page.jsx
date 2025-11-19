"use client";

import { TrainingJournalForm } from "@/components/journal/TrainingJournalForm";

export default function JournalPage() {
  const handleJournalSubmit = (entry) => {
    console.log("Nouvelle entrée :", entry);
    // futur : appel API POST -> DB
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Journal de formation</h1>

      <TrainingJournalForm onSubmit={handleJournalSubmit} />
    </div>
  );
}
