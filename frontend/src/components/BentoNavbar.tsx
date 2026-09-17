"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import { useData } from "../context/DataContext";
import {
  Train,
  Cpu,
  RefreshCw,
  Globe,
  Sparkles,
  LayoutDashboard,
  MapPin,
  Brain,
  Wrench,
  Radio,
  UserCheck,
  Clock,
  ArrowRight,
} from "lucide-react";

export const BentoNavbar: React.FC = () => {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const {
    isResetting,
    isGenerating,
    handleResetDemo,
    handleGeneratePlan,
    demoStep,
    setDemoStep,
  } = useData();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/corridor", label: "Corridor & Gantt", icon: MapPin },
    { href: "/optimizer", label: "AI Optimizer & What-If", icon: Brain },
    { href: "/requests", label: "Maintenance Requests", icon: Wrench },
    { href: "/inspections", label: "USFD Telemetry", icon: Radio },
    { href: "/approvals", label: "Controller Approval", icon: UserCheck },
    { href: "/timetable", label: "Timetable & Conflicts", icon: Clock },
  ];

  return (
    <header className="mb-6 space-y-4">
      {/* Top Header Card */}
      <div className="clay-container p-4 md:p-6 bg-white border border-emerald-200 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 border border-white/60 group-hover:scale-105 transition-transform">
              <Train className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                  RAILBLOCK <span className="text-emerald-600">AI</span>
                </h1>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold tracking-wide flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-emerald-600" /> CP-SAT v9.15
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold tracking-wide">
                  {t("demo_mode_badge")}
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-600 mt-0.5 font-medium">
                {t("app_subtitle")}
              </p>
            </div>
          </Link>
        </div>

        {/* Global Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Language Switcher */}
          <div className="clay-inset p-1.5 flex items-center gap-1 bg-[#f1f6f3]">
            <Globe className="w-4 h-4 text-emerald-700 ml-1.5 mr-0.5" />
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                language === "en"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-slate-600 hover:text-emerald-800"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage("hi")}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                language === "hi"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-slate-600 hover:text-emerald-800"
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLanguage("ta")}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                language === "ta"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-slate-600 hover:text-emerald-800"
              }`}
            >
              தமிழ்
            </button>
          </div>

          {/* Reset Demo Button */}
          <button
            onClick={handleResetDemo}
            disabled={isResetting}
            className="bento-btn bento-btn-secondary text-xs"
            title="Reset database to initial synthetic demo state"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
            {t("reset_demo")}
          </button>

          {/* Primary Run AI Pipeline Button */}
          <button
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="bento-btn bento-btn-emerald text-sm py-2 px-5 font-bold shadow-lg shadow-emerald-500/25"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
            {isGenerating ? t("running_pipeline") : t("generate_smart_plan")}
          </button>
        </div>
      </div>

      {/* Multipage Tab Navigation Bar */}
      <nav className="clay-container p-2 bg-white border border-emerald-200 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.02]"
                    : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-emerald-600"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Interactive SIH Demo Stepper Banner */}
      <div className="clay-container p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">
              SIH End-to-End Demo Workflow:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Link
              href="/"
              onClick={() => setDemoStep(1)}
              className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-all ${
                demoStep === 1
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "clay-inset text-emerald-900 hover:bg-emerald-100"
              }`}
            >
              1. Dashboard
            </Link>
            <ArrowRight className="w-3 h-3 text-emerald-400" />

            <Link
              href="/requests"
              onClick={() => setDemoStep(2)}
              className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-all ${
                demoStep === 2
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "clay-inset text-emerald-900 hover:bg-emerald-100"
              }`}
            >
              2. Add Defect & Score
            </Link>
            <ArrowRight className="w-3 h-3 text-emerald-400" />

            <Link
              href="/optimizer"
              onClick={handleGeneratePlan}
              className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-all ${
                demoStep === 3
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "clay-inset text-emerald-900 hover:bg-emerald-100"
              }`}
            >
              3. Generate Plan
            </Link>
            <ArrowRight className="w-3 h-3 text-emerald-400" />

            <Link
              href="/optimizer"
              onClick={() => setDemoStep(4)}
              className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-all ${
                demoStep === 4
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "clay-inset text-emerald-900 hover:bg-emerald-100"
              }`}
            >
              4. What-If Replanning
            </Link>
            <ArrowRight className="w-3 h-3 text-emerald-400" />

            <Link
              href="/approvals"
              onClick={() => setDemoStep(5)}
              className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-all ${
                demoStep === 5
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "clay-inset text-emerald-900 hover:bg-emerald-100"
              }`}
            >
              5. Controller Approval
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
