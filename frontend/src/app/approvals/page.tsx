"use client";
import React from "react";
import { useData } from "../../context/DataContext";
import { ControllerApproval } from "../../components/ControllerApproval";
import { UserCheck, ShieldCheck } from "lucide-react";

export default function ApprovalsPage() {
  const { activePlan, loadData } = useData();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-amber-600" />
            Section Controller Approvals (Human-in-the-Loop)
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            Official approval console for Section Chief Controllers to verify safety headway and grant block access
          </p>
        </div>
      </div>

      {/* Controller Approval Component */}
      <ControllerApproval
        planData={activePlan}
        onStatusChanged={loadData}
      />
    </div>
  );
}
