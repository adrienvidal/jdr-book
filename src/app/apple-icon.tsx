import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Icône iOS (ajout à l'écran d'accueil) : « C » Pirata One sur fond rouille.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const pirata = readFileSync(
  join(process.cwd(), "src/app/PirataOne-Regular.ttf")
);

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Pirata One",
          fontSize: 150,
          lineHeight: 1,
          color: "#f4eede",
          background: "linear-gradient(160deg, #9a4433 0%, #7a3325 100%)",
        }}
      >
        C
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Pirata One", data: pirata, style: "normal", weight: 400 }],
    }
  );
}
