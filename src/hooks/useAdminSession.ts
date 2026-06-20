"use client";

import { useCallback, useEffect, useState } from "react";

interface AdminSession {
  csrfToken: string;
  user: { id: string; email: string; name: string };
}

export function useAdminSession() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/me");
    if (!response.ok) {
      setSession(null);
      setError("Unauthorized");
      setLoading(false);
      return null;
    }
    const data = await response.json();
    setSession(data);
    setLoading(false);
    return data as AdminSession;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const apiFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      let csrf = session?.csrfToken;
      if (options.method && options.method !== "GET" && !csrf) {
        const data = await refresh();
        csrf = data?.csrfToken ?? "";
      }

      const headers = new Headers(options.headers);
      if (options.method && options.method !== "GET") {
        headers.set("x-csrf-token", csrf ?? "");
      }
      if (!headers.has("Content-Type") && options.body) {
        headers.set("Content-Type", "application/json");
      }
      return fetch(url, { ...options, headers });
    },
    [session?.csrfToken, refresh],
  );

  return { session, loading, error, refresh, apiFetch, csrfToken: session?.csrfToken ?? "" };
}
