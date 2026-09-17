"use client";
import React from "react";
import { useData } from "../../context/DataContext";
import { MaintenanceForm } from "../../components/MaintenanceForm";
import { Wrench, PlusCircle } from "lucide-react";

export default function RequestsPage() {
  const { loadData } = useData();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Wrench className="w-7 h-7 text-blue-600" />
            Maintenance Requests & AI Priority Engine
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            Log maintenance defects with live 8-factor AI risk priority calculation and team allocation
          </p>
        </div>
      </div>

      {/* Maintenance Request Form & Active Defect List */}
      <MaintenanceForm onTaskCreated={loadData} />
    </div>
  );
}
