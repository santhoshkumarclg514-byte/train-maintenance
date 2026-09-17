"use client";
import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { ShieldCheck, AlertTriangle, Flame, Clock, CalendarCheck, CheckCircle2 } from "lucide-react";

interface KpiData {
  healthy_sections: number;
  attention_required: number;
  critical_defects: number;
  pending_maintenance: number;
  planned_blocks: number;
  train_conflicts_avoided: number;
  crew_availability?: string;
}

export const KpiBentoGrid: React.FC<{ kpis: KpiData }> = ({ kpis }) => {
  const { t } = useLanguage();

  const cards = [
    {
      title: t("kpi_healthy_sections"),
      value: kpis.healthy_sections || 76,
      icon: ShieldCheck,
      color: "text-emerald-700",
      bgGlow: "from-emerald-50 to-white",
      badge: "94.2% Operational",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
    {
      title: t("kpi_attention_required"),
      value: kpis.attention_required || 8,
      icon: AlertTriangle,
      color: "text-amber-700",
      bgGlow: "from-amber-50 to-white",
      badge: "Speed Restricted",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    },
    {
      title: t("kpi_critical_defects"),
      value: kpis.critical_defects || 3,
      icon: Flame,
      color: "text-rose-700",
      bgGlow: "from-rose-50 to-white",
      badge: "TRK-104 / SIG-207",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
    },
    {
      title: t("kpi_pending_maintenance"),
      value: kpis.pending_maintenance || 12,
      icon: Clock,
      color: "text-teal-700",
      bgGlow: "from-teal-50 to-white",
      badge: "Queued for Bundling",
      badgeColor: "bg-teal-100 text-teal-800 border-teal-300",
    },
    {
      title: t("kpi_planned_blocks"),
      value: kpis.planned_blocks || 4,
      icon: CalendarCheck,
      color: "text-emerald-700",
      bgGlow: "from-emerald-50 to-white",
      badge: "OR-Tools Scheduled",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
    {
      title: t("kpi_conflicts_avoided"),
      value: kpis.train_conflicts_avoided || 6,
      icon: CheckCircle2,
      color: "text-green-700",
      bgGlow: "from-green-50 to-white",
      badge: "0 Headway Penalties",
      badgeColor: "bg-green-100 text-green-800 border-green-300",
    },
  ];

  return (
    <section className="mb-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`clay-card p-4 relative overflow-hidden bg-gradient-to-b ${card.bgGlow} flex flex-col justify-between border border-emerald-100`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-bold text-slate-600 line-clamp-1">
                  {card.title}
                </span>
                <div className="p-2 rounded-xl clay-inset bg-white">
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>

              <div className="my-2">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {card.value}
                </span>
              </div>

              <div className="mt-1">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${card.badgeColor} inline-block truncate max-w-full`}
                >
                  {card.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
