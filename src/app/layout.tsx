import type { Metadata, Viewport } from "next";
import { Pirata_One, EB_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

// URL de base pour les liens absolus des cartes de partage (Open Graph).
// Priorité : variable explicite → domaine de prod Vercel → localhost en dev.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const cairnDisplay = Pirata_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-cairn-display",
  display: "swap",
});

const cairnBody = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-cairn-body",
  display: "swap",
});

const description =
  "Carnet de campagne Cairn : fiches de personnage et interface meneur de jeu pour votre table de jeu de rôle.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cairn — Carnet de campagne",
    template: "%s · Cairn",
  },
  description,
  applicationName: "Cairn",
  // App privée réservée à une table : on n'apparaît pas dans les moteurs.
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: "Cairn",
    locale: "fr_FR",
    url: "/",
    title: "Cairn — Carnet de campagne",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Cairn — Carnet de campagne",
    description,
  },
  appleWebApp: {
    capable: true,
    title: "Cairn",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#e8e1cd",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${cairnDisplay.variable} ${cairnBody.variable} h-full`}>
      <body className="min-h-full" suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
