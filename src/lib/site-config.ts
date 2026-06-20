export const DEFAULT_LANDING_IMAGES = [
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi8Mm7ScJmEYoXBcvN4-IURldD1YxYWPI677GoHqZ0rUkezc5fgvQrOQtQ4SHUJL2WjcsaBU-5E9FiZVm9PJiCqlEIzuJ_WLcOd03OKAnG2GbpRa67-L3q2ShL4nnukYQdDAltmKXaO2zC4yaWtcgMCn5cpLijkDxq194E7rb6pUuPUp-CDfA6p57lCveCW/s1600/ezgif-7156bf537953b7.gif",
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi3A75uRWXCdIFQSREtar08vpTvpYQI6rQwtigZTetAapBxPAcLFnjEKO3LG8Boqcfdb1UZ9rh88SkDyhTcD44gMkrRyMzoCC0gPjLtelnNLBlV3TRDqZWop-ZtTsJ61lOMvZslqwLfZbwf7Fh8NWCTMQPqDSTfp0AmRarnLuEps-erIdudWuCbvs_puUna/s1600/7.jpeg",
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjnpExmNIHQAvkQR77LH23VnuvDdMrGVoOPkLdwf2TGb63yTh2hFdXvWlHutqWY9BRzH0HYX_IC2QDSTsR-olNClqPK8nZ6KrhiW92dWNbFMZ7wHHfojX54lgW3oYYqnmq0j2CMxIxPS8jF49KB7FRquXm5tY0JLbRSsfI1mDGABk1BaWB2r6emEpESdWw/s1600/asdas-ezgif.com-resize.gif",
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjC8BbQklYE7uXjtjEg8C6VbAFWtqQe3asJTD4Vs9BHmBqUxS7VbBwKctKX9trTd4UJNDhk76_xdKmvkpv-z8UwGC7JKM3WLaADs286htQ9Li6RNCA-YHfCB0LAhupZZwQ6ZTqxABbusnrz76VaPuNH1iExxhLsxN6pRRVaaLy1CCay-BFQ6TPDw3QAX9NT/s1600/ezgif-7d0b2c8d835b0c.gif",
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiuYSpH4BFtBcnQiDkViUHTXLoiQ2lo_QAS07-sqYZLrjcO7Cj__5mFoh8dVj3bhNuYI3dLQWp0oWT3FRBH5iP-VVEsUbNcO0w9oPCNXUp8drDFdejORi1P5Q-TyVFHGtsd2KOSOVTaH6qiBfDx-brtfBEZna7xL3HSXpg_brLVB7opc7JLhrSXKAym-mxx/s1600/dddddddddddddddd.jpeg",
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiH3fcbfgzyuLq69uqp77eGfS8-YyJlgRv2Um0wlcYAM7TTfynPR7v3d4-3_ZDd9nlpx-dowJaFCPXlybVrKFyTUAHyH_8pbrFB7raZYl_Ptr-TrmNYp50csZOmHSO0yb-1y0Nxgbfhm76-ru4SxsRS7EaE0fHtIXUoWHJftKAmQIsMhDKGoqHF1885BFs/s1600/zzz1.png",
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgcQkqjPyE_VckoWzbx0AmY3tffKNKthCgBz9UmjElAU13XhHpeG78j-WNbU1QmBQ3_ongL98MTeyQlvPBXFJieaH-E9cJK8Mw1KoXIQRJEV75Jt_0MBmgn3ji0P1Omaku364bBVbKeg7vGRToSTkiC-mE44hESpJ4GJXV5Vpz0-hHW01XxuzcPYlmNEh8/s1600/zzzz2.png",
];

export const DEFAULT_OG = {
  title: "05:13 ⇆ㅤ❚❚ㅤ▶️ ⏭ 🔈───●────────↻ 36:18",
  description: "05:13 ⇆ㅤ❚❚ㅤ▶️ ⏭ 🔈───●────────↻ 36:18",
  image: "https://cdn.worldvectorlogo.com/logos/msn-logo-1.svg",
  url: "https://yoganews.online/tuly",
};

export interface SiteConfigData {
  landingTitle: string;
  landingCtaUrl: string;
  landingImages: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  desktopRedirectUrl: string;
  desktopBreakpoint: number;
  delayedRedirectMs: number;
  enableDesktopRedirect: boolean;
  enableDelayedRedirect: boolean;
}

export async function getSiteConfig(): Promise<SiteConfigData> {
  const { prisma } = await import("./prisma");
  const config = await prisma.siteConfig.findUnique({ where: { id: "default" } });

  if (!config) {
    return {
      landingTitle: "OYAAA OYAAA PLAY",
      landingCtaUrl: "https://portal11.shop/fANGh?utm_source=facebook&utm_medium=medical&utm_campaign=premium_hospital_guides",
      landingImages: DEFAULT_LANDING_IMAGES,
      ogTitle: DEFAULT_OG.title,
      ogDescription: DEFAULT_OG.description,
      ogImage: DEFAULT_OG.image,
      ogUrl: DEFAULT_OG.url,
      desktopRedirectUrl: "https://www.facebook.com",
      desktopBreakpoint: 1024,
      delayedRedirectMs: 4500,
      enableDesktopRedirect: true,
      enableDelayedRedirect: true,
    };
  }

  return {
    landingTitle: config.landingTitle,
    landingCtaUrl: config.landingCtaUrl,
    landingImages: Array.isArray(config.landingImages)
      ? (config.landingImages as string[])
      : DEFAULT_LANDING_IMAGES,
    ogTitle: config.ogTitle,
    ogDescription: config.ogDescription,
    ogImage: config.ogImage,
    ogUrl: config.ogUrl,
    desktopRedirectUrl: config.desktopRedirectUrl,
    desktopBreakpoint: config.desktopBreakpoint,
    delayedRedirectMs: config.delayedRedirectMs,
    enableDesktopRedirect: config.enableDesktopRedirect,
    enableDelayedRedirect: config.enableDelayedRedirect,
  };
}
