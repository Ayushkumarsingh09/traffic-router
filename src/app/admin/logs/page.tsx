"use client";

import { useEffect, useState } from "react";

interface TrafficLog {
  id: string;
  createdAt: string;
  deviceType: string;
  browser: string;
  country: string;
  referrer: string | null;
  isFacebookInApp: boolean;
  routeDecision?: {
    ruleName?: string | null;
    destinationUrl: string;
    action: string;
  } | null;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<TrafficLog[]>([]);

  useEffect(() => {
    fetch("/api/analytics?limit=100")
      .then((res) => res.json())
      .then((data) => setLogs(data.logs ?? []));
  }, []);

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Traffic Logs</h2>
      <div className="overflow-hidden rounded-2xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 bg-slate-900 text-sm">
          <thead className="bg-slate-950 text-left text-slate-400">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Device</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">FB In-App</th>
              <th className="px-4 py-3">Decision</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-slate-800">
                <td className="px-4 py-3">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">{log.deviceType}</td>
                <td className="px-4 py-3">{log.country}</td>
                <td className="px-4 py-3">{log.isFacebookInApp ? "Yes" : "No"}</td>
                <td className="px-4 py-3">
                  {log.routeDecision?.ruleName ?? log.routeDecision?.destinationUrl ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
