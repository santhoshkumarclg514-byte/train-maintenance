"use client";
import React from "react";
import { useData } from "../../context/DataContext";
import { TimetableTable } from "../../components/TimetableTable";
import { Clock, Train } from "lucide-react";

export default function TimetablePage() {
  const { trains, activePlan } = useData();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Clock className="w-7 h-7 text-indigo-600" />
            Train Timetable & Headway Conflict Matrix
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            Daily passenger mail / express / freight timetable and intersection conflict checks
          </p>
        </div>
      </div>

      {/* Timetable Table Component */}
      <TimetableTable trains={trains} activePlan={activePlan} />
    </div>
  );
}
