"use client";
import React from "react";
import Link from "next/link";
import { useData } from "../context/DataContext";
import { KpiBentoGrid } from "../components/KpiBentoGrid";
import { LiveTrainTracker } from "../components/LiveTrainTracker";
import {
  MapPin,
  Brain,
  Wrench,
  Radio,
  UserCheck,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const { dashboardData, activePlan, trains, requests, inspections } = useData();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Top KPI Bento Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
            Operational Dashboard Overview
          </h2>
          <span className="text-xs font-bold text-slate-500">Live Telemetry & Metrics</span>
        </div>
        <KpiBentoGrid
          kpis={
            dashboardData?.kpis || {
              healthy_sections: 76,
              attention_required: 8,
              critical_defects: 3,
              pending_maintenance: 12,
              planned_blocks: 4,
              train_conflicts_avoided: 6,
            }
          }
        />
      </section>

      {/* 1B. LIVE TRAIN LOCATION TRACKER MODULE */}
      <section>
        <LiveTrainTracker />
      </section>


      {/* 2. Current Active Maintenance Block Summary */}
      {activePlan && (
        <section className="clay-container p-6 bg-white border border-emerald-200 shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-emerald-100 pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ACTIVE RECOMMENDATION
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {activePlan.plan_code}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Optimized Maintenance Window: {activePlan.start_time || "11:00"} – {activePlan.end_time || "13:30"}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/approvals"
                className="bento-btn bento-btn-emerald text-xs px-4 py-2 font-bold flex items-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" /> Review Approval
              </Link>
              <Link
                href="/corridor"
                className="bento-btn bento-btn-secondary text-xs px-4 py-2 font-bold flex items-center gap-1.5"
              >
                <MapPin className="w-4 h-4" /> View Map
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="clay-inset p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-500 font-semibold">Corridor Location</span>
              <p className="font-bold text-slate-800 text-sm">
                KM {activePlan.start_km || 142.0} – KM {activePlan.end_km || 143.0} (New Delhi - Agra Mainline)
              </p>
            </div>

            <div className="clay-inset p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-500 font-semibold">Solver Status & Conflicts</span>
              <p className="font-bold text-emerald-700 text-sm flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {activePlan.solver_status || "OPTIMAL"} • {activePlan.train_conflicts_count || 0} Headway Conflicts
              </p>
            </div>

            <div className="clay-inset p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-500 font-semibold">Approval Status</span>
              <p className="font-bold text-amber-800 text-sm uppercase">
                {activePlan.approval_status || "AI_RECOMMENDED"}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 3. Quick Multi-Page Module Navigation Cards */}
      <section className="space-y-4">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          RAILBLOCK AI Quick Navigation & Modules
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Corridor & Gantt */}
          <Link
            href="/corridor"
            className="clay-container p-5 bg-white border border-emerald-200 hover:border-emerald-500 hover:shadow-xl transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Corridor & Gantt Visualizer
              </h4>
              <p className="text-xs text-slate-600">
                Interactive geographical railway track corridor with live train positions, active defects, and Gantt timetable windows.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>Explore Corridor</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: AI Optimizer & Simulator */}
          <Link
            href="/optimizer"
            className="clay-container p-5 bg-white border border-emerald-200 hover:border-emerald-500 hover:shadow-xl transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                AI Task Bundler & What-If Simulator
              </h4>
              <p className="text-xs text-slate-600">
                DBSCAN spatial clustering of maintenance requests & CP-SAT constraint solver for what-if scenarios and dynamic replanning.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
              <span>Run Simulator</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Maintenance Requests */}
          <Link
            href="/requests"
            className="clay-container p-5 bg-white border border-emerald-200 hover:border-emerald-500 hover:shadow-xl transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wrench className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                Maintenance Requests & AI Scoring
              </h4>
              <p className="text-xs text-slate-600">
                Create maintenance defect requests with live 8-factor AI risk priority calculation and automated crew allocation.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
              <span>View Requests ({requests.length})</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 4: USFD Inspection Telemetry */}
          <Link
            href="/inspections"
            className="clay-container p-5 bg-white border border-emerald-200 hover:border-emerald-500 hover:shadow-xl transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Radio className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                USFD Telemetry Inspection Stream
              </h4>
              <p className="text-xs text-slate-600">
                Live ultrasonic flaw detection logs, condition telemetry stream, and automated 1-click defect conversion.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700">
              <span>View Telemetry ({inspections.length})</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 5: Controller Approvals */}
          <Link
            href="/approvals"
            className="clay-container p-5 bg-white border border-emerald-200 hover:border-emerald-500 hover:shadow-xl transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                Section Controller Approvals
              </h4>
              <p className="text-xs text-slate-600">
                Human-in-the-loop decision console for Section Chief Controllers to review, add notes, approve, or reject blocks.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
              <span>Controller Console</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 6: Timetable & Conflicts */}
          <Link
            href="/timetable"
            className="clay-container p-5 bg-white border border-emerald-200 hover:border-emerald-500 hover:shadow-xl transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                Train Timetable & Conflicts
              </h4>
              <p className="text-xs text-slate-600">
                Live train schedule timetable, section headway intersection checks, and conflict avoidance matrix.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-700">
              <span>View Timetable ({trains.length})</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
