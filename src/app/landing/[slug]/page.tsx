import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReplicaLandingClient } from "@/components/replica/ReplicaLandingClient";
import { getSiteConfig } from "@/lib/site-config";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug !== "primary") {
    return { title: "Landing Page" };
  }

  const config = await getSiteConfig();
  return {
    title: config.landingTitle,
    description: config.ogDescription,
    keywords: config.ogDescription,
    openGraph: {
      type: "website",
      url: config.ogUrl,
      title: config.ogTitle,
      description: config.ogDescription,
      images: [{ url: config.ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: config.ogTitle,
      description: config.ogDescription,
      images: [config.ogImage],
    },
  };
}

export default async function LandingPage({ params }: PageProps) {
  const { slug } = await params;

  if (slug === "primary") {
    const config = await getSiteConfig();
    return <ReplicaLandingClient config={config} />;
  }

  const fallbackContent: Record<string, { title: string; subtitle: string }> = {
    mobile: { title: "Mobile Experience", subtitle: "Optimized for on-the-go users" },
    desktop: { title: "Desktop Experience", subtitle: "Full-featured landing page" },
    regional: { title: "Regional Landing", subtitle: "Content tailored to your region" },
  };

  const content = fallbackContent[slug];
  if (!content) notFound();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold">{content.title}</h1>
        <p className="mt-4 text-slate-400">{content.subtitle}</p>
      </div>
    </main>
  );
}
