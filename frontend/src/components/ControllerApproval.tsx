"use client";
import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../services/api";
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  UserCheck, 
  ShieldCheck, 
  FileText, 
  HelpCircle,
  Clock,
  MapPin,
  Wrench,
  Users,
  AlertTriangle,
  Info,
  Check,
  ChevronRight
} from "lucide-react";

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
  const [currentStatus, setCurrentStatus] = useState<string>(
    planData?.approval_status || planData?.status || "AI_RECOMMENDED"
  );
  const [showHelp, setShowHelp] = useState(false);

  const planId = planData?.id || planData?.plan_id || 1;

  const quickNotes = [
    "Zero headway conflict verified",
    "Temp speed restriction 30 km/h",
    "Emergency track possession",
    "Crew and equipment dispatched",
  ];

  const [startTime, setStartTime] = useState<string>(
    planData?.start_time || "11:15"
  );
  const [endTime, setEndTime] = useState<string>(
    planData?.end_time || "13:15"
  );

  const calculateDuration = (start: string, end: string) => {
    try {
      const [startH, startM] = start.split(":").map(Number);
      const [endH, endM] = end.split(":").map(Number);
      const startMins = startH * 60 + startM;
      const endMins = endH * 60 + endM;
      const diff = (endMins - startMins) / 60;
      return diff > 0 ? diff.toFixed(1) : "0.0";
    } catch {
      return "2.0";
    }
  };

  const shiftWindow = (mins: number) => {
    const shiftMins = (timeStr: string, delta: number) => {
      const [h, m] = timeStr.split(":").map(Number);
      const total = (h * 60 + m + delta + 1440) % 1440;
      const newH = String(Math.floor(total / 60)).padStart(2, "0");
      const newM = String(total % 60).padStart(2, "0");
      return `${newH}:${newM}`;
    };
    setStartTime((prev) => shiftMins(prev, mins));
    setEndTime((prev) => shiftMins(prev, mins));
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      const noteWithTime = `${notes} (Possession Window: ${startTime} – ${endTime})`;
      await api.approvePlan(planId, noteWithTime);
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
    <section className="clay-card p-6 mb-8 border border-emerald-100 bg-white rounded-3xl shadow-sm">
      {/* Header & Status Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-slate-900 tracking-wide flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-emerald-600" />
              {t("approval_title")}
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 ${
                currentStatus === "APPROVED"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-400 shadow-sm"
                  : currentStatus === "REJECTED"
                  ? "bg-rose-100 text-rose-800 border-rose-400 shadow-sm"
                  : "bg-teal-100 text-teal-800 border-teal-400 animate-pulse"
              }`}
            >
              {currentStatus === "APPROVED" ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t("status_approved")}
                </>
              ) : currentStatus === "REJECTED" ? (
                <>
                  <XCircle className="w-3.5 h-3.5" />
                  {t("status_rejected")}
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  {t("status_ai_recommended")}
                </>
              )}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
            {t("approval_desc")}
            <button 
              onClick={() => setShowHelp(!showHelp)}
              className="text-emerald-700 hover:text-emerald-800 font-semibold underline flex items-center gap-0.5 ml-1"
            >
              <HelpCircle className="w-3.5 h-3.5 inline" /> How this works
            </button>
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-800 font-bold bg-emerald-50 py-1.5 px-3 rounded-full border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Human-in-the-Loop Protocol
        </div>
      </div>

      {/* Expandable "How it works" guidance box */}
      {showHelp && (
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
          <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
            <Info className="w-4 h-4 text-emerald-600" />
            Understanding the Controller Authorization Step:
          </div>
          <p>
            RailBlock AI automatically bundled track defects and computed a zero-conflict 2-hour window using OR-Tools CP-SAT logic.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li><strong>Approve:</strong> Grants track possession block to field crews. Notifies Station Master and updates train timetable.</li>
            <li><strong>Reject:</strong> Rejects current timing. Triggers dynamic AI solver to re-calculate an alternative window.</li>
            <li><strong>Notes:</strong> Add mandatory operational remarks for safety audit logs.</li>
          </ul>
        </div>
      )}

      {/* Visual Step Progress Bar */}
      <div className="my-5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between text-[11px] overflow-x-auto gap-2">
        <div className="flex items-center gap-2 text-emerald-700 font-bold min-w-max">
          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">1</span>
          AI Defect Scoring & Bundling
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        <div className="flex items-center gap-2 text-emerald-700 font-bold min-w-max">
          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
          OR-Tools Headway Verification
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        <div className={`flex items-center gap-2 font-bold min-w-max ${
          currentStatus === "APPROVED" ? "text-emerald-700" : currentStatus === "REJECTED" ? "text-rose-700" : "text-amber-700"
        }`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white ${
            currentStatus === "APPROVED" ? "bg-emerald-600" : currentStatus === "REJECTED" ? "bg-rose-600" : "bg-amber-500 animate-pulse"
          }`}>3</span>
          Controller Authorization (Current)
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        <div className="flex items-center gap-2 text-slate-600 font-medium min-w-max">
          <span className="w-5 h-5 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[10px]">4</span>
          Line Block Dispatch & Safety Caution Order
        </div>
      </div>

      {/* Dynamic Status Feedback Notification Banner */}
      {currentStatus === "APPROVED" && (
        <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-sm block">Track Possession Granted!</span>
            Possession order queued for Section Station Master. All field teams (Track, Signal, OHE) authorized for site entry.
          </div>
        </div>
      )}

      {currentStatus === "REJECTED" && (
        <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-sm block">Block Plan Rejected</span>
            Proposed possession window declined by controller. Click <strong>Recalculate Optimizer</strong> to generate a revised schedule.
          </div>
        </div>
      )}

      {/* Plan Details & Actions Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Structured Plan Summary Box */}
        <div className="md:col-span-7 clay-inset p-5 rounded-2xl space-y-3.5 bg-[#f8faf8] border border-emerald-50">
          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200/60">
            <span className="text-slate-600 font-semibold flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" /> Target Track Possession Zone:
            </span>
            <span className="font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 shadow-2xs">
              {planData?.plan_code || "RB-021"} @ KM {planData?.start_km || 142.0}–{planData?.end_km || 143.0}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs pb-2.5 border-b border-slate-200/60 gap-2">
            <span className="text-slate-600 font-semibold flex items-center gap-1.5 shrink-0">
              <Clock className="w-4 h-4 text-teal-600" /> Scheduled Time Window:
            </span>
            
            <div className="flex items-center gap-2 flex-wrap">
              {/* Editable Time Pickers */}
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-teal-300 shadow-2xs">
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="font-mono font-bold text-slate-900 bg-transparent focus:outline-none focus:ring-1 focus:ring-teal-500 rounded px-1 w-14 text-xs text-center border border-slate-200"
                  title="Edit Start Time (HH:MM)"
                />
                <span className="text-slate-400 font-bold">–</span>
                <input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="font-mono font-bold text-slate-900 bg-transparent focus:outline-none focus:ring-1 focus:ring-teal-500 rounded px-1 w-14 text-xs text-center border border-slate-200"
                  title="Edit End Time (HH:MM)"
                />
              </div>

              {/* Calculated Duration Badge */}
              <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-xl text-[11px] border border-emerald-300">
                ({calculateDuration(startTime, endTime)} Hours)
              </span>

              {/* Quick Shift Controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => shiftWindow(-15)}
                  className="text-[10px] bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 font-bold px-2 py-1 rounded-lg border border-slate-200 shadow-2xs transition-colors"
                  title="Shift window backward by 15 mins"
                >
                  -15m
                </button>
                <button
                  type="button"
                  onClick={() => shiftWindow(15)}
                  className="text-[10px] bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 font-bold px-2 py-1 rounded-lg border border-slate-200 shadow-2xs transition-colors"
                  title="Shift window forward by 15 mins"
                >
                  +15m
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200/60">
            <span className="text-slate-600 font-semibold flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-amber-600" /> Bundled Maintenance Work:
            </span>
            <span className="font-bold text-slate-800 text-right">
              TRK-104 (Rail Crack) + SIG-207 (Signal) + ELE-310 (OHE)
            </span>
          </div>

          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200/60">
            <span className="text-slate-600 font-semibold flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" /> Allocated Field Crews:
            </span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Track Alpha + Signalling Tech + TRD Electrical
            </span>
          </div>

          {/* Notes Input Section */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-emerald-600" /> Section Controller Authorization Notes:
              </label>
              <span className="text-[10px] text-slate-600">Required for official record</span>
            </div>

            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter authorization or safety remarks..."
              className="w-full clay-inset py-2.5 px-3 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white border border-slate-200"
            />

            {/* Quick-select tags */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] font-semibold text-slate-600 self-center mr-1">Presets:</span>
              {quickNotes.map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setNotes(tag)}
                  className="text-[10px] bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 px-2 py-0.5 rounded-full border border-slate-200 hover:border-emerald-300 transition-colors flex items-center gap-0.5"
                >
                  <Check className="w-2.5 h-2.5 text-emerald-600" /> {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Action Buttons with Explanatory Guidance */}
        <div className="md:col-span-5 flex flex-col gap-3 justify-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
          <div>
            <button
              onClick={handleApprove}
              disabled={isProcessing || currentStatus === "APPROVED"}
              className={`w-full bento-btn py-3.5 px-6 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                currentStatus === "APPROVED"
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed border-none shadow-none"
                  : "bento-btn-emerald shadow-emerald-500/25"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {t("btn_approve")}
            </button>
            <p className="text-[10px] text-slate-600 text-center mt-1">
              Authorizes track possession & issues line clearance
            </p>
          </div>

          <div>
            <button
              onClick={handleReject}
              disabled={isProcessing || currentStatus === "REJECTED"}
              className={`w-full bento-btn py-2.5 px-6 font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                currentStatus === "REJECTED"
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed border-none"
                  : "bento-btn-rose"
              }`}
            >
              <XCircle className="w-4 h-4" />
              {t("btn_reject")}
            </button>
            <p className="text-[10px] text-slate-600 text-center mt-1">
              Declines window and flags for manual or AI re-route
            </p>
          </div>

          <div className="pt-2 border-t border-slate-200/80">
            <button
              onClick={onStatusChanged}
              disabled={isProcessing}
              className="w-full bento-btn bento-btn-secondary py-2 px-6 font-semibold text-xs flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? "animate-spin" : ""}`} />
              {t("btn_recalculate")}
            </button>
            <p className="text-[10px] text-slate-600 text-center mt-1">
              Re-runs CP-SAT solver against updated train timetables
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

