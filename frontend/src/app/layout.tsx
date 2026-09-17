import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "../context/LanguageContext";
import { DataProvider } from "../context/DataContext";
import { BentoNavbar } from "../components/BentoNavbar";

export const metadata: Metadata = {
  title: "RAILBLOCK AI - Smart Railway Maintenance Decision Support",
  description:
    "AI-Based Smart Railway Maintenance Planning, Team Allocation, Conflict Detection and Dynamic Replanning (SIH Prototype)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#f0f5f2] text-slate-800 min-h-screen">
        <LanguageProvider>
          <DataProvider>
            <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-6">
              <BentoNavbar />
              {children}
              <footer className="text-center py-8 text-xs text-slate-500 border-t border-emerald-200 space-y-1">
                <p className="font-semibold text-emerald-900">
                  RAILBLOCK AI — AI-Based Smart Railway Maintenance Decision Support Prototype
                </p>
                <p>
                  Powered by Google OR-Tools CP-SAT v9.15, Scikit-Learn DBSCAN, and FastAPI • Demonstrating with Synthetic Railway Operations Data
                </p>
              </footer>
            </main>
          </DataProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
