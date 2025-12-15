"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";

function formatDate(date) {
  if (!date) return "—";
  return format(new Date(date), "dd MMM yyyy", { locale: fr });
}

export default function DepositStatusApprenti({ assignment }) {
  const now = new Date();

  const start = assignment.depositStart
    ? new Date(assignment.depositStart)
    : null;
  const end = assignment.depositEnd
    ? new Date(assignment.depositEnd)
    : null;

  const isOpen =
    start &&
    end &&
    now >= start &&
    now <= end;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 space-y-1">
      <p className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">
        Période de dépôt
      </p>

      {start && end ? (
        <>
          <p className="text-sm text-slate-800">
            Du <span className="font-medium">{formatDate(start)}</span> au{" "}
            <span className="font-medium">{formatDate(end)}</span>
          </p>

          <span
            className={`inline-block mt-1 rounded-full px-2 py-[2px] text-[11px] font-semibold ${
              isOpen
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {isOpen ? "Dépôt ouvert" : "Dépôt fermé"}
          </span>
        </>
      ) : (
        <p className="text-sm text-slate-500">
          Aucune période définie pour le moment.
        </p>
      )}
    </div>
  );
}
