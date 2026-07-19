import type { Metadata } from "next";
import { Pirata_One, EB_Garamond } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "Cairn",
  description: "Compagnon de campagne Cairn — fiches de personnage & interface MJ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${cairnDisplay.variable} ${cairnBody.variable} h-full`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
