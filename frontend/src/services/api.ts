const API_BASE = "http://127.0.0.1:8000";

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API Error [${res.status}]: ${errorText || res.statusText}`);
    }
    return (await res.json()) as T;
  } catch (err: any) {
    console.error(`API Call failed on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  getHealth: () => fetchApi<{ status: string }>("/health"),
  getDashboard: () => fetchApi<any>("/api/dashboard"),
  getSections: () => fetchApi<{ sections: any[]; stations: any[] }>("/api/sections"),
  getTrains: () => fetchApi<{ trains: any[] }>("/api/trains"),
  getCrews: () => fetchApi<{ crews: any[]; equipment: any[] }>("/api/crews"),
  getMaintenance: () => fetchApi<{ maintenance_requests: any[] }>("/api/maintenance"),
  
  createMaintenance: (data: any) =>
    fetchApi<any>("/api/maintenance", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getInspections: () => fetchApi<{ inspections: any[] }>("/api/inspection"),
  
  convertInspection: (inspId: number) =>
    fetchApi<any>(`/api/inspection/generate-request/${inspId}`, {
      method: "POST",
    }),

  calculatePriority: (data: any) =>
    fetchApi<any>("/api/priority/calculate", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  teamAllocation: (defectType: string, department: string) =>
    fetchApi<any>("/api/team-allocation", {
      method: "POST",
      body: JSON.stringify({ defect_type: defectType, department }),
    }),

  runClustering: () =>
    fetchApi<any>("/api/clustering/run", {
      method: "POST",
    }),

  runPipeline: () =>
    fetchApi<any>("/api/pipeline/run", {
      method: "POST",
    }),

  runWhatIf: (params: any) =>
    fetchApi<any>("/api/what-if", {
      method: "POST",
      body: JSON.stringify(params),
    }),

  approvePlan: (planId: number, notes?: string) =>
    fetchApi<any>(`/api/plans/${planId}/approve`, {
      method: "POST",
      body: JSON.stringify({ controller_notes: notes }),
    }),

  rejectPlan: (planId: number, notes?: string) =>
    fetchApi<any>(`/api/plans/${planId}/reject`, {
      method: "POST",
      body: JSON.stringify({ controller_notes: notes }),
    }),

  resetDemo: () =>
    fetchApi<any>("/api/reset-demo", {
      method: "POST",
    }),

  getLiveTrains: () =>
    fetchApi<{
      live_trains: any[];
      total_active_trains: number;
      active_conflicts: number;
      proximity_alerts: number;
      corridor: any;
      mode: string;
    }>("/api/trains/live"),

  pushTelemetry: (data: { train_number: string; latitude: number; longitude: number; speed_kmh?: number; delay_minutes?: number; source?: string }) =>
    fetchApi<any>("/api/trains/live-telemetry", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  analyzeInspectionAI: (data: any) =>
    fetchApi<any>("/api/ai/analyze-inspection", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

