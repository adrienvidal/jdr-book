import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Favicon de marque : « C » (Pirata One) sur fond rouille.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const pirata = readFileSync(
  join(process.cwd(), "src/app/PirataOne-Regular.ttf")
);

export default function Icon() {
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
          fontSize: 30,
          lineHeight: 1,
          color: "#f4eede",
          background: "#8a3a2b",
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
