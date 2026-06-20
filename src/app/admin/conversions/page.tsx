"use client";

import { useEffect, useState } from "react";
import { AdminCard } from "@/components/admin/AdminUi";

export default function ConversionsPage() {
  const [report, setReport] = useState<{
    totalConversions: number;
    conversionRate: number;
    byEvent: Record<string, number>;
    recent: { id: string; eventName: string; createdAt: string; destination?: { name: string } | null }[];
  } | null>(null);

  useEffect(() => {
    fetch("/api/conversions/report?days=30").then((r) => r.json()).then(setReport);
  }, []);

  if (!report) return <p className="text-slate-400">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <AdminCard title="Total Conversions"><p className="text-3xl font-bold">{report.totalConversions}</p></AdminCard>
        <AdminCard title="Conversion Rate"><p className="text-3xl font-bold">{report.conversionRate}%</p></AdminCard>
      </div>
      <AdminCard title="By Event">
        <div className="space-y-2">
          {Object.entries(report.byEvent).map(([event, count]) => (
            <div key={event} className="flex justify-between text-sm"><span>{event}</span><span>{count}</span></div>
          ))}
        </div>
      </AdminCard>
      <AdminCard title="Recent Conversions">
        <div className="space-y-2 text-sm">
          {report.recent.map((row) => (
            <div key={row.id} className="flex justify-between border-b border-slate-800 py-2">
              <span>{row.eventName} · {row.destination?.name ?? "—"}</span>
              <span className="text-slate-400">{new Date(row.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}
