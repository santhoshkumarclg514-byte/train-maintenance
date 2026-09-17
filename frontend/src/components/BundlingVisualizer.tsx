"use client";
import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { Layers, ArrowDown, Sparkles, CheckCircle2 } from "lucide-react";

interface BundlingVisualizerProps {
  pipelineData: any;
  onGeneratePlan: () => void;
  isGenerating: boolean;
}

export const BundlingVisualizer: React.FC<BundlingVisualizerProps> = ({
  pipelineData,
  onGeneratePlan,
  isGenerating,
}) => {
  const { t } = useLanguage();

  return (
    <section className="clay-card p-6 mb-8 border border-emerald-100 bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-emerald-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-wide flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              {t("bundling_title")}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
              Scikit-Learn DBSCAN (eps = 1.5 km)
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            {t("bundling_desc")}
          </p>
        </div>

        <button
          onClick={onGeneratePlan}
          disabled={isGenerating}
          className="bento-btn bento-btn-emerald text-xs py-2 px-4 font-bold"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
          Run DBSCAN Clustering
        </button>
      </div>

      {/* Visual Bundling Flow Graphic */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Step 1: 3 Disconnected Individual Maintenance Requests (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-1">
            Individual Requests (Without AI Bundling: 3 Blockades Needed ❌)
          </span>

          {/* Job 1 */}
          <div className="clay-inset p-3 rounded-xl border-l-4 border-l-rose-500 flex items-center justify-between bg-[#f8faf8]">
            <div>
              <span className="text-xs font-black text-slate-900">TRK-104 : Rail Crack</span>
              <p className="text-[10px] text-slate-600">Track Dept • KM 142.5 • Duration 2.0h</p>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-300">
              Track Team
            </span>
          </div>

          {/* Job 2 */}
          <div className="clay-inset p-3 rounded-xl border-l-4 border-l-amber-500 flex items-center justify-between bg-[#f8faf8]">
            <div>
              <span className="text-xs font-black text-slate-900">SIG-207 : Signal Failure</span>
              <p className="text-[10px] text-slate-600">Signalling Dept • KM 142.7 • Duration 1.0h</p>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
              Signalling Team
            </span>
          </div>

          {/* Job 3 */}
          <div className="clay-inset p-3 rounded-xl border-l-4 border-l-teal-500 flex items-center justify-between bg-[#f8faf8]">
            <div>
              <span className="text-xs font-black text-slate-900">ELE-310 : Power Supply Issue</span>
              <p className="text-[10px] text-slate-600">Electrical Dept • KM 143.0 • Duration 1.5h</p>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 text-[10px] font-bold border border-teal-300">
              Electrical Team
            </span>
          </div>
        </div>

        {/* Arrow Transition (2 cols) */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center py-2 text-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-2 text-white">
            <ArrowDown className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-black tracking-wider text-emerald-800 uppercase">
            DBSCAN Bundling
          </span>
          <span className="text-[9px] text-slate-500 font-bold">ΔKM &lt; 1.5 km Proximity</span>
        </div>

        {/* Step 2: One Coordinated Railway Block RB-021 (5 cols) */}
        <div className="lg:col-span-5">
          <div className="clay-inset p-5 rounded-2xl border-2 border-emerald-500 bg-gradient-to-b from-emerald-50 to-white relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black tracking-wide border border-emerald-700 flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" /> SMART BLOCK {pipelineData?.plan_code || "RB-021"}
              </span>
              <span className="text-xs font-mono text-emerald-900 font-extrabold">
                KM {pipelineData?.location || "142.0 – 143.0"}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-emerald-100">
                <span className="text-slate-600">{t("bundled_jobs")}:</span>
                <span className="font-bold text-slate-900">
                  3 High-Priority Tasks (Track + S&T + OHE)
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-emerald-100">
                <span className="text-slate-600">{t("coordinated_teams")}:</span>
                <span className="font-bold text-emerald-700">
                  Track Team + Signalling Team + Electrical Team
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-emerald-100">
                <span className="text-slate-600">Possession Duration:</span>
                <span className="font-bold text-slate-900">
                  2.0 Hours (Concurrent Parallel Execution)
                </span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-slate-600">Corridor Efficiency Gain:</span>
                <span className="font-extrabold text-emerald-700">
                  Avoids 2 Separate Track Possessions (67% Reduction)
                </span>
              </div>
            </div>

            {/* Explanation box */}
            <div className="mt-3 p-2.5 rounded-xl bg-white border border-emerald-200 text-[11px] text-slate-700 italic">
              {pipelineData?.recommendation_reason ||
                "Three compatible high-priority maintenance tasks (Track, Signal, Electrical) are located within the same section and can be completed concurrently under a single block, eliminating 2 additional closures."}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
