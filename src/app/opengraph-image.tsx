import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Carte de partage (lien collé dans Discord, iMessage, etc.).
// Générée à la volée : dégradé sombre + titre en Pirata One (police de marque,
// embarquée depuis le fichier co-localisé, sans dépendance réseau au runtime).
export const alt = "Cairn — Carnet de campagne";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Lu depuis le disque (le fetch de file:// n'est pas supporté au prerender).
// La route est prégénérée : la police est embarquée dans le PNG au build.
const pirata = readFileSync(
  join(process.cwd(), "src/app/PirataOne-Regular.ttf")
);

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
          fontFamily: "Pirata One",
          background:
            "radial-gradient(120% 120% at 50% 30%, #2a2015 0%, #17120c 60%, #0d0a07 100%)",
          color: "#e8e1cd",
        }}
      >
        <div
          style={{
            fontSize: 220,
            lineHeight: 1,
            textShadow: "0 4px 30px rgba(0,0,0,0.6)",
          }}
        >
          Cairn
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 54,
            color: "rgba(232,225,205,0.72)",
          }}
        >
          Carnet de campagne
        </div>
        <div
          style={{
            marginTop: 48,
            width: 120,
            height: 4,
            borderRadius: 2,
            background: "#8a3a2b",
          }}
        />
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Pirata One",
          data: pirata,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}
