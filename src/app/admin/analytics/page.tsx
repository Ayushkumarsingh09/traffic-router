"use client";

import { useEffect, useState } from "react";
import type { AnalyticsSummary } from "@/lib/types";

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetch(`/api/analytics?days=${days}`)
      .then((res) => res.json())
      .then((data) => setSummary(data.summary));
  }, [days]);

  if (!summary) return <p className="text-slate-400">Loading...</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics</h2>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>
      <pre className="overflow-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-300">
        {JSON.stringify(summary, null, 2)}
      </pre>
    </div>
  );
}
