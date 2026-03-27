"use client";

import DashboardHeader from "./components/DashboardHeader";
import StatsCards from "./components/StatsCards";
import ThreatLevelCard from "./components/ThreatLevelCard";
import NDVITrendChart from "./components/NDVITrendChart";
import RecentScansTable from "./components/RecentScansTable";
import AlertsPreview from "./components/AlertsPreview";

export default function DashboardPage() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground transition-colors duration-300">
      <DashboardHeader />

      <main className="space-y-6 p-6">
        {/* Top Level Key Indicators */}
        <section>
          <StatsCards />
        </section>

        {/* Primary Analysis Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 flex flex-col">
            <div className="h-full bg-card border border-border rounded-2xl shadow-sm">
              <ThreatLevelCard />
            </div>
          </div>
          <div className="lg:col-span-8 flex flex-col">
            <div className="h-full bg-card border border-border rounded-2xl shadow-sm p-1">
              <NDVITrendChart />
            </div>
          </div>
        </div>

        {/* Secondary Details Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <RecentScansTable />
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <AlertsPreview />
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info (Optional) */}
      <footer className="px-6 pb-12">
        <p className="text-[10px] text-center font-bold uppercase tracking-[0.3em] text-muted-foreground/40">
          Sentinel Eye • Global Environmental Analysis Engine
        </p>
      </footer>
    </div>
  );
}
