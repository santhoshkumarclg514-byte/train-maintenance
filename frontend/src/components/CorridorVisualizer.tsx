"use client";
import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { Train, Wrench, AlertOctagon, CheckCircle, Radio, Zap } from "lucide-react";

interface CorridorVisualizerProps {
  activePlan: any;
  trains: any[];
  requests: any[];
}

export const CorridorVisualizer: React.FC<CorridorVisualizerProps> = ({
  activePlan,
  trains,
  requests,
}) => {
  const { t } = useLanguage();
  const [selectedKm, setSelectedKm] = useState<number | null>(142.5);

  const kmMarks = [138, 139, 140, 141, 142, 143, 144, 145, 146];
  const blockStart = activePlan?.start_km || 142.0;
  const blockEnd = activePlan?.end_km || 143.0;

  return (
    <section className="clay-card p-6 mb-8 border border-emerald-100 bg-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-emerald-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-wide">
              {t("nav_corridor")} : Chennai Central – Arakkonam – Walajah Corridor
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
              Broad Gauge 25kV AC
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Real-time linear corridor schematic showing active train slots, defect locations & coordinated block zone
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 shadow-sm shadow-emerald-600/40"></span>
            <span className="text-slate-700 font-semibold">Coordinated Block (RB-021)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-600 shadow-sm shadow-rose-600/40"></span>
            <span className="text-slate-700 font-semibold">Critical Defect</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-teal-600 shadow-sm shadow-teal-600/40"></span>
            <span className="text-slate-700 font-semibold">Train Movement</span>
          </div>
        </div>
      </div>

      {/* Corridor Linear Track Graphic */}
      <div className="py-8 relative overflow-x-auto">
        <div className="min-w-[700px] px-6">
          {/* Main Rails Double Track Graphic */}
          <div className="relative h-16 flex items-center bg-[#f4f8f5] rounded-2xl border border-emerald-100 shadow-inner">
            {/* Upper Rail line */}
            <div className="absolute top-4 left-0 right-0 h-1 bg-slate-400 rounded-full"></div>
            {/* Lower Rail line */}
            <div className="absolute bottom-4 left-0 right-0 h-1 bg-slate-400 rounded-full"></div>
            {/* Sleepers ties */}
            <div className="absolute inset-0 flex justify-between items-center pointer-events-none opacity-25">
              {Array.from({ length: 45 }).map((_, i) => (
                <div key={i} className="w-1.5 h-12 bg-amber-800 rounded-sm"></div>
              ))}
            </div>

            {/* Active Coordinated Block Zone (KM 142 to 143) */}
            <div
              className="absolute h-14 rounded-2xl bg-emerald-100/90 border-2 border-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/15 transition-all z-10"
              style={{
                left: "48%",
                width: "24%",
              }}
            >
              <div className="text-center">
                <span className="text-[11px] font-black tracking-wider text-emerald-900 px-2 py-0.5 rounded-full bg-emerald-200/90 border border-emerald-400">
                  {activePlan?.plan_code || "RB-021"} : {activePlan?.start_time || "11:15"} – {activePlan?.end_time || "13:15"}
                </span>
                <p className="text-[9px] text-emerald-800 mt-0.5 font-bold">
                  Track + Signal + Electrical Coordinated Possession
                </p>
              </div>
            </div>

            {/* Train Markers on corridor */}
            <div
              className="absolute -top-7 transform -translate-x-1/2 flex flex-col items-center z-20"
              style={{ left: "22%" }}
            >
              <div className="px-2 py-0.5 rounded-lg bg-teal-700 text-white text-[10px] font-bold shadow-md flex items-center gap-1 border border-white/40">
                <Train className="w-3 h-3" /> 12601 (10:20)
              </div>
              <div className="w-0.5 h-4 bg-teal-700"></div>
            </div>

            <div
              className="absolute -top-7 transform -translate-x-1/2 flex flex-col items-center z-20"
              style={{ left: "38%" }}
            >
              <div className="px-2 py-0.5 rounded-lg bg-emerald-800 text-white text-[10px] font-bold shadow-md flex items-center gap-1 border border-white/40">
                <Train className="w-3 h-3" /> 12602 (11:00)
              </div>
              <div className="w-0.5 h-4 bg-emerald-800"></div>
            </div>

            <div
              className="absolute -top-7 transform -translate-x-1/2 flex flex-col items-center z-20"
              style={{ left: "80%" }}
            >
              <div className="px-2 py-0.5 rounded-lg bg-amber-700 text-white text-[10px] font-bold shadow-md flex items-center gap-1 border border-white/40">
                <Train className="w-3 h-3" /> 12603 (13:30)
              </div>
              <div className="w-0.5 h-4 bg-amber-700"></div>
            </div>

            {/* Defect Markers (TRK-104, SIG-207, ELE-310) */}
            <div
              className="absolute -bottom-8 transform -translate-x-1/2 flex flex-col items-center z-20 cursor-pointer"
              style={{ left: "52%" }}
              onClick={() => setSelectedKm(142.5)}
            >
              <div className="w-0.5 h-3 bg-rose-600"></div>
              <div className="px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[10px] font-extrabold shadow-md flex items-center gap-1 border border-rose-300">
                <Wrench className="w-2.5 h-2.5" /> TRK-104 (9.0)
              </div>
            </div>

            <div
              className="absolute -bottom-8 transform -translate-x-1/2 flex flex-col items-center z-20 cursor-pointer"
              style={{ left: "58%" }}
              onClick={() => setSelectedKm(142.7)}
            >
              <div className="w-0.5 h-3 bg-amber-600"></div>
              <div className="px-2 py-0.5 rounded-lg bg-amber-600 text-white text-[10px] font-extrabold shadow-md flex items-center gap-1 border border-amber-300">
                <Radio className="w-2.5 h-2.5" /> SIG-207 (8.2)
              </div>
            </div>

            <div
              className="absolute -bottom-8 transform -translate-x-1/2 flex flex-col items-center z-20 cursor-pointer"
              style={{ left: "64%" }}
              onClick={() => setSelectedKm(143.0)}
            >
              <div className="w-0.5 h-3 bg-teal-700"></div>
              <div className="px-2 py-0.5 rounded-lg bg-teal-700 text-white text-[10px] font-extrabold shadow-md flex items-center gap-1 border border-teal-300">
                <Zap className="w-2.5 h-2.5" /> ELE-310 (7.8)
              </div>
            </div>
          </div>

          {/* KM Tick Labels */}
          <div className="flex justify-between items-center mt-10 pt-2 border-t border-emerald-200 text-xs text-slate-500 font-mono">
            {kmMarks.map((km) => (
              <div
                key={km}
                className={`text-center cursor-pointer transition-colors ${
                  km === 142 || km === 143 ? "text-emerald-700 font-bold" : "hover:text-slate-900"
                }`}
                onClick={() => setSelectedKm(km)}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mx-auto mb-1"></div>
                <span>KM {km}</span>
                {km === 138 && <span className="block text-[10px] text-slate-400">Arakkonam Jn</span>}
                {km === 142 && <span className="block text-[10px] text-emerald-700 font-bold">Walajah Siding</span>}
                {km === 146 && <span className="block text-[10px] text-slate-400">Sholinghur</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Pill for Selected Corridor Section */}
      <div className="clay-inset p-4 mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-[#f4f8f5]">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-emerald-600" />
          <span className="font-bold text-emerald-950">
            Corridor Block Inspection: KM {blockStart} – KM {blockEnd}
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600 font-medium">
            Bundling 3 compatible defects under 1 possession saves 2 track blockades
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-800 font-bold">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Timetable Headway Cleared: Train 12601 (10:20) & 12602 (11:00)
        </div>
      </div>
    </section>
  );
};
