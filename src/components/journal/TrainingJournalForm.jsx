"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function TrainingJournalForm({ onSubmit }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tasks, setTasks] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const entry = {
      startDate,
      endDate,
      tasks,
      createdAt: new Date(),
    };

    if (onSubmit) onSubmit(entry);

    // Clear fields
    setStartDate("");
    setEndDate("");
    setTasks("");
  };

  return (
    <Card className="w-full border border-muted/30 shadow-sm">
      <CardHeader>
        <CardTitle>Journal de formation</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Période de formation */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start">Date de début</Label>
              <Input
                id="start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="end">Date de fin</Label>
              <Input
                id="end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Tâches réalisées */}
          <div className="space-y-2">
            <Label htmlFor="tasks">Tâches réalisées</Label>
            <Textarea
              id="tasks"
              placeholder="Décrivez les activités, compétences acquises, difficultés rencontrées, etc."
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              required
              className="min-h-[120px]"
            />
          </div>

        </form>
      </CardContent>

      <CardFooter>
        <Button className="w-full" onClick={handleSubmit}>
          Enregistrer
        </Button>
      </CardFooter>
    </Card>
  );
}
