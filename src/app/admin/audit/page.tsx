"use client";

import { useEffect, useState } from "react";
import { AdminCard } from "@/components/admin/AdminUi";

interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
  ipAddress: string | null;
  user?: { email: string } | null;
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);

  useEffect(() => {
    fetch("/api/audit?limit=200").then((r) => r.json()).then(setLogs);
  }, []);

  return (
    <AdminCard title="Audit Logs">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-400">
            <tr>
              <th className="py-2">Time</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-slate-800">
                <td className="py-2">{new Date(log.createdAt).toLocaleString()}</td>
                <td>{log.user?.email ?? "—"}</td>
                <td>{log.action}</td>
                <td>{log.entityType}{log.entityId ? ` (${log.entityId.slice(0, 8)}…)` : ""}</td>
                <td>{log.ipAddress ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminCard>
  );
}
