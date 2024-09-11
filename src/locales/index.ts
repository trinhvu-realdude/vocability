// src/locales/index.ts
export const languageFiles: Record<string, () => Promise<any>> = {
    us: () => import("./us/translation.json"),
    es: () => import("./es/translation.json"),
    fr: () => import("./fr/translation.json"),
    de: () => import("./de/translation.json"),
    it: () => import("./it/translation.json"),
    pt: () => import("./pt/translation.json"),
};
