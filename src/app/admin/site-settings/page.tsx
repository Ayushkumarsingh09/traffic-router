"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAdminSession } from "@/hooks/useAdminSession";
import {
  AdminCard,
  Field,
  buttonPrimary,
  inputClass,
} from "@/components/admin/AdminUi";
import type { SiteConfigData } from "@/lib/site-config";

export default function SiteSettingsPage() {
  const { apiFetch, loading } = useAdminSession();
  const [form, setForm] = useState<SiteConfigData | null>(null);
  const [imagesText, setImagesText] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/site-config").then((r) => r.json()).then((data: SiteConfigData) => {
      setForm(data);
      setImagesText(data.landingImages.join("\n"));
    });
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    setMessage("");
    const payload = {
      ...form,
      landingImages: imagesText.split("\n").map((line) => line.trim()).filter(Boolean),
    };
    const response = await apiFetch("/api/site-config", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    setMessage(response.ok ? "Site settings saved" : "Failed to save settings");
  }

  if (loading || !form) return <p className="text-slate-400">Loading...</p>;

  return (
    <AdminCard title="Replica Landing Settings (sparexpics.top style)">
      <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
        <Field label="Page Title"><input className={inputClass} value={form.landingTitle} onChange={(e) => setForm({ ...form, landingTitle: e.target.value })} /></Field>
        <Field label="CTA / Redirect URL"><input className={inputClass} value={form.landingCtaUrl} onChange={(e) => setForm({ ...form, landingCtaUrl: e.target.value })} /></Field>
        <Field label="OG Title"><input className={inputClass} value={form.ogTitle} onChange={(e) => setForm({ ...form, ogTitle: e.target.value })} /></Field>
        <Field label="OG Description"><input className={inputClass} value={form.ogDescription} onChange={(e) => setForm({ ...form, ogDescription: e.target.value })} /></Field>
        <Field label="OG Image URL"><input className={inputClass} value={form.ogImage} onChange={(e) => setForm({ ...form, ogImage: e.target.value })} /></Field>
        <Field label="OG URL"><input className={inputClass} value={form.ogUrl} onChange={(e) => setForm({ ...form, ogUrl: e.target.value })} /></Field>
        <Field label="Desktop Redirect URL"><input className={inputClass} value={form.desktopRedirectUrl} onChange={(e) => setForm({ ...form, desktopRedirectUrl: e.target.value })} /></Field>
        <Field label="Desktop Breakpoint (px)"><input type="number" className={inputClass} value={form.desktopBreakpoint} onChange={(e) => setForm({ ...form, desktopBreakpoint: Number(e.target.value) })} /></Field>
        <Field label="Delayed Redirect (ms)"><input type="number" className={inputClass} value={form.delayedRedirectMs} onChange={(e) => setForm({ ...form, delayedRedirectMs: Number(e.target.value) })} /></Field>
        <Field label="Enable Desktop Redirect"><input type="checkbox" checked={form.enableDesktopRedirect} onChange={(e) => setForm({ ...form, enableDesktopRedirect: e.target.checked })} /></Field>
        <Field label="Enable Delayed Redirect"><input type="checkbox" checked={form.enableDelayedRedirect} onChange={(e) => setForm({ ...form, enableDelayedRedirect: e.target.checked })} /></Field>
        <div className="md:col-span-2">
          <Field label="Landing Images (one URL per line)">
            <textarea className={`${inputClass} min-h-40`} value={imagesText} onChange={(e) => setImagesText(e.target.value)} />
          </Field>
        </div>
        <button type="submit" className={buttonPrimary}>Save Settings</button>
        {message && <p className="text-sm text-emerald-300">{message}</p>}
      </form>
    </AdminCard>
  );
}
