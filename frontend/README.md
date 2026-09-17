# 🚆 RAILBLOCK AI — Frontend Web Application

This is the Next.js frontend web application for **RAILBLOCK AI** — an AI-powered Smart Railway Maintenance Planning, Conflict Detection, and Traffic Decision Support system.

---

## 🚀 Pages & Modules

- **Dashboard (`/`)**: High-level overview of maintenance requests, active train delays, section stats, and immediate action alerts.
- **Corridor Management (`/corridor`)**: Visual representation of railway corridors, track sections, and train schedules.
- **AI Optimizer & What-If Simulator (`/optimizer`)**:
  - Triggers Google OR-Tools CP-SAT solver & DBSCAN spatial-temporal bundling.
  - Interactive What-If simulation engine to model speed restrictions and delay propagation.
  - Controller approval/rejection modal for human-in-the-loop decision making.
- **Maintenance & Inspection Logs (`/requests`)**: Detailed list of track geometry inspection defects, crew requirements, and maintenance work orders.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4 & PostCSS
- **Icons**: Lucide React
- **Language**: TypeScript

---

## 🏃 Getting Started

### Prerequisites

Ensure you have [Node.js 18+](https://nodejs.org/) installed on your machine.

### Installation

```bash
# Navigate to the frontend folder
cd frontend

# Install dependencies
npm install
```

### Running Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

---

## 🔗 Backend Connection

The frontend connects to the RAILBLOCK AI FastAPI backend server running locally on `http://localhost:8000`. Ensure the backend server is running for live data fetching and optimization.

```bash
# To start the backend (from backend directory):
cd ../backend
py -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

---

## 📦 Scripts

- `npm run dev`: Starts the Next.js development server with Turbopack.
- `npm run build`: Builds the production bundle.
- `npm run start`: Runs the built production server.
- `npm run lint`: Runs ESLint check across source files.
