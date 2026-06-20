"use client";

import { useEffect, useState } from "react";
import type { AnalyticsSummary } from "@/lib/types";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    fetch("/api/analytics?days=30")
      .then((res) => res.json())
      .then((data) => setSummary(data.summary));
  }, []);

  if (!summary) {
    return <p className="text-slate-400">Loading analytics...</p>;
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-2xl font-bold">Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Visits" value={summary.totalVisits} />
          <StatCard label="Unique Visitors" value={summary.uniqueVisitors} />
          <StatCard label="Conversions" value={summary.conversions} />
          <StatCard label="Conversion Rate" value={`${summary.conversionRate}%`} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <BreakdownCard title="Device Breakdown" data={summary.deviceBreakdown} />
        <BreakdownCard title="Top Countries" data={summary.countryBreakdown} />
        <BreakdownCard title="Referrer Sources" data={summary.referrerBreakdown} />
        <BreakdownCard title="Route Decisions" data={summary.routeBreakdown} />
      </section>
    </div>
  );
}

function BreakdownCard({ title, data }: { title: string; data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 8);
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      <div className="space-y-3">
        {entries.length === 0 && <p className="text-sm text-slate-500">No data yet</p>}
        {entries.map(([key, value]) => (
          <div key={key} className="flex items-center justify-between text-sm">
            <span className="text-slate-300">{key}</span>
            <span className="font-semibold">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
