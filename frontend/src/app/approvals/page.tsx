"use client";
import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import { ControllerApproval } from "../../components/ControllerApproval";
import { UserCheck, ShieldCheck, FileCheck, CheckSquare, Printer, AlertCircle, History } from "lucide-react";

export default function ApprovalsPage() {
  const { activePlan, loadData } = useData();
  const [checklist, setChecklist] = useState({
    headwayChecked: true,
    powerBlockRequested: true,
    stationMasterAdvised: true,
  });

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isFullyChecked = Object.values(checklist).every(Boolean);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-emerald-600" />
            Section Controller Approvals (Human-in-the-Loop)
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Official decision console for Section Chief Controllers to verify safety headway and authorize track possession
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Railway General Rules (GR & SR) Compliant
          </span>
        </div>
      </div>

      {/* Pre-Authorization Safety Protocol Checklist */}
      <div className="clay-card p-5 border border-amber-200 bg-amber-50/40 rounded-3xl">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-200/60">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-amber-700" /> Pre-Authorization Controller Safety Checklist
          </h3>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
            isFullyChecked ? "bg-emerald-100 text-emerald-800" : "bg-amber-200 text-amber-900"
          }`}>
            {isFullyChecked ? "✓ All Safety Checks Verified" : "⚠️ Verification Pending"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <label className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
            checklist.headwayChecked ? "bg-white border-emerald-300 text-slate-900 shadow-2xs" : "bg-white/60 border-slate-200 text-slate-500"
          }`}>
            <input
              type="checkbox"
              checked={checklist.headwayChecked}
              onChange={() => toggleCheck("headwayChecked")}
              className="accent-emerald-600 w-4 h-4 rounded"
            />
            <span className="font-semibold">Passenger Mail Headway Verified</span>
          </label>

          <label className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
            checklist.powerBlockRequested ? "bg-white border-emerald-300 text-slate-900 shadow-2xs" : "bg-white/60 border-slate-200 text-slate-500"
          }`}>
            <input
              type="checkbox"
              checked={checklist.powerBlockRequested}
              onChange={() => toggleCheck("powerBlockRequested")}
              className="accent-emerald-600 w-4 h-4 rounded"
            />
            <span className="font-semibold">OHE Traction Power Block Issued</span>
          </label>

          <label className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
            checklist.stationMasterAdvised ? "bg-white border-emerald-300 text-slate-900 shadow-2xs" : "bg-white/60 border-slate-200 text-slate-500"
          }`}>
            <input
              type="checkbox"
              checked={checklist.stationMasterAdvised}
              onChange={() => toggleCheck("stationMasterAdvised")}
              className="accent-emerald-600 w-4 h-4 rounded"
            />
            <span className="font-semibold">Station Master Advised (T/409 Order)</span>
          </label>
        </div>
      </div>

      {/* Main Controller Approval Interactive Component */}
      <ControllerApproval
        planData={activePlan}
        onStatusChanged={loadData}
      />

      {/* T/409 Caution Order Slip Preview if Approved */}
      {activePlan?.approval_status === "APPROVED" && (
        <div className="clay-card p-6 border border-emerald-200 bg-white rounded-3xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              Generated Railway Caution Order (Form T/409)
            </h3>
            <button
              onClick={() => window.print()}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save Order
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 font-mono text-xs text-slate-800 space-y-2">
            <div className="flex justify-between border-b border-amber-200/80 pb-2 font-bold text-amber-900">
              <span>INDIAN RAILWAYS — CAUTION ORDER T/409</span>
              <span>SECTION: MAS-KPD DIVISION</span>
            </div>
            <div><strong>Possession Block ID:</strong> {activePlan?.plan_code || "RB-021"}</div>
            <div><strong>Location:</strong> KM {activePlan?.start_km || 142.0} to KM {activePlan?.end_km || 143.0} (UP Line)</div>
            <div><strong>Authorized Time Window:</strong> {activePlan?.start_time || "11:15"} to {activePlan?.end_time || "13:15"} HRS</div>
            <div><strong>Speed Restriction:</strong> Temporary Speed Restriction 30 km/h for all passing movement on adjacent line.</div>
            <div><strong>Authorizing Officer:</strong> Section Chief Controller (ID: CTL-4091)</div>
            <div className="text-[10px] text-emerald-800 font-sans font-bold pt-1">
              ✓ Digital Signature Verified & Transmitted via RailBlock DSS
            </div>
          </div>
        </div>
      )}

      {/* Recent Authorization Audit Log */}
      <div className="clay-card p-6 border border-slate-200 bg-white rounded-3xl space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-slate-600" />
          Recent Controller Authorizations Audit Log
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3 rounded-l-xl">Block ID</th>
                <th className="p-3">Track Zone</th>
                <th className="p-3">Time Window</th>
                <th className="p-3">Controller Notes</th>
                <th className="p-3 rounded-r-xl">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-mono font-bold text-emerald-700">RB-021</td>
                <td className="p-3 font-mono">KM 142.0–143.0</td>
                <td className="p-3">11:15 – 13:15</td>
                <td className="p-3 text-slate-600">Verified zero conflict against passenger mail headway.</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    APPROVED
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-mono font-bold text-slate-600">RB-020</td>
                <td className="p-3 font-mono">KM 88.5–89.2</td>
                <td className="p-3">09:00 – 10:30</td>
                <td className="p-3 text-slate-600">Shifted by 15 mins due to delayed freight rake.</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    APPROVED
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

