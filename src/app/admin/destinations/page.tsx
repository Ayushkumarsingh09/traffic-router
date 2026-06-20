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

interface Destination {
  id: string;
  name: string;
  slug: string | null;
  url: string;
  type: "INTERNAL" | "EXTERNAL";
  description: string | null;
  isActive: boolean;
}

const emptyForm: {
  name: string;
  slug: string;
  url: string;
  type: "INTERNAL" | "EXTERNAL";
  description: string;
  isActive: boolean;
} = {
  name: "",
  slug: "",
  url: "",
  type: "EXTERNAL",
  description: "",
  isActive: true,
};

export default function DestinationsPage() {
  const { apiFetch, loading: sessionLoading } = useAdminSession();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch("/api/destinations");
    setDestinations(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    const payload = {
      ...form,
      slug: form.slug || null,
      description: form.description || null,
    };
    const response = await apiFetch(editingId ? `/api/destinations/${editingId}` : "/api/destinations", {
      method: editingId ? "PUT" : "POST",
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      setMessage("Failed to save destination");
      return;
    }
    setForm(emptyForm);
    setEditingId(null);
    setMessage("Saved successfully");
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this destination?")) return;
    await apiFetch(`/api/destinations/${id}`, { method: "DELETE" });
    await load();
  }

  if (sessionLoading) return <p className="text-slate-400">Loading...</p>;

  return (
    <div className="space-y-6">
      <AdminCard title={editingId ? "Edit Destination" : "Add Destination"}>
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
          <Field label="Name">
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="Slug (internal pages)">
            <input className={inputClass} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </Field>
          <Field label="URL">
            <input className={inputClass} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required />
          </Field>
          <Field label="Type">
            <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "INTERNAL" | "EXTERNAL" })}>
              <option value="EXTERNAL">EXTERNAL</option>
              <option value="INTERNAL">INTERNAL</option>
            </select>
          </Field>
          <Field label="Description">
            <input className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="Active">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          </Field>
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className={buttonPrimary}>{editingId ? "Update" : "Create"}</button>
            {editingId && (
              <button type="button" className={buttonSecondary} onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
        {message && <p className="mt-3 text-sm text-emerald-300">{message}</p>}
      </AdminCard>

      <AdminCard title="All Destinations">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-400">
              <tr>
                <th className="py-2">Name</th>
                <th>Type</th>
                <th>URL</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {destinations.map((d) => (
                <tr key={d.id} className="border-t border-slate-800">
                  <td className="py-2">{d.name}</td>
                  <td>{d.type}</td>
                  <td className="max-w-xs truncate text-slate-400">{d.url}</td>
                  <td>{d.isActive ? "Active" : "Inactive"}</td>
                  <td className="space-x-2">
                    <button className={buttonSecondary} onClick={() => { setEditingId(d.id); setForm({ name: d.name, slug: d.slug ?? "", url: d.url, type: d.type, description: d.description ?? "", isActive: d.isActive }); }}>Edit</button>
                    <button className={buttonDanger} onClick={() => handleDelete(d.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
