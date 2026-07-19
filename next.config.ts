import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Filet de sécurité : les portraits sont redimensionnés côté client avant
    // l'envoi, mais on laisse de la marge au cas où (défaut = 1 MB).
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
