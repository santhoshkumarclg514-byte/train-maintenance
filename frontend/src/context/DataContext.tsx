"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../services/api";

interface DataContextType {
  dashboardData: any;
  trains: any[];
  requests: any[];
  inspections: any[];
  pipelineData: any;
  activePlan: any;
  isLoading: boolean;
  isGenerating: boolean;
  isResetting: boolean;
  demoStep: number;
  setDemoStep: (step: number) => void;
  loadData: () => Promise<void>;
  handleGeneratePlan: () => Promise<void>;
  handleResetDemo: () => Promise<void>;
  setActivePlan: React.Dispatch<React.SetStateAction<any>>;
}

const DataContext = createContext<DataContextType>({
  dashboardData: null,
  trains: [],
  requests: [],
  inspections: [],
  pipelineData: null,
  activePlan: null,
  isLoading: true,
  isGenerating: false,
  isResetting: false,
  demoStep: 1,
  setDemoStep: () => {},
  loadData: async () => {},
  handleGeneratePlan: async () => {},
  handleResetDemo: async () => {},
  setActivePlan: () => {},
});

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [trains, setTrains] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [inspections, setInspections] = useState<any[]>([]);
  const [pipelineData, setPipelineData] = useState<any>(null);
  const [activePlan, setActivePlan] = useState<any>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(1);

  const loadData = useCallback(async () => {
    try {
      const [dash, trn, reqs, ins] = await Promise.all([
        api.getDashboard(),
        api.getTrains(),
        api.getMaintenance(),
        api.getInspections(),
      ]);
      setDashboardData(dash);
      setTrains(trn.trains || []);
      setRequests(reqs.maintenance_requests || []);
      setInspections(ins.inspections || []);
      if (dash.latest_plan) {
        setActivePlan(dash.latest_plan);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const result = await api.runPipeline();
      setPipelineData(result);
      setActivePlan({
        id: result.plan_id,
        plan_code: result.plan_code,
        start_time: result.time_window.split(" – ")[0],
        end_time: result.time_window.split(" – ")[1],
        start_km: 142.0,
        end_km: 143.0,
        train_conflicts_count: result.train_conflicts_count,
        recommendation_reason: result.recommendation_reason,
        solver_status: result.solver_status,
        approval_status: "AI_RECOMMENDED",
      });
      setDemoStep(3);
      await loadData();
    } catch (err: any) {
      alert(`Pipeline execution error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await api.resetDemo();
      setPipelineData(null);
      setDemoStep(1);
      await loadData();
    } catch (err: any) {
      alert(`Reset error: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <DataContext.Provider
      value={{
        dashboardData,
        trains,
        requests,
        inspections,
        pipelineData,
        activePlan,
        isLoading,
        isGenerating,
        isResetting,
        demoStep,
        setDemoStep,
        loadData,
        handleGeneratePlan,
        handleResetDemo,
        setActivePlan,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
