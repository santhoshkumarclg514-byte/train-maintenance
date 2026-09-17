"use client";
import React from "react";
import { Train, AlertCircle, CheckCircle2 } from "lucide-react";

interface TimetableTableProps {
  trains: any[];
  activePlan: any;
}

export const TimetableTable: React.FC<TimetableTableProps> = ({ trains, activePlan }) => {
  const blockStart = activePlan?.start_time || "11:15";
  const blockEnd = activePlan?.end_time || "13:15";

  const isConflict = (crossingTime: string, delay: number = 0) => {
    if (!crossingTime) return false;
    const parts = crossingTime.split(":");
    const mins = parseInt(parts[0]) * 60 + parseInt(parts[1]) + delay;

    const [sh, sm] = blockStart.split(":").map(Number);
    const [eh, em] = blockEnd.split(":").map(Number);
    const sMin = sh * 60 + sm;
    const eMin = eh * 60 + em;

    return mins >= sMin - 5 && mins <= eMin + 5;
  };

  return (
    <section className="clay-card p-6 mb-8 border border-emerald-100 bg-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-emerald-100 gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-wide flex items-center gap-2">
            <Train className="w-5 h-5 text-emerald-600" />
            Today's Train Timetable & Headway Intersection
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Traversing KM 140–145 Corridor • Evaluated against active maintenance window ({blockStart}–{blockEnd})
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-600 border-b border-emerald-100 font-bold bg-[#f8faf8]">
              <th className="py-2.5 px-3">Train No.</th>
              <th className="py-2.5 px-3">Train Name</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Route</th>
              <th className="py-2.5 px-3">KM 142 Passage</th>
              <th className="py-2.5 px-3">Delay</th>
              <th className="py-2.5 px-3 text-right">Headway Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-50">
            {trains.slice(0, 10).map((train) => {
              const conflict = isConflict(train.crossing_time, train.delay_minutes);
              return (
                <tr key={train.id || train.train_number} className="hover:bg-emerald-50/50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 flex items-center gap-1.5">
                    <Train className="w-3.5 h-3.5 text-emerald-600" />
                    {train.train_number}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-800">
                    {train.train_name}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {train.train_type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600 font-medium">
                    {train.origin} → {train.destination} ({train.direction})
                  </td>
                  <td className="py-3 px-3 font-mono font-extrabold text-emerald-700">
                    {train.crossing_time}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700">
                    {train.delay_minutes > 0 ? (
                      <span className="text-amber-700 font-bold">+{train.delay_minutes}m</span>
                    ) : (
                      "On Time"
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {conflict ? (
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-extrabold border border-rose-300 inline-flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-rose-600" /> CONFLICT ❌
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold border border-emerald-300 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> NO CONFLICT ✅
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
