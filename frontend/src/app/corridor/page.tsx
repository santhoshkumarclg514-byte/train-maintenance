"use client";
import React from "react";
import { useData } from "../../context/DataContext";
import { CorridorVisualizer } from "../../components/CorridorVisualizer";
import { GanttTimeline } from "../../components/GanttTimeline";
import { LiveTrainTracker } from "../../components/LiveTrainTracker";
import { MapPin, Clock } from "lucide-react";

export default function CorridorPage() {
  const { activePlan, trains, requests } = useData();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <MapPin className="w-7 h-7 text-emerald-600" />
            Corridor Map & Live Train Tracker
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            Real-time geographical track visualization, smartphone/hardware telemetry, and train schedule headway timeline
          </p>
        </div>
      </div>

      {/* 0. Live Train Location Tracker */}
      <LiveTrainTracker />

      {/* 1. Railway Corridor Visualizer */}
      <CorridorVisualizer
        activePlan={activePlan}
        trains={trains}
        requests={requests}
      />

      {/* 2. Gantt Timeline (Maintenance Window vs Trains) */}
      <GanttTimeline
        planData={activePlan}
        trains={trains}
      />
    </div>
  );
}

