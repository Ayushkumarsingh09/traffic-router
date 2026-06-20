"use client";

import { useEffect } from "react";
import type { SiteConfigData } from "@/lib/site-config";

export function ReplicaLandingClient({ config }: { config: SiteConfigData }) {
  useEffect(() => {
    if (config.enableDesktopRedirect && window.innerWidth > config.desktopBreakpoint) {
      window.location.replace(config.desktopRedirectUrl);
      return;
    }

    if (!config.enableDelayedRedirect) return;

    const timer = window.setTimeout(() => {
      window.location.href = config.landingCtaUrl;
    }, config.delayedRedirectMs);

    return () => window.clearTimeout(timer);
  }, [config]);

  return (
    <div className="replica-page bg-black text-white">
      <div className="no-items section" id="test" />
      {config.landingImages.map((src, index) => (
        <center key={`${src}-${index}`}>
          <a href={config.landingCtaUrl}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              style={{ maxWidth: "100%", height: "auto", display: "block", margin: "0 auto", border: 0 }}
            />
          </a>
        </center>
      ))}
    </div>
  );
}
