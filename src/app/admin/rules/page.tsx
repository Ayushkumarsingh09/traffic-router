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

interface Rule {
  id: string;
  name: string;
  description: string | null;
  priority: number;
  isActive: boolean;
  action: string;
  destinationId: string | null;
  poolId: string | null;
  conditions: { field: string; operator: string; value: string }[];
}

interface Destination { id: string; name: string }
interface Pool { id: string; name: string }

const emptyCondition = { field: "IS_FACEBOOK_INAPP", operator: "EQUALS", value: "true" };

export default function RulesPage() {
  const { apiFetch, loading: sessionLoading } = useAdminSession();
  const [rules, setRules] = useState<Rule[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [pools, setPools] = useState<Pool[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    priority: 100,
    isActive: true,
    action: "REDIRECT",
    targetType: "pool" as "destination" | "pool",
    destinationId: "",
    poolId: "",
    conditions: [emptyCondition],
  });

  async function load() {
    const [rulesRes, destRes, poolRes] = await Promise.all([
      fetch("/api/rules"),
      fetch("/api/destinations"),
      fetch("/api/pools"),
    ]);
    setRules(await rulesRes.json());
    setDestinations(await destRes.json());
    setPools(await poolRes.json());
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      name: form.name,
      description: form.description || null,
      priority: form.priority,
      isActive: form.isActive,
      action: form.action,
      destinationId: form.targetType === "destination" ? form.destinationId : null,
      poolId: form.targetType === "pool" ? form.poolId : null,
      conditions: form.conditions,
    };
    await apiFetch(editingId ? `/api/rules/${editingId}` : "/api/rules", {
      method: editingId ? "PUT" : "POST",
      body: JSON.stringify(payload),
    });
    setEditingId(null);
    await load();
  }

  async function toggleActive(rule: Rule) {
    await apiFetch(`/api/rules/${rule.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: rule.name,
        description: rule.description,
        priority: rule.priority,
        isActive: !rule.isActive,
        action: rule.action,
        destinationId: rule.destinationId,
        poolId: rule.poolId,
        conditions: rule.conditions,
      }),
    });
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this rule?")) return;
    await apiFetch(`/api/rules/${id}`, { method: "DELETE" });
    await load();
  }

  if (sessionLoading) return <p className="text-slate-400">Loading...</p>;

  return (
    <div className="space-y-6">
      <AdminCard title={editingId ? "Edit Rule" : "Create Rule"}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Name"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
            <Field label="Priority"><input type="number" className={inputClass} value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} /></Field>
            <Field label="Action">
              <select className={inputClass} value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })}>
                <option value="REDIRECT">REDIRECT</option>
                <option value="SHOW">SHOW</option>
              </select>
            </Field>
            <Field label="Target Type">
              <select className={inputClass} value={form.targetType} onChange={(e) => setForm({ ...form, targetType: e.target.value as "destination" | "pool" })}>
                <option value="destination">Destination</option>
                <option value="pool">Pool</option>
              </select>
            </Field>
            {form.targetType === "destination" ? (
              <Field label="Destination">
                <select className={inputClass} value={form.destinationId} onChange={(e) => setForm({ ...form, destinationId: e.target.value })}>
                  <option value="">Select...</option>
                  {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </Field>
            ) : (
              <Field label="Pool">
                <select className={inputClass} value={form.poolId} onChange={(e) => setForm({ ...form, poolId: e.target.value })}>
                  <option value="">Select...</option>
                  {pools.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </Field>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-slate-400">Conditions (all must match)</p>
            {form.conditions.map((condition, index) => (
              <div key={index} className="grid gap-2 md:grid-cols-4">
                <select className={inputClass} value={condition.field} onChange={(e) => {
                  const conditions = [...form.conditions];
                  conditions[index] = { ...condition, field: e.target.value };
                  setForm({ ...form, conditions });
                }}>
                  {["DEVICE_TYPE","BROWSER","OS","REFERRER","COUNTRY","LANGUAGE","USER_AGENT","IS_FACEBOOK_INAPP","IS_MOBILE"].map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <select className={inputClass} value={condition.operator} onChange={(e) => {
                  const conditions = [...form.conditions];
                  conditions[index] = { ...condition, operator: e.target.value };
                  setForm({ ...form, conditions });
                }}>
                  {["EQUALS","NOT_EQUALS","CONTAINS","NOT_CONTAINS","IN","NOT_IN","REGEX"].map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
                <input className={inputClass} value={condition.value} onChange={(e) => {
                  const conditions = [...form.conditions];
                  conditions[index] = { ...condition, value: e.target.value };
                  setForm({ ...form, conditions });
                }} />
                <button type="button" className={buttonDanger} onClick={() => setForm({ ...form, conditions: form.conditions.filter((_, i) => i !== index) })}>Remove</button>
              </div>
            ))}
            <button type="button" className={buttonSecondary} onClick={() => setForm({ ...form, conditions: [...form.conditions, emptyCondition] })}>Add Condition</button>
          </div>

          <div className="flex gap-2">
            <button type="submit" className={buttonPrimary}>{editingId ? "Update" : "Create"}</button>
            {editingId && <button type="button" className={buttonSecondary} onClick={() => setEditingId(null)}>Cancel</button>}
          </div>
        </form>
      </AdminCard>

      <AdminCard title="Active Rules">
        <div className="space-y-4">
          {rules.map((rule) => (
            <div key={rule.id} className="rounded-xl border border-slate-800 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold">{rule.name}</h4>
                  <p className="text-sm text-slate-400">Priority {rule.priority}</p>
                </div>
                <div className="flex gap-2">
                  <button className={buttonSecondary} onClick={() => toggleActive(rule)}>{rule.isActive ? "Disable" : "Enable"}</button>
                  <button className={buttonSecondary} onClick={() => {
                    setEditingId(rule.id);
                    setForm({
                      name: rule.name,
                      description: rule.description ?? "",
                      priority: rule.priority,
                      isActive: rule.isActive,
                      action: rule.action,
                      targetType: rule.poolId ? "pool" : "destination",
                      destinationId: rule.destinationId ?? "",
                      poolId: rule.poolId ?? "",
                      conditions: rule.conditions.length ? rule.conditions : [emptyCondition],
                    });
                  }}>Edit</button>
                  <button className={buttonDanger} onClick={() => handleDelete(rule.id)}>Delete</button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {rule.conditions.map((c, i) => (
                  <span key={i} className="rounded-full bg-slate-800 px-3 py-1 text-xs">{c.field} {c.operator} {c.value}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}
