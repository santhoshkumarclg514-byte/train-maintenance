"use client";
import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../services/api";
import { PlusCircle, Sparkles, Users, Wrench, CheckCircle2 } from "lucide-react";

interface MaintenanceFormProps {
  onTaskCreated: () => void;
}

export const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ onTaskCreated }) => {
  const { t } = useLanguage();

  const [department, setDepartment] = useState("Track");
  const [locationKm, setLocationKm] = useState(142.5);
  const [defectType, setDefectType] = useState("Rail Crack (Deep Transverse Fatigue Crack)");
  const [severity, setSeverity] = useState(9.0);
  const [safetyRisk, setSafetyRisk] = useState(9.0);
  const [urgency, setUrgency] = useState(8.0);
  const [operationalImpact, setOperationalImpact] = useState(7.0);
  const [assetCondition, setAssetCondition] = useState("Poor");
  const [durationHours, setDurationHours] = useState(2.0);
  const [equipment, setEquipment] = useState("Rail Grinder Machine RG-104");

  const [priorityPreview, setPriorityPreview] = useState<any>(null);
  const [teamPreview, setTeamPreview] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    api.calculatePriority({
      safety_risk: safetyRisk,
      severity,
      urgency,
      asset_condition: assetCondition,
      operational_impact: operationalImpact,
      train_traffic: 7.5,
      maintenance_overdue: 6.0,
      location_criticality: locationKm >= 140 && locationKm <= 145 ? 8.0 : 5.5,
    }).then(setPriorityPreview).catch(console.error);

    api.teamAllocation(defectType, department)
      .then(setTeamPreview)
      .catch(console.error);
  }, [department, defectType, severity, safetyRisk, urgency, operationalImpact, assetCondition, locationKm]);

  const applyPreset = (preset: string) => {
    if (preset === "TRK") {
      setDepartment("Track");
      setLocationKm(142.5);
      setDefectType("Rail Crack (Transverse Fatigue Crack)");
      setSeverity(9.0);
      setSafetyRisk(9.0);
      setUrgency(8.0);
      setOperationalImpact(7.0);
      setAssetCondition("Poor");
      setDurationHours(2.0);
      setEquipment("Rail Grinder Machine RG-104");
    } else if (preset === "SIG") {
      setDepartment("Signalling");
      setLocationKm(142.7);
      setDefectType("Signal Failure (Point Machine & Aspect Flicker)");
      setSeverity(8.0);
      setSafetyRisk(8.0);
      setUrgency(8.0);
      setOperationalImpact(7.0);
      setAssetCondition("Fair");
      setDurationHours(1.0);
      setEquipment("Point Machine Test Rig");
    } else if (preset === "ELE") {
      setDepartment("Electrical");
      setLocationKm(143.0);
      setDefectType("Power Supply Issue (OHE Catenary Wire Dropper Slack)");
      setSeverity(7.0);
      setSafetyRisk(7.0);
      setUrgency(7.0);
      setOperationalImpact(6.0);
      setAssetCondition("Poor");
      setDurationHours(1.5);
      setEquipment("Tower Wagon TW-09");
    } else if (preset === "MULTI") {
      setDepartment("Track");
      setLocationKm(142.6);
      setDefectType("Track Alignment Fault + Signal Circuit Loss");
      setSeverity(8.5);
      setSafetyRisk(9.0);
      setUrgency(8.5);
      setOperationalImpact(8.0);
      setAssetCondition("Poor");
      setDurationHours(2.5);
      setEquipment("Hydraulic Tamper TT-02");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(null);
    try {
      const res = await api.createMaintenance({
        department,
        location_km: locationKm,
        defect_type: defectType,
        severity,
        safety_risk: safetyRisk,
        urgency,
        operational_impact: operationalImpact,
        asset_condition: assetCondition,
        duration_hours: durationHours,
        equipment,
      });
      setSubmitSuccess(`Task ${res.task_id} successfully created! Priority: ${res.priority_score}/10 (${res.priority_category})`);
      onTaskCreated();
      setTimeout(() => setSubmitSuccess(null), 5000);
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="clay-card p-6 mb-8 border border-emerald-100 bg-white">
      {/* Title & Presets */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-emerald-100 gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-wide flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-600" />
            {t("form_title")}
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            {t("form_desc")}
          </p>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-600 font-bold">Demo Presets:</span>
          <button
            type="button"
            onClick={() => applyPreset("TRK")}
            className="bento-btn bento-btn-secondary text-xs py-1 px-3"
          >
            TRK-104 (Track)
          </button>
          <button
            type="button"
            onClick={() => applyPreset("SIG")}
            className="bento-btn bento-btn-secondary text-xs py-1 px-3"
          >
            SIG-207 (Signal)
          </button>
          <button
            type="button"
            onClick={() => applyPreset("ELE")}
            className="bento-btn bento-btn-secondary text-xs py-1 px-3"
          >
            ELE-310 (Electrical)
          </button>
          <button
            type="button"
            onClick={() => applyPreset("MULTI")}
            className="bento-btn bento-btn-secondary text-xs py-1 px-3"
          >
            Multi-Discipline
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">
                {t("field_department")}
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full clay-inset py-2 px-3 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-[#f4f8f5]"
              >
                <option value="Track">Track (Permanent Way)</option>
                <option value="Signalling">Signalling & Telecom</option>
                <option value="Electrical">Electrical (TRD / OHE)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">
                {t("field_location_km")}
              </label>
              <input
                type="number"
                step="0.1"
                value={locationKm}
                onChange={(e) => setLocationKm(parseFloat(e.target.value) || 0)}
                className="w-full clay-inset py-2 px-3 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-[#f4f8f5]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">
                {t("field_duration")}
              </label>
              <input
                type="number"
                step="0.5"
                value={durationHours}
                onChange={(e) => setDurationHours(parseFloat(e.target.value) || 1)}
                className="w-full clay-inset py-2 px-3 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-[#f4f8f5]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">
              {t("field_defect_type")}
            </label>
            <input
              type="text"
              value={defectType}
              onChange={(e) => setDefectType(e.target.value)}
              className="w-full clay-inset py-2 px-3 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-[#f4f8f5]"
              placeholder="e.g. Rail Crack, Point Machine Glitch, OHE Wire Slack"
              required
            />
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1 font-bold">
                <span>{t("field_safety_risk")}</span>
                <span className="text-rose-700">{safetyRisk}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={safetyRisk}
                onChange={(e) => setSafetyRisk(parseFloat(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1 font-bold">
                <span>{t("field_severity")}</span>
                <span className="text-amber-700">{severity}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={severity}
                onChange={(e) => setSeverity(parseFloat(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1 font-bold">
                <span>{t("field_urgency")}</span>
                <span className="text-emerald-700">{urgency}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={urgency}
                onChange={(e) => setUrgency(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1 font-bold">
                <span>{t("field_operational_impact")}</span>
                <span className="text-teal-700">{operationalImpact}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={operationalImpact}
                onChange={(e) => setOperationalImpact(parseFloat(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">
                {t("field_asset_condition")}
              </label>
              <select
                value={assetCondition}
                onChange={(e) => setAssetCondition(e.target.value)}
                className="w-full clay-inset py-2 px-3 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-[#f4f8f5]"
              >
                <option value="Critical">Critical (Severe Flaw)</option>
                <option value="Poor">Poor (High Degradation)</option>
                <option value="Fair">Fair (Standard Wear)</option>
                <option value="Good">Good (Routine Inspection)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">
                {t("field_equipment")}
              </label>
              <input
                type="text"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="w-full clay-inset py-2 px-3 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-[#f4f8f5]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bento-btn bento-btn-emerald w-full sm:w-auto py-2.5 px-6 font-bold"
            >
              <PlusCircle className={`w-4 h-4 ${isSubmitting ? "animate-spin" : ""}`} />
              {isSubmitting ? t("btn_submitting") : t("btn_submit_request")}
            </button>
            {submitSuccess && (
              <span className="ml-3 text-xs text-emerald-700 font-bold inline-flex items-center gap-1 mt-2">
                <CheckCircle2 className="w-4 h-4" /> {submitSuccess}
              </span>
            )}
          </div>
        </div>

        {/* Right Live AI Scoring & Team Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="clay-inset p-4 rounded-2xl border border-emerald-100 bg-[#f8faf8]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                {t("priority_badge")}
              </span>
              {priorityPreview && (
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                    priorityPreview.category === "Critical"
                      ? "bg-rose-100 text-rose-800 border-rose-300"
                      : priorityPreview.category === "High"
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : "bg-emerald-100 text-emerald-800 border-emerald-300"
                  }`}
                >
                  {priorityPreview.category}
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-black text-slate-900">
                {priorityPreview?.final_score || "8.6"}
              </span>
              <span className="text-sm font-bold text-slate-500">/ 10.0</span>
            </div>

            {/* Factor Breakdown Bars */}
            <div className="space-y-1.5 mb-3">
              {priorityPreview?.factor_breakdown?.slice(0, 4).map((f: any, idx: number) => (
                <div key={idx} className="text-[11px]">
                  <div className="flex justify-between text-slate-600 mb-0.5 font-medium">
                    <span>{f.label} ({f.weight_pct}%)</span>
                    <span className="font-mono font-bold text-slate-900">+{f.weighted_contribution}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full"
                      style={{ width: `${(f.raw_value / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-700 italic bg-white p-2.5 rounded-xl border border-emerald-100">
              {priorityPreview?.explanation || "Explainable AI score calculated from multi-factor weighted safety matrix."}
            </p>
          </div>

          <div className="clay-inset p-4 rounded-2xl border border-emerald-100 bg-[#f8faf8]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                {t("team_allocation_title")}
              </span>
              <span className="text-[10px] text-slate-500 font-bold">
                {teamPreview?.is_multi_disciplinary ? "Multi-Disciplinary" : "Single Crew"}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 my-2">
              {teamPreview?.teams?.map((team: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300 flex items-center gap-1.5 shadow-sm"
                >
                  <Wrench className="w-3 h-3 text-emerald-700" /> {team}
                </span>
              ))}
            </div>

            <p className="text-[10px] text-slate-600 mt-1 font-medium">
              {teamPreview?.justification || t("team_allocation_note")}
            </p>
          </div>
        </div>
      </form>
    </section>
  );
};
