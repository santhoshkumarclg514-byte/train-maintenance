"use client";
import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../services/api";
import { Activity, PlusCircle, CheckCircle2, AlertTriangle } from "lucide-react";

interface InspectionStreamProps {
  inspections: any[];
  onConverted: () => void;
}

export const InspectionStream: React.FC<InspectionStreamProps> = ({
  inspections,
  onConverted,
}) => {
  const { t } = useLanguage();
  const [convertingId, setConvertingId] = useState<number | null>(null);

  const [analyzingId, setAnalyzingId] = useState<number | null>(null);
  const [aiModalResult, setAiModalResult] = useState<any | null>(null);

  const handleConvert = async (id: number) => {
    setConvertingId(id);
    try {
      await api.convertInspection(id);
      onConverted();
    } catch (err: any) {
      alert(`Conversion failed: ${err.message}`);
    } finally {
      setConvertingId(null);
    }
  };

  const handleRunAiAnalysis = async (rec: any) => {
    setAnalyzingId(rec.id);
    try {
      const res = await api.analyzeInspectionAI({
        track_vibration: rec.track_vibration,
        track_geometry_score: rec.track_geometry_score,
        rail_condition: rec.rail_condition,
        signal_condition: rec.signal_condition,
        electrical_condition: rec.electrical_condition,
        defect_detected: rec.defect_detected,
        km_position: rec.km_position
      });
      setAiModalResult(res);
      onConverted(); // Refresh parent lists if auto maintenance task was created
    } catch (err: any) {
      alert(`AI Analysis failed: ${err.message}`);
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <section className="clay-card p-6 mb-8 border border-emerald-100 bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-emerald-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-wide flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              {t("inspection_title")} & AI Anomaly Diagnostics
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
              AI Vibration & Track Anomaly Engine
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Real-time track geometry telemetry, ultrasound crack detection, and automated AI fault diagnosis.
          </p>
        </div>
      </div>

      {/* AI Analysis Result Alert Banner */}
      {aiModalResult && (
        <div className="mt-4 p-4 rounded-xl border border-blue-200 bg-blue-50/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-900 text-sm">
                🤖 AI Diagnostic Result (KM {aiModalResult.inspection_location_km}):
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-600 text-white">
                Risk Score: {aiModalResult.ai_result.ai_risk_score} / 10
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-600 text-white">
                Failure Prob: {aiModalResult.ai_result.failure_probability_pct}%
              </span>
            </div>
            <p className="text-xs text-blue-950 font-medium mt-1">
              {aiModalResult.ai_result.recommendation}
            </p>
            {aiModalResult.auto_created_maintenance_task && (
              <p className="text-xs text-emerald-700 font-bold mt-1">
                ✅ Auto-Filed High-Priority Maintenance Request: #{aiModalResult.auto_created_maintenance_task}
              </p>
            )}
          </div>
          <button
            onClick={() => setAiModalResult(null)}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1 bg-white rounded border border-slate-200 shadow-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-600 border-b border-emerald-100 font-bold bg-[#f8faf8]">
              <th className="py-2.5 px-3">Inspection ID</th>
              <th className="py-2.5 px-3">Location</th>
              <th className="py-2.5 px-3">Telemetry Readings</th>
              <th className="py-2.5 px-3">Detected Anomaly</th>
              <th className="py-2.5 px-3">Recommended Crew</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-50">
            {inspections.map((rec) => (
              <tr key={rec.id} className="hover:bg-emerald-50/50 transition-colors">
                <td className="py-3 px-3 font-mono font-bold text-slate-900">
                  {rec.inspection_id}
                </td>
                <td className="py-3 px-3 font-mono text-emerald-700 font-extrabold">
                  KM {rec.km_position}
                </td>
                <td className="py-3 px-3">
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    <span className={`px-1.5 py-0.5 rounded font-semibold ${rec.track_vibration === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'}`}>
                      Vib: {rec.track_vibration}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded font-semibold ${rec.track_geometry_score === 'Poor' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                      Geom: {rec.track_geometry_score}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded font-semibold ${rec.signal_condition === 'Fault' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'}`}>
                      Sig: {rec.signal_condition}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    {rec.defect_detected}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[11px] font-bold border border-emerald-300">
                    {rec.recommended_teams}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleRunAiAnalysis(rec)}
                      disabled={analyzingId === rec.id}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold shadow-sm transition-colors flex items-center gap-1"
                    >
                      <Activity className={`w-3 h-3 ${analyzingId === rec.id ? 'animate-spin' : ''}`} />
                      Run AI Anomaly Scan
                    </button>

                    {rec.converted_to_request ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {t("converted_badge")}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleConvert(rec.id)}
                        disabled={convertingId === rec.id}
                        className="bento-btn bento-btn-emerald text-[11px] py-1 px-3 font-bold"
                      >
                        <PlusCircle className={`w-3 h-3 ${convertingId === rec.id ? 'animate-spin' : ''}`} />
                        {t("btn_convert_to_request")}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

