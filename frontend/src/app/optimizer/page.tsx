"use client";
import React from "react";
import { useData } from "../../context/DataContext";
import { BundlingVisualizer } from "../../components/BundlingVisualizer";
import { WhatIfSimulator } from "../../components/WhatIfSimulator";
import { Brain, Cpu } from "lucide-react";

export default function OptimizerPage() {
  const {
    pipelineData,
    dashboardData,
    handleGeneratePlan,
    isGenerating,
    setActivePlan,
    setDemoStep,
  } = useData();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Brain className="w-7 h-7 text-teal-600" />
            AI Task Bundling & What-If Replanning Simulator
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            Scikit-Learn DBSCAN clustering + Google OR-Tools CP-SAT v9.15 constraint optimization solver
          </p>
        </div>
      </div>

      {/* 1. DBSCAN Smart Task Bundling Module */}
      <BundlingVisualizer
        pipelineData={pipelineData || dashboardData?.latest_plan}
        onGeneratePlan={handleGeneratePlan}
        isGenerating={isGenerating}
      />

      {/* 2. What-If Simulator and Dynamic Replanning */}
      <WhatIfSimulator
        onPlanUpdated={(newPlan) => {
          setActivePlan((prev: any) => ({
            ...prev,
            ...newPlan,
            approval_status: "AI_RECOMMENDED",
          }));
          setDemoStep(4);
        }}
      />
    </div>
  );
}
