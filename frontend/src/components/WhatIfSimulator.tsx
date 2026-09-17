"use client";
import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../services/api";
import { PlayCircle, Shuffle, AlertTriangle, CheckCircle2, Cpu } from "lucide-react";

interface WhatIfSimulatorProps {
  onPlanUpdated: (newPlan: any) => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ onPlanUpdated }) => {
  const { t } = useLanguage();

  const [scenarioType, setScenarioType] = useState<string>("train_delay");
  const [trainNumber, setTrainNumber] = useState<string>("12601");
  const [delayMinutes, setDelayMinutes] = useState<number>(60);
  const [addedHours, setAddedHours] = useState<number>(0.5);
  const [emergencyKm, setEmergencyKm] = useState<number>(142.8);

  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const handleRunScenario = async (customParams?: any) => {
    setIsSimulating(true);
    try {
      const params = customParams || {
        type: scenarioType,
        train_number: trainNumber,
        delay_minutes: delayMinutes,
        added_hours: addedHours,
        location_km: emergencyKm,
      };

      const result = await api.runWhatIf(params);
      setSimulationResult(result);
      if (result.new_plan) {
        onPlanUpdated(result.new_plan);
      }
    } catch (err: any) {
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <section className="clay-card p-6 mb-8 border border-emerald-100 bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-emerald-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-wide flex items-center gap-2">
              <Shuffle className="w-5 h-5 text-emerald-600" />
              {t("whatif_title")}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-emerald-600" /> CP-SAT Live Replanner
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            {t("whatif_desc")}
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setScenarioType("train_delay");
              setTrainNumber("12601");
              setDelayMinutes(60);
              handleRunScenario({ type: "train_delay", train_number: "12601", delay_minutes: 60 });
            }}
            className="bento-btn bento-btn-amber text-xs py-1.5 px-3 font-bold"
          >
            Train 12601 +60m Delay
          </button>

          <button
            type="button"
            onClick={() => {
              setScenarioType("train_delay");
              setTrainNumber("12603");
              setDelayMinutes(30);
              handleRunScenario({ type: "train_delay", train_number: "12603", delay_minutes: 30 });
            }}
            className="bento-btn bento-btn-secondary text-xs py-1.5 px-3 font-semibold"
          >
            Train 12603 +30m Delay
          </button>

          <button
            type="button"
            onClick={() => {
              setScenarioType("duration_increase");
              setAddedHours(0.5);
              handleRunScenario({ type: "duration_increase", added_hours: 0.5 });
            }}
            className="bento-btn bento-btn-secondary text-xs py-1.5 px-3 font-semibold"
          >
            Duration +30m
          </button>

          <button
            type="button"
            onClick={() => {
              setScenarioType("emergency_request");
              setEmergencyKm(142.8);
              handleRunScenario({ type: "emergency_request", location_km: 142.8 });
            }}
            className="bento-btn bento-btn-secondary text-xs py-1.5 px-3 font-semibold"
          >
            Emergency OHE Defect
          </button>
        </div>
      </div>

      {/* Simulator Inputs Grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
        <div>
          <label className="text-xs font-bold text-slate-700 mb-1 block">
            Select Disruption Scenario:
          </label>
          <select
            value={scenarioType}
            onChange={(e) => setScenarioType(e.target.value)}
            className="w-full clay-inset py-2 px-3 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-[#f4f8f5]"
          >
            <option value="train_delay">Train Schedule Delay</option>
            <option value="duration_increase">Maintenance Duration Extension</option>
            <option value="emergency_request">Emergency Critical Defect Injected</option>
            <option value="crew_unavailable">Specialized Crew Unavailable</option>
          </select>
        </div>

        {scenarioType === "train_delay" && (
          <>
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">
                Target Train:
              </label>
              <select
                value={trainNumber}
                onChange={(e) => setTrainNumber(e.target.value)}
                className="w-full clay-inset py-2 px-3 text-xs text-slate-900 rounded-xl focus:outline-none bg-[#f4f8f5]"
              >
                <option value="12601">Train 12601 (Mangaluru SF Mail)</option>
                <option value="12602">Train 12602 (Chennai Mail Exp)</option>
                <option value="12603">Train 12603 (Hyderabad Exp)</option>
                <option value="20607">Train 20607 (Vande Bharat)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">
                Delay Duration (Minutes):
              </label>
              <input
                type="number"
                step="15"
                value={delayMinutes}
                onChange={(e) => setDelayMinutes(parseInt(e.target.value) || 0)}
                className="w-full clay-inset py-2 px-3 text-xs text-slate-900 rounded-xl focus:outline-none bg-[#f4f8f5]"
              />
            </div>
          </>
        )}

        {scenarioType === "duration_increase" && (
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">
              Additional Hours Needed:
            </label>
            <input
              type="number"
              step="0.5"
              value={addedHours}
              onChange={(e) => setAddedHours(parseFloat(e.target.value) || 0.5)}
              className="w-full clay-inset py-2 px-3 text-xs text-slate-900 rounded-xl focus:outline-none bg-[#f4f8f5]"
            />
          </div>
        )}

        {scenarioType === "emergency_request" && (
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">
              Emergency Location (KM):
            </label>
            <input
              type="number"
              step="0.1"
              value={emergencyKm}
              onChange={(e) => setEmergencyKm(parseFloat(e.target.value) || 142.8)}
              className="w-full clay-inset py-2 px-3 text-xs text-slate-900 rounded-xl focus:outline-none bg-[#f4f8f5]"
            />
          </div>
        )}

        <div>
          <button
            onClick={() => handleRunScenario()}
            disabled={isSimulating}
            className="bento-btn bento-btn-emerald w-full py-2 px-4 font-bold"
          >
            <PlayCircle className={`w-4 h-4 ${isSimulating ? "animate-spin" : ""}`} />
            {isSimulating ? "OR-Tools CP-SAT Solving..." : t("btn_simulate")}
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison: OLD PLAN vs NEW PLAN */}
      {simulationResult && (
        <div className="mt-8 pt-6 border-t border-emerald-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* OLD PLAN CARD */}
            <div className="clay-inset p-5 rounded-2xl border-2 border-rose-400 bg-rose-50/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black tracking-wider text-rose-800 uppercase flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" /> {t("old_plan")}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-900 border border-rose-300 font-bold">
                  {simulationResult.old_plan.status}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-rose-100">
                  <span className="text-slate-600">Scheduled Time Window:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {simulationResult.old_plan.start_time} – {simulationResult.old_plan.end_time}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-rose-100">
                  <span className="text-slate-600">Corridor Range:</span>
                  <span className="font-mono text-slate-900">
                    KM {simulationResult.old_plan.start_km} – {simulationResult.old_plan.end_km}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-rose-100">
                  <span className="text-slate-600">Train Headway Conflicts:</span>
                  <span className="font-extrabold text-rose-700">
                    {simulationResult.old_plan.conflicts_count} Direct Overlap(s)
                  </span>
                </div>
              </div>

              {simulationResult.old_plan.conflicting_trains?.length > 0 && (
                <div className="mt-3 p-2 rounded-xl bg-white border border-rose-200 text-[11px] text-rose-800 font-medium">
                  <span className="font-bold">Conflicting Train:</span>{" "}
                  {simulationResult.old_plan.conflicting_trains.map((c: any) => c.train_number).join(", ")}{" "}
                  now breaches safety block window!
                </div>
              )}
            </div>

            {/* NEW PLAN CARD (AI REPLANNED) */}
            <div className="clay-inset p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black tracking-wider text-emerald-800 uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {t("new_plan")}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 border border-emerald-400 font-bold">
                  {simulationResult.new_plan.status}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-emerald-100">
                  <span className="text-slate-600">Optimal Replanned Window:</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {simulationResult.new_plan.start_time} – {simulationResult.new_plan.end_time}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-100">
                  <span className="text-slate-600">Corridor Range:</span>
                  <span className="font-mono text-slate-900">
                    KM {simulationResult.new_plan.start_km} – {simulationResult.new_plan.end_km}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-100">
                  <span className="text-slate-600">Residual Conflicts:</span>
                  <span className="font-extrabold text-emerald-700">
                    {simulationResult.new_plan.conflicts_count} (Conflicts Resolved!)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-100">
                  <span className="text-slate-600">Teams Coordinated:</span>
                  <span className="font-bold text-slate-900">
                    {simulationResult.new_plan.teams_allocated?.join(" + ") || "Track + Signal + Electrical"}
                  </span>
                </div>
              </div>

              <div className="mt-3 p-2 rounded-xl bg-white border border-emerald-300 text-[11px] text-emerald-800 font-semibold">
                OR-Tools CP-SAT dynamically shifted schedule to preserve safety & throughput.
              </div>
            </div>
          </div>

          {/* Transparent explanation */}
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-900 block mb-1">
              {t("why_plan_changed")}:
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {simulationResult.why_changed}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
