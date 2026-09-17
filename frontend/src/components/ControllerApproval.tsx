"use client";
import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../services/api";
import { CheckCircle2, XCircle, RefreshCw, UserCheck, ShieldCheck, FileText } from "lucide-react";

interface ControllerApprovalProps {
  planData: any;
  onStatusChanged: () => void;
}

export const ControllerApproval: React.FC<ControllerApprovalProps> = ({
  planData,
  onStatusChanged,
}) => {
  const { t } = useLanguage();

  const [notes, setNotes] = useState(
    "Approved by Section Chief Controller. Verified zero conflict against passenger mail headway."
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(
    planData?.approval_status || planData?.status || "AI_RECOMMENDED"
  );

  const planId = planData?.id || planData?.plan_id || 1;

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await api.approvePlan(planId, notes);
      setCurrentStatus("APPROVED");
      onStatusChanged();
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await api.rejectPlan(planId, notes);
      setCurrentStatus("REJECTED");
      onStatusChanged();
    } catch (err: any) {
      alert(`Rejection error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="clay-card p-6 mb-8 border border-emerald-100 bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-emerald-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-wide flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              {t("approval_title")}
            </h2>
            <span
              className={`px-3 py-0.5 rounded-full text-xs font-black border ${
                currentStatus === "APPROVED"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-400"
                  : currentStatus === "REJECTED"
                  ? "bg-rose-100 text-rose-800 border-rose-400"
                  : "bg-teal-100 text-teal-800 border-teal-400"
              }`}
            >
              {currentStatus === "APPROVED"
                ? t("status_approved")
                : currentStatus === "REJECTED"
                ? t("status_rejected")
                : t("status_ai_recommended")}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            {t("approval_desc")}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-800 font-bold font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Human-in-the-Loop Decision Protocol
        </div>
      </div>

      {/* Plan Summary Card */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-7 clay-inset p-4 rounded-2xl space-y-3 bg-[#f8faf8]">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 font-semibold">Target Possession Block:</span>
            <span className="font-mono font-bold text-emerald-700">
              {planData?.plan_code || "RB-021"} @ KM {planData?.start_km || 142.0}–{planData?.end_km || 143.0}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 font-semibold">Scheduled Time Window:</span>
            <span className="font-mono font-bold text-slate-900">
              {planData?.start_time || "11:15"} – {planData?.end_time || "13:15"} (2.0 Hours)
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 font-semibold">Bundled Tasks:</span>
            <span className="font-bold text-slate-900">
              TRK-104 (Rail Crack) + SIG-207 (Signal) + ELE-310 (OHE)
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 font-semibold">Allocated Maintenance Teams:</span>
            <span className="font-bold text-emerald-700">
              Track Team Alpha + Signalling Tech + TRD Electrical
            </span>
          </div>

          {/* Notes input */}
          <div className="pt-2">
            <label className="text-[11px] font-bold text-slate-700 mb-1 block flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-emerald-600" /> Section Controller Authorization Notes:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full clay-inset py-2 px-3 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
            />
          </div>
        </div>

        {/* Action Bento Buttons */}
        <div className="md:col-span-5 flex flex-col gap-3 justify-center">
          <button
            onClick={handleApprove}
            disabled={isProcessing || currentStatus === "APPROVED"}
            className="bento-btn bento-btn-emerald py-3 px-6 font-bold shadow-lg shadow-emerald-500/25 text-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            {t("btn_approve")}
          </button>

          <button
            onClick={handleReject}
            disabled={isProcessing || currentStatus === "REJECTED"}
            className="bento-btn bento-btn-rose py-2.5 px-6 font-bold text-xs"
          >
            <XCircle className="w-4 h-4" />
            {t("btn_reject")}
          </button>

          <button
            onClick={onStatusChanged}
            disabled={isProcessing}
            className="bento-btn bento-btn-secondary py-2 px-6 font-semibold text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? "animate-spin" : ""}`} />
            {t("btn_recalculate")}
          </button>
        </div>
      </div>
    </section>
  );
};
