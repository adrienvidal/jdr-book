import { ImageResponse } from "next/og";

// Carte de partage (lien collé dans Discord, iMessage, etc.).
// Générée à la volée, sans asset externe : dégradé sombre + titre.
export const alt = "Cairn — Carnet de campagne";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(120% 120% at 50% 30%, #2a2015 0%, #17120c 60%, #0d0a07 100%)",
          color: "#e8e1cd",
        }}
      >
        <div
          style={{
            fontSize: 180,
            fontWeight: 700,
            letterSpacing: -4,
            lineHeight: 1,
            textShadow: "0 4px 30px rgba(0,0,0,0.6)",
          }}
        >
          Cairn
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 34,
            letterSpacing: 14,
            textTransform: "uppercase",
            color: "rgba(232,225,205,0.72)",
          }}
        >
          Carnet de campagne
        </div>
        <div
          style={{
            marginTop: 56,
            width: 120,
            height: 4,
            borderRadius: 2,
            background: "#8a3a2b",
          }}
        />
      </div>
    ),
    size
  );
}
