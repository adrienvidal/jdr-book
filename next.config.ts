import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Filet de sécurité : les portraits sont redimensionnés côté client avant
    // l'envoi, mais on laisse de la marge au cas où (défaut = 1 MB).
    serverActions: { bodySizeLimit: "4mb" },
  },
  images: {
    // next/image ré-encode automatiquement en WebP/AVIF. Autorise les portraits
    // servis depuis Supabase Storage.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
