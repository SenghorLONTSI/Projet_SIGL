"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

export default function CalendrierApprenti({ events }) {
  return (
    <div className="bg-white rounded-3xl p-6">
      <h2 className="text-lg font-bold mb-4">📅 Mes échéances</h2>

      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        locale="fr"
        events={events.map((e) => ({
          id: e.id,
          title: e.title,
          date: e.date,
          color:
            e.statut === "VALIDATED"
              ? "#22c55e"
              : e.statut === "SUBMITTED"
              ? "#3b82f6"
              : e.statut === "REJECTED"
              ? "#ef4444"
              : "#f97316",
        }))}
        height="auto"
      />
    </div>
  );
}
