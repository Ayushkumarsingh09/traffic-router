"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAdminSession } from "@/hooks/useAdminSession";
import {
  AdminCard,
  Field,
  buttonDanger,
  buttonPrimary,
  buttonSecondary,
  inputClass,
} from "@/components/admin/AdminUi";

interface Destination { id: string; name: string; url: string }
interface PoolMember { destinationId: string; weight: number; destination?: Destination }
interface Pool {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  members: PoolMember[];
}

export default function PoolsPage() {
  const { apiFetch, loading: sessionLoading } = useAdminSession();
  const [pools, setPools] = useState<Pool[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    isActive: true,
    members: [{ destinationId: "", weight: 25 }],
  });

  async function load() {
    const [poolsRes, destRes] = await Promise.all([fetch("/api/pools"), fetch("/api/destinations")]);
    setPools(await poolsRes.json());
    setDestinations(await destRes.json());
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      name: form.name,
      description: form.description || null,
      isActive: form.isActive,
      members: form.members.filter((m) => m.destinationId),
    };
    await apiFetch(editingId ? `/api/pools/${editingId}` : "/api/pools", {
      method: editingId ? "PUT" : "POST",
      body: JSON.stringify(payload),
    });
    setEditingId(null);
    setForm({ name: "", description: "", isActive: true, members: [{ destinationId: "", weight: 25 }] });
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this pool?")) return;
    await apiFetch(`/api/pools/${id}`, { method: "DELETE" });
    await load();
  }

  if (sessionLoading) return <p className="text-slate-400">Loading...</p>;

  return (
    <div className="space-y-6">
      <AdminCard title={editingId ? "Edit Pool" : "Create Pool"}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Name"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
            <Field label="Description"><input className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Members & weights</p>
            {form.members.map((member, index) => (
              <div key={index} className="grid gap-2 md:grid-cols-3">
                <select className={inputClass} value={member.destinationId} onChange={(e) => {
                  const members = [...form.members];
                  members[index] = { ...member, destinationId: e.target.value };
                  setForm({ ...form, members });
                }}>
                  <option value="">Select destination...</option>
                  {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <input type="number" className={inputClass} value={member.weight} onChange={(e) => {
                  const members = [...form.members];
                  members[index] = { ...member, weight: Number(e.target.value) };
                  setForm({ ...form, members });
                }} />
                <button type="button" className={buttonDanger} onClick={() => setForm({ ...form, members: form.members.filter((_, i) => i !== index) })}>Remove</button>
              </div>
            ))}
            <button type="button" className={buttonSecondary} onClick={() => setForm({ ...form, members: [...form.members, { destinationId: "", weight: 10 }] })}>Add Member</button>
          </div>
          <button type="submit" className={buttonPrimary}>{editingId ? "Update Pool" : "Create Pool"}</button>
        </form>
      </AdminCard>

      <div className="grid gap-4 lg:grid-cols-2">
        {pools.map((pool) => {
          const total = pool.members.reduce((sum, m) => sum + m.weight, 0);
          return (
            <AdminCard
              key={pool.id}
              title={pool.name}
              actions={
                <div className="flex gap-2">
                  <button className={buttonSecondary} onClick={() => {
                    setEditingId(pool.id);
                    setForm({
                      name: pool.name,
                      description: pool.description ?? "",
                      isActive: pool.isActive,
                      members: pool.members.map((m) => ({ destinationId: m.destination?.id ?? m.destinationId, weight: m.weight })),
                    });
                  }}>Edit</button>
                  <button className={buttonDanger} onClick={() => handleDelete(pool.id)}>Delete</button>
                </div>
              }
            >
              {pool.members.map((member, index) => (
                <div key={index} className="mb-2 rounded-lg bg-slate-950 p-3 text-sm">
                  <div className="flex justify-between">
                    <span>{member.destination?.name ?? member.destinationId}</span>
                    <span>{total > 0 ? ((member.weight / total) * 100).toFixed(0) : 0}%</span>
                  </div>
                </div>
              ))}
            </AdminCard>
          );
        })}
      </div>
    </div>
  );
}
