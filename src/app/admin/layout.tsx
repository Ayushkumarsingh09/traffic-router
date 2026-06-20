"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/site-settings", label: "Site Settings" },
  { href: "/admin/rules", label: "Rules" },
  { href: "/admin/destinations", label: "Destinations" },
  { href: "/admin/pools", label: "Pools" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/conversions", label: "Conversions" },
  { href: "/admin/logs", label: "Traffic Logs" },
  { href: "/admin/audit", label: "Audit" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return children;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm text-slate-400">Traffic Router</p>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <button
            onClick={async () => {
              await fetch("/api/auth/login", { method: "DELETE" });
              window.location.href = "/admin/login";
            }}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 pb-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-4 py-2 text-sm ${
                pathname === item.href ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-300"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
