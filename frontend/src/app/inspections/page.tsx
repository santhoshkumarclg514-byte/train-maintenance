"use client";
import React from "react";
import { useData } from "../../context/DataContext";
import { InspectionStream } from "../../components/InspectionStream";
import { Radio, Activity } from "lucide-react";

export default function InspectionsPage() {
  const { inspections, loadData } = useData();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Radio className="w-7 h-7 text-purple-600 animate-pulse" />
            USFD Telemetry Stream & Inspection Logs
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            Synthetic ultrasonic track inspection logs & automated 1-click defect request conversion
          </p>
        </div>
      </div>

      {/* Inspection Telemetry Stream Component */}
      <InspectionStream
        inspections={inspections}
        onConverted={loadData}
      />
    </div>
  );
}
