"use client";

import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import {
  Train,
  Radio,
  AlertTriangle,
  RefreshCw,
  Send,
  ShieldAlert,
  Clock,
  Navigation,
  CheckCircle2
} from "lucide-react";

interface LiveTrain {
  id: number;
  train_number: string;
  train_name: string;
  train_type: string;
  direction: string;
  speed_kmh: number;
  delay_minutes: number;
  current_km: number;
  latitude: number;
  longitude: number;
  status: string;
  source: string;
  proximity_distance_km: number;
  proximity_warning?: string;
  last_updated: string;
}

export const LiveTrainTracker: React.FC = () => {
  const [liveData, setLiveData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  // Telemetry Ingestion Controls
  const [selectedTrain, setSelectedTrain] = useState<string>("12603");
  const [customKm, setCustomKm] = useState<number>(141.5);
  const [customSpeed, setCustomSpeed] = useState<number>(115);
  const [pushStatus, setPushStatus] = useState<string | null>(null);

  const fetchLiveTrains = async () => {
    try {
      const data = await api.getLiveTrains();
      setLiveData(data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to load live train data", err);
      setError("Unable to connect to live telemetry stream");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveTrains();
    let interval: any;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchLiveTrains();
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handlePushTelemetry = async () => {
    setPushStatus("Broadcasting GPS packet...");
    const fraction = (customKm - 100.0) / 100.0;
    const lat = 13.0827 + fraction * (16.5062 - 13.0827);
    const lng = 80.2707 + fraction * (80.6480 - 80.2707);

    try {
      const res = await api.pushTelemetry({
        train_number: selectedTrain,
        latitude: lat,
        longitude: lng,
        speed_kmh: customSpeed,
        delay_minutes: 15,
        source: "SIMULATED_MOBILE_GPS"
      });
      setPushStatus(`✅ Telemetry Ingested! Snapped to KM ${res.snapped_km}`);
      fetchLiveTrains();
      setTimeout(() => setPushStatus(null), 4000);
    } catch (err: any) {
      setPushStatus("❌ Telemetry broadcast failed");
    }
  };

  const trains: LiveTrain[] = liveData?.live_trains || [];

  return (
    <div className="clay-card p-6 border border-emerald-200 bg-white space-y-6 shadow-md rounded-2xl">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-100 pb-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 animate-pulse text-emerald-600" />
            Indian Railways Real-Time Train Tracking & Safety Monitor
          </div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <span>🚆 Live Corridor Train Position Tracker</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full font-bold">
              3s Real-Time Sync
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              autoRefresh
                ? "bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm"
                : "bg-slate-100 text-slate-700 border-slate-300"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? "animate-spin text-emerald-600" : ""}`} />
            {autoRefresh ? "Telemetry Stream Active" : "Stream Paused"}
          </button>

          <button
            onClick={fetchLiveTrains}
            className="bento-btn bento-btn-emerald text-xs py-1.5 px-4 font-bold"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Corridor Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="clay-inset p-4 bg-[#f8faf8] border border-emerald-200 rounded-xl">
          <div className="text-slate-600 text-xs font-extrabold mb-1">Active Trains En Route</div>
          <div className="text-3xl font-black text-slate-900 flex items-baseline gap-2">
            <span>{liveData?.total_active_trains || trains.length || 0}</span>
            <span className="text-xs text-slate-500 font-semibold">in section</span>
          </div>
        </div>

        <div className="clay-inset p-4 bg-[#f8faf8] border border-amber-300 rounded-xl">
          <div className="text-slate-600 text-xs font-extrabold mb-1">Block Proximity Warnings</div>
          <div className="text-3xl font-black text-amber-700 flex items-center justify-between">
            <span>{liveData?.proximity_alerts || 0}</span>
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
        </div>

        <div className="clay-inset p-4 bg-[#f8faf8] border border-rose-300 rounded-xl">
          <div className="text-slate-600 text-xs font-extrabold mb-1">Direct Headway Violations</div>
          <div className="text-3xl font-black text-rose-700 flex items-center justify-between">
            <span>{liveData?.active_conflicts || 0}</span>
            <ShieldAlert className="w-5 h-5 text-rose-600" />
          </div>
        </div>

        <div className="clay-inset p-4 bg-[#f8faf8] border border-emerald-200 rounded-xl">
          <div className="text-slate-600 text-xs font-extrabold mb-1">Track Section Corridor</div>
          <div className="text-sm font-black text-emerald-900 truncate">
            {liveData?.corridor?.name || "Southern Railway - MAS-BZA Mainline"}
          </div>
          <div className="text-xs text-slate-600 font-mono font-bold mt-0.5">KM 100.0 → KM 200.0</div>
        </div>
      </div>

      {/* TRACK CORRIDOR VISUAL RADAR - LIGHT & CLEARLY SPACED */}
      <div className="clay-inset bg-[#f4f8f5] border border-emerald-200 rounded-2xl p-5 space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs border-b border-emerald-200 pb-3">
          <span className="font-extrabold text-slate-900 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-600" /> Track Dynamic Position Radar (KM 100 to KM 200)
          </span>
          <span className="text-emerald-800 font-bold text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Track Signals Operational
          </span>
        </div>

        {/* Corridor Graphic Container with Vertical Layering */}
        <div className="relative bg-white rounded-xl border border-emerald-200 shadow-sm min-h-[220px] pt-4 pb-4 px-6 overflow-hidden">
          
          {/* Active Maintenance Possession Zone Highlight (KM 142.0 to KM 144.0) */}
          <div
            className="absolute top-28 -translate-y-1/2 h-14 bg-amber-100/90 border-2 border-amber-500 rounded-lg flex items-center justify-center pointer-events-none transition-all z-0"
            style={{
              left: `${((142.0 - 100.0) / 100.0) * 88 + 6}%`,
              width: `${(2.0 / 100.0) * 88}%`
            }}
          >
            <div className="text-[10px] font-black text-amber-950 uppercase tracking-tight text-center leading-tight bg-amber-200 px-2 py-0.5 rounded border border-amber-400">
              🚧 Maintenance Block (KM 142-144)
            </div>
          </div>

          {/* Main Track Line */}
          <div className="absolute top-28 left-6 right-6 h-4 bg-slate-200 rounded-full border border-slate-300 flex items-center justify-between shadow-inner">
            <div className="w-full h-2 bg-gradient-to-r from-emerald-500/80 via-teal-600/80 to-emerald-500/80 rounded-full" />
          </div>

          {/* Station KM Markers (LAYERED STRICTLY AT THE BOTTOM) */}
          {[100, 120, 140, 160, 180, 200].map((km) => {
            const leftPct = ((km - 100) / 100) * 88 + 6;
            return (
              <div
                key={km}
                className="absolute bottom-2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10"
                style={{ left: `${leftPct}%` }}
              >
                <div className="w-3 h-3 rounded-full bg-slate-700 border-2 border-white shadow-sm" />
                <div className="mt-1 text-[11px] font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-300 shadow-xs">
                  KM {km}
                </div>
              </div>
            );
          })}

          {/* Live Dynamic Train Markers (STAGGERED AT THE TOP) */}
          {trains.map((train, idx) => {
            const clampedKm = Math.max(100, Math.min(200, train.current_km));
            const leftPct = ((clampedKm - 100) / 100) * 88 + 6;
            const isWarning = train.status === "APPROACHING_MAINTENANCE_ZONE";
            const isInside = train.status === "INSIDE_MAINTENANCE_BLOCK";

            // Alternate vertical offset to avoid horizontal badge overlap when trains are close
            const topPositionClass = idx % 2 === 0 ? "top-3" : "top-14";

            return (
              <div
                key={train.train_number}
                className={`absolute ${topPositionClass} -translate-x-1/2 flex flex-col items-center group cursor-pointer z-20 transition-all duration-700`}
                style={{ left: `${leftPct}%` }}
              >
                {/* Train Label Badge */}
                <div
                  className={`px-2.5 py-1 rounded-lg border shadow-md font-mono text-xs flex items-center gap-1.5 transition-transform group-hover:scale-110 ${
                    isInside
                      ? "bg-rose-600 text-white border-rose-300 animate-pulse font-extrabold"
                      : isWarning
                      ? "bg-amber-500 text-slate-950 border-amber-300 font-extrabold"
                      : "bg-emerald-700 text-white border-emerald-500 font-bold"
                  }`}
                >
                  <Train className="w-3.5 h-3.5" />
                  <span>#{train.train_number}</span>
                  <span className="text-[10px] opacity-90 font-sans font-bold">
                    ({train.current_km} KM)
                  </span>
                </div>
                
                {/* Connecting Pin Line */}
                <div className="w-0.5 h-5 bg-slate-400 my-0.5 shadow-xs"></div>

                {/* Tooltip Card on Hover */}
                <div className="absolute top-10 hidden group-hover:block w-60 bg-white border border-slate-300 rounded-xl p-3 shadow-2xl z-40 text-left">
                  <div className="flex items-center justify-between font-bold text-slate-900 text-xs border-b border-slate-100 pb-1.5 mb-1.5">
                    <span>Train {train.train_number}</span>
                    <span className="text-emerald-700 font-mono text-[11px] font-bold">{train.speed_kmh} km/h</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 mb-1">{train.train_name}</div>
                  <div className="text-[11px] text-slate-600 flex items-center justify-between">
                    <span>Direction: <strong className="text-slate-900">{train.direction}</strong></span>
                    <span>Delay: <strong className="text-amber-700">{train.delay_minutes}m</strong></span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono font-semibold">
                    GPS Fix: {train.latitude.toFixed(4)}, {train.longitude.toFixed(4)}
                  </div>
                  {train.proximity_warning && (
                    <div className="mt-2 text-[10px] text-amber-900 bg-amber-100 p-1.5 rounded border border-amber-300 font-bold">
                      ⚠️ {train.proximity_warning}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM CONTROL SECTION: LOCO PILOT TELEMETRY INGESTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {/* Mobile / Hardware GPS Ingestion Controls */}
        <div className="md:col-span-2 clay-inset bg-[#f8faf8] border border-emerald-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-emerald-900 uppercase tracking-wide">
            <Send className="w-4 h-4 text-emerald-600" /> Loco Pilot Smartphone & Hardware Telemetry Simulator
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Inject live GPS updates to test real-time map snapping and safety block proximity warnings.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-extrabold text-slate-800 block mb-1">Select Train</label>
              <select
                value={selectedTrain}
                onChange={(e) => setSelectedTrain(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
              >
                {trains.map((t) => (
                  <option key={t.train_number} value={t.train_number}>
                    Train {t.train_number} - {t.train_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-slate-800 block mb-1">
                Corridor Position: <span className="text-emerald-800 font-mono font-black">KM {customKm}</span>
              </label>
              <input
                type="range"
                min={105}
                max={195}
                step={0.5}
                value={customKm}
                onChange={(e) => setCustomKm(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-slate-800 block mb-1">
                Train Speed: <span className="text-emerald-800 font-mono font-black">{customSpeed} km/h</span>
              </label>
              <input
                type="range"
                min={0}
                max={140}
                step={5}
                value={customSpeed}
                onChange={(e) => setCustomSpeed(parseInt(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handlePushTelemetry}
              className="bento-btn bento-btn-emerald text-xs py-2 px-4 font-bold shadow-md"
            >
              <Radio className="w-3.5 h-3.5" /> Ingest Live Telemetry Fix
            </button>

            {pushStatus && (
              <span className="text-xs font-extrabold text-emerald-800 font-mono">
                {pushStatus}
              </span>
            )}
          </div>
        </div>

        {/* Live Train Feed List */}
        <div className="clay-inset bg-[#f8faf8] border border-emerald-200 rounded-xl p-4 space-y-2">
          <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-600" /> Active Train Telemetry Stream
          </div>
          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {trains.map((t) => (
              <div
                key={t.train_number}
                className="bg-white border border-emerald-100 rounded-lg p-2 flex items-center justify-between text-xs shadow-xs"
              >
                <div>
                  <span className="font-extrabold text-slate-900">#{t.train_number}</span>{" "}
                  <span className="text-slate-600 text-[11px] font-medium">({t.direction})</span>
                  <div className="text-[10px] text-emerald-800 font-mono font-bold">KM {t.current_km} • {t.speed_kmh} km/h</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                    {t.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
