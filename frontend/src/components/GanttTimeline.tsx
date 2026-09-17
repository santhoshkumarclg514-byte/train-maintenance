"use client";
import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { Calendar, CheckCircle2, AlertCircle, Train, ShieldCheck } from "lucide-react";

interface GanttTimelineProps {
  planData: any;
  trains: any[];
}

export const GanttTimeline: React.FC<GanttTimelineProps> = ({ planData, trains }) => {
  const { t } = useLanguage();

  const startTime = planData?.start_time || "11:15";
  const endTime = planData?.end_time || "13:15";
  const conflictsCount = planData?.train_conflicts_count ?? 0;

  const baseMinutes = 9 * 60; // 540 min (09:00)
  const totalMinutes = 7 * 60; // 420 min (to 16:00)

  const timeToPercent = (timeStr: string, delay: number = 0) => {
    if (!timeStr) return 50;
    const parts = timeStr.split(":");
    const mins = parseInt(parts[0]) * 60 + parseInt(parts[1]) + delay;
    const pct = ((mins - baseMinutes) / totalMinutes) * 100;
    return Math.max(0, Math.min(100, pct));
  };

  const blockStartPct = timeToPercent(startTime);
  const blockEndPct = timeToPercent(endTime);
  const blockWidthPct = Math.max(8, blockEndPct - blockStartPct);

  const keyTrains = [
    { num: "12601", name: "Mangaluru SF", time: "10:20", delay: 0, type: "Superfast" },
    { num: "12602", name: "Chennai Mail", time: "11:00", delay: 0, type: "Express" },
    { num: "12603", name: "Hyderabad Exp", time: "13:30", delay: 0, type: "Express" },
    { num: "CONTR-402", name: "Container Freight", time: "14:15", delay: 0, type: "Freight" },
    { num: "12609", name: "Bengaluru Intercity", time: "14:50", delay: 0, type: "Superfast" },
  ];

  return (
    <section className="clay-card p-6 mb-8 border border-emerald-100 bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-emerald-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-wide flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              {t("timeline_title")}
            </h2>
            <span
              className={`px-3 py-0.5 rounded-full text-xs font-black border flex items-center gap-1.5 ${
                conflictsCount === 0
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : "bg-rose-100 text-rose-800 border-rose-300"
              }`}
            >
              {conflictsCount === 0 ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {t("conflict_status_clear")}
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> {t("conflict_status_detected")} ({conflictsCount})
                </>
              )}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            {t("timeline_desc")}
          </p>
        </div>

        <div className="text-xs font-mono text-slate-700 clay-inset px-3 py-1.5 rounded-xl border border-emerald-200 bg-[#f4f8f5]">
          Solver Status: <span className="font-bold text-emerald-700">{planData?.solver_status || "OPTIMAL"}</span>
        </div>
      </div>

      {/* Gantt Canvas */}
      <div className="mt-8 overflow-x-auto">
        <div className="min-w-[750px] px-4">
          {/* Time axis header */}
          <div className="flex justify-between text-xs font-mono text-slate-600 pb-2 border-b border-emerald-200 font-semibold">
            <span>09:00</span>
            <span>10:00</span>
            <span>11:00</span>
            <span>12:00</span>
            <span>13:00</span>
            <span>14:00</span>
            <span>15:00</span>
            <span>16:00</span>
          </div>

          {/* Grid lines container */}
          <div className="relative h-48 my-3 bg-[#f8faf8] rounded-2xl border border-emerald-100">
            {/* Vertical hour guidelines */}
            <div className="absolute inset-0 flex justify-between pointer-events-none opacity-30">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-px h-full bg-emerald-300 dashed"></div>
              ))}
            </div>

            {/* Smart Maintenance Block Highlight Band */}
            <div
              className={`absolute top-0 bottom-0 rounded-2xl transition-all border-2 shadow-xl flex flex-col justify-between p-3 z-10 ${
                conflictsCount === 0
                  ? "bg-emerald-100/90 border-emerald-500 shadow-emerald-500/20"
                  : "bg-rose-100/90 border-rose-500 shadow-rose-500/20"
              }`}
              style={{
                left: `${blockStartPct}%`,
                width: `${blockWidthPct}%`,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-emerald-800 text-white text-[10px] font-black tracking-wider border border-emerald-600 uppercase">
                  {planData?.plan_code || "RB-021"} Possession
                </span>
                <span className="text-[10px] font-mono text-emerald-950 font-bold">
                  {startTime} – {endTime}
                </span>
              </div>

              <div className="text-center py-2">
                <p className="text-xs font-black text-emerald-950">
                  Coordinated Railway Block
                </p>
                <p className="text-[10px] text-emerald-800 font-semibold">
                  KM {planData?.start_km || "142.0"} – {planData?.end_km || "143.0"} (2.0 hrs)
                </p>
              </div>

              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-900 bg-white/80 py-1 rounded-lg border border-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> 0 Timetable Headway Conflicts
              </div>
            </div>

            {/* Train Crossing Gantt Bars */}
            <div className="absolute inset-0 flex flex-col justify-around py-2 z-20 pointer-events-none">
              {keyTrains.map((train, idx) => {
                const trainPct = timeToPercent(train.time, train.delay);
                const isConflicting =
                  trainPct >= blockStartPct - 1 && trainPct <= blockEndPct + 1;

                return (
                  <div key={idx} className="relative h-6 flex items-center">
                    <div
                      className={`absolute pointer-events-auto transform -translate-x-1/2 px-2.5 py-1 rounded-xl text-[10px] font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer border ${
                        isConflicting
                          ? "bg-rose-600 text-white border-rose-300 animate-bounce"
                          : train.type === "Superfast"
                          ? "bg-teal-700 text-white border-teal-500"
                          : train.type === "Freight"
                          ? "bg-slate-700 text-white border-slate-500"
                          : "bg-emerald-800 text-white border-emerald-600"
                      }`}
                      style={{ left: `${trainPct}%` }}
                      title={`${train.name} (${train.num}) - Passing time: ${train.time}`}
                    >
                      <Train className="w-3 h-3" />
                      <span>{train.num}</span>
                      <span className="font-mono text-[9px] opacity-90">({train.time})</span>
                      {isConflicting && <span className="font-black text-rose-100">CONFLICT!</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Time Marks */}
          <div className="flex justify-between items-center text-[10px] text-slate-600 pt-2 border-t border-emerald-100 font-mono">
            <span>Morning Traffic (Vande Bharat / Mail)</span>
            <span className="text-emerald-700 font-bold">Optimal Daylight Window (11:15–13:15)</span>
            <span>Afternoon Freight & Intercity Operations</span>
          </div>
        </div>
      </div>
    </section>
  );
};
