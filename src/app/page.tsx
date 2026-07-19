import Image from "next/image";
import { cookies } from "next/headers";
import { cookieName, verifySession } from "@/lib/auth";
import { LandingStart } from "@/components/LandingStart";

// Landing publique — écran de démarrage façon jeu vidéo.
// Route publique. On lit le cookie de session juste pour personnaliser le
// bouton « Commencer » : connecté → entrée directe vers /table ; sinon → la
// modale de mot de passe s'ouvre sur place (voir LandingStart).
export default async function Landing() {
  const jar = await cookies();
  const authed = await verifySession(jar.get(cookieName("app"))?.value, "app");

  return (
    <main className="relative min-h-dvh overflow-hidden">
      {/* Fond cinématique */}
      <Image
        src="/landing.webp"
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="object-cover object-center scale-105"
      />
      {/* Assombrissement + vignette (image chaude : on garde l'ambiance) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/80" />
      <div className="absolute inset-0 [background:radial-gradient(120%_85%_at_50%_42%,transparent_30%,rgba(0,0,0,0.6)_100%)]" />

      {/* Contenu centré */}
      <div className="relative z-10 flex min-h-dvh flex-col items-center px-6 pt-[19vh] pb-[11vh] text-center">
        <h1 className="font-cairn animate-in fade-in slide-in-from-bottom-3 duration-700 text-parch text-7xl leading-none drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] sm:text-8xl md:text-9xl">
          Cairn
        </h1>
        <p className="animate-in fade-in slide-in-from-bottom-2 delay-150 fill-mode-backwards duration-700 mt-4 text-sm uppercase tracking-[0.35em] text-parch/70 sm:text-base">
          Carnet de campagne
        </p>

        <div className="animate-in fade-in slide-in-from-bottom-2 delay-300 fill-mode-backwards duration-700 mt-auto">
          <LandingStart authed={authed} />
        </div>
      </div>
    </main>
  );
}
