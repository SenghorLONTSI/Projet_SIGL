// src/app/calendrier/CalendarClient.jsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

function formatKey(date) {
  // clé de jour : "YYYY-MM-DD"
  return date.toISOString().slice(0, 10);
}

function getMonthMatrix(currentDate) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // index du jour de la semaine (0 = dimanche, mais on veut lundi=0)
  let startIndex = firstDayOfMonth.getDay() - 1;
  if (startIndex === -1) startIndex = 6; // dimanche

  const weeks = [];
  let current = new Date(year, month, 1 - startIndex);

  // on génère toujours 6 lignes comme Google Calendar
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  return { weeks, month, year };
}

export default function CalendarClient({ events }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const eventsByDay = useMemo(() => {
    const map = {};
    for (const e of events) {
      const d = new Date(e.date);
      const key = formatKey(d);
      if (!map[key]) map[key] = [];
      map[key].push(e);
    }
    return map;
  }, [events]);

  const { weeks, month, year } = useMemo(
    () => getMonthMatrix(currentDate),
    [currentDate]
  );

  const monthNames = [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
  ];

  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  function goPrevMonth() {
    setCurrentDate(
      (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1)
    );
  }

  function goNextMonth() {
    setCurrentDate(
      (d) => new Date(d.getFullYear(), d.getMonth() + 1, 1)
    );
  }

  function goToday() {
    setCurrentDate(new Date());
  }

  const todayKey = formatKey(new Date());

  return (
    <div className="space-y-4">
      {/* Barre supérieure : navigation mois */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={goPrevMonth}
            className="rounded-full border px-2 py-1 text-sm hover:bg-slate-50"
          >
            ◀
          </button>
          <button
            onClick={goToday}
            className="rounded-full border px-3 py-1 text-xs font-medium hover:bg-slate-50"
          >
            Aujourd&apos;hui
          </button>
          <button
            onClick={goNextMonth}
            className="rounded-full border px-2 py-1 text-sm hover:bg-slate-50"
          >
            ▶
          </button>
        </div>
        <div className="font-semibold">
          {monthNames[month]} {year}
        </div>
        <div className="text-xs text-slate-500">
          Vue mensuelle (journaux et réunions à venir)
        </div>
      </div>

      {/* En-têtes jours */}
      <div className="grid grid-cols-7 text-center text-xs font-medium text-slate-500 border-b pb-2">
        {weekDays.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="grid grid-rows-6 gap-y-1 mt-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-x-1">
            {week.map((day, di) => {
              const key = formatKey(day);
              const dayEvents = eventsByDay[key] || [];
              const isCurrentMonth = day.getMonth() === month;
              const isToday = key === todayKey;

              return (
                <div
                  key={di}
                  className={`h-24 border rounded-xl p-1 flex flex-col text-[11px] ${
                    isCurrentMonth ? "bg-white" : "bg-slate-50 text-slate-400"
                  } ${isToday ? "border-[#5141d6] border-2" : ""}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold">
                      {day.getDate()}
                    </span>
                    {isToday && (
                      <span className="text-[10px] text-[#5141d6] font-semibold">
                        Aujourd&apos;hui
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 3).map((e) => (
                      <Link
                        key={e.id}
                        href={`/journal/${e.id}`}
                        className={`block truncate rounded-lg px-1 py-[2px] text-[10px] ${
                          e.statut === "TERMINE"
                            ? "bg-emerald-100 text-emerald-700"
                            : e.statut === "EN_RETARD"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-[#f4f2ff] text-[#5141d6]"
                        }`}
                      >
                        {e.title}
                      </Link>
                    ))}

                    {dayEvents.length > 3 && (
                      <div className="text-[9px] text-slate-500">
                        + {dayEvents.length - 3} autres…
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
