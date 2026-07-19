# JDR Cairn MVP — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Livrer une app Next.js dédiée à une campagne Cairn 2e : écran d'accueil en cards, fiches de personnage éditables par tous, et une interface MJ protégée (tableau de bord + notes secrètes).

**Architecture:** Next.js App Router (Server Components + Server Actions) pour toute la logique ; Prisma vers Supabase Postgres pour les données ; Supabase Storage pour les portraits ; deux mots de passe partagés matérialisés par des cookies httpOnly signés (JWT via `jose`), gardés par un middleware Edge. Pas de comptes, pas de temps réel.

**Tech Stack:** Next.js 15 (App Router, TS), React 19, Tailwind CSS v4, Prisma, Supabase (Postgres + Storage), `jose` (JWT), Vitest (tests).

## Global Constraints

- Langue de l'UI et du contenu : **français**. Intitulés fiche : FOR / DEX / VOL / PV, Passé, Épuisé·e, Armure, Sous, Petits Objets, Inventaire, Fatigue, Traits, Liens, Présages, Notes.
- Attribut « force » nommé `force` en code (jamais `for` — mot réservé).
- Aucun secret côté client : les mots de passe restent en variables d'environnement serveur.
- Commits fréquents ; **ne jamais `git push`** (commit local uniquement).
- Slots d'inventaire : `somme(items.slots) + fatigue`, alerte si `> 10`.
- Attributs et PV : chacun a une valeur courante ET un max.

---

## File Structure

- `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind`, `vitest.config.ts` — scaffold & tooling.
- `.env.local` / `.env.example` — `DATABASE_URL`, `DIRECT_URL`, `APP_PASSWORD`, `MJ_PASSWORD`, `AUTH_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- `prisma/schema.prisma` — modèles `Character`, `Item`, `Note`.
- `src/lib/prisma.ts` — singleton Prisma.
- `src/lib/auth.ts` — signature/vérif JWT + comparaison mot de passe (Edge-safe).
- `src/lib/inventory.ts` — calcul de slots (pur).
- `src/lib/supabase.ts` — client Storage (upload portrait).
- `middleware.ts` — garde `app_auth` global + `mj_auth` sur `/mj`.
- `src/app/login/page.tsx` + `src/app/actions/session.ts` — login app & MJ.
- `src/app/mj/login/page.tsx` — login MJ.
- `src/app/page.tsx` — accueil (cards).
- `src/app/actions/characters.ts` — CRUD personnages + items.
- `src/app/actions/notes.ts` — CRUD notes MJ.
- `src/app/character/new/page.tsx`, `src/app/character/[id]/page.tsx` (+ composants `CharacterSheet`, `InventoryEditor`).
- `src/app/mj/page.tsx` — tableau de bord + notes.
- Tests colocalisés : `src/lib/*.test.ts`.

---

## Task 1: Scaffold projet + tooling + tests

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `src/app/globals.css`, `src/app/layout.tsx`, `vitest.config.ts`, `.env.example`, `.gitignore`
- Test: `src/lib/smoke.test.ts`

**Interfaces:**
- Produces: scripts npm `dev`, `build`, `test`, `prisma` ; Tailwind fonctionnel ; Vitest runner.

- [ ] **Step 1: Scaffolder Next.js**

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --no-eslint --use-npm --import-alias "@/*"
```
(Répondre non au reste. Si le dossier n'est pas vide à cause de `docs/` et `CLAUDE.md`, accepter de continuer.)

- [ ] **Step 2: Installer les dépendances du projet**

```bash
npm install prisma @prisma/client jose @supabase/supabase-js
npm install -D vitest
```

- [ ] **Step 3: Configurer Vitest**

Create `vitest.config.ts` :
```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: { environment: "node", include: ["src/**/*.test.ts"] },
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
});
```
Ajouter à `package.json` scripts : `"test": "vitest run"`.

- [ ] **Step 4: Test smoke qui échoue**

Create `src/lib/smoke.test.ts` :
```ts
import { expect, test } from "vitest";
import { ping } from "@/lib/ping";

test("ping renvoie pong", () => {
  expect(ping()).toBe("pong");
});
```

- [ ] **Step 5: Lancer le test, vérifier l'échec**

Run: `npm test`
Expected: FAIL — `Cannot find module '@/lib/ping'`.

- [ ] **Step 6: Implémentation minimale**

Create `src/lib/ping.ts` :
```ts
export function ping(): string {
  return "pong";
}
```

- [ ] **Step 7: Lancer le test, vérifier le succès**

Run: `npm test`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js + Prisma deps + Vitest"
```

---

## Task 2: Schéma Prisma + connexion Supabase

**Files:**
- Create: `prisma/schema.prisma`, `src/lib/prisma.ts`
- Modify: `.env.example`

**Interfaces:**
- Produces: modèles `Character`, `Item`, `Note` ; export `prisma` (PrismaClient singleton).

- [ ] **Step 1: Écrire le schéma**

Create `prisma/schema.prisma` :
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Character {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  name      String
  imageUrl  String?
  passe     String   @default("")
  force     Int      @default(10)
  forceMax  Int      @default(10)
  dex       Int      @default(10)
  dexMax    Int      @default(10)
  vol       Int      @default(10)
  volMax    Int      @default(10)
  pv        Int      @default(1)
  pvMax     Int      @default(1)
  armure    Int      @default(0)
  sous      Int      @default(0)
  epuise    Boolean  @default(false)
  fatigue   Int      @default(0)
  traits    String   @default("")
  liens     String   @default("")
  presages  String   @default("")
  notes     String   @default("")
  items     Item[]
}

model Item {
  id          String    @id @default(cuid())
  character   Character @relation(fields: [characterId], references: [id], onDelete: Cascade)
  characterId String
  name        String
  slots       Int       @default(1)
  kind        String    @default("equipement") // arme | armure | equipement | grimoire
  degats      String?
  armorValue  Int?
  uses        Int?
  description String    @default("")
}

model Note {
  id        String   @id @default(cuid())
  title     String   @default("")
  content   String   @default("")
  updatedAt DateTime @updatedAt
}
```

- [ ] **Step 2: Client Prisma singleton**

Create `src/lib/prisma.ts` :
```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 3: Documenter les variables d'env**

Add to `.env.example` :
```
DATABASE_URL="postgresql://...pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://...supabase.com:5432/postgres"
APP_PASSWORD="change-me"
MJ_PASSWORD="change-me-mj"
AUTH_SECRET="long-random-string-32-chars-min"
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="service-role-key"
```

- [ ] **Step 4: Générer le client + migration**

> Prérequis : l'utilisateur a créé un projet Supabase et rempli `.env.local` (copie de `.env.example`).

Run:
```bash
npx prisma generate
npx prisma migrate dev --name init
```
Expected: migration appliquée, tables créées.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: schéma Prisma (Character, Item, Note) + client"
```

---

## Task 3: Module d'authentification (logique pure, Edge-safe)

**Files:**
- Create: `src/lib/auth.ts`, `src/lib/auth.test.ts`

**Interfaces:**
- Produces:
  - `type Scope = "app" | "mj"`
  - `checkPassword(scope: Scope, password: string): boolean`
  - `signSession(scope: Scope): Promise<string>` (JWT HS256)
  - `verifySession(token: string | undefined, scope: Scope): Promise<boolean>`
  - `cookieName(scope: Scope): string` → `"app_auth" | "mj_auth"`

- [ ] **Step 1: Tests qui échouent**

Create `src/lib/auth.test.ts` :
```ts
import { beforeAll, expect, test } from "vitest";
import { checkPassword, cookieName, signSession, verifySession } from "@/lib/auth";

beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-at-least-32-characters-long!!";
  process.env.APP_PASSWORD = "app-pw";
  process.env.MJ_PASSWORD = "mj-pw";
});

test("checkPassword compare au bon mot de passe", () => {
  expect(checkPassword("app", "app-pw")).toBe(true);
  expect(checkPassword("app", "mj-pw")).toBe(false);
  expect(checkPassword("mj", "mj-pw")).toBe(true);
});

test("cookieName mappe le scope", () => {
  expect(cookieName("app")).toBe("app_auth");
  expect(cookieName("mj")).toBe("mj_auth");
});

test("un token signé pour un scope se vérifie pour ce scope seulement", async () => {
  const token = await signSession("app");
  expect(await verifySession(token, "app")).toBe(true);
  expect(await verifySession(token, "mj")).toBe(false);
  expect(await verifySession(undefined, "app")).toBe(false);
  expect(await verifySession("garbage", "app")).toBe(false);
});
```

- [ ] **Step 2: Lancer, vérifier l'échec**

Run: `npm test src/lib/auth.test.ts`
Expected: FAIL — module introuvable.

- [ ] **Step 3: Implémenter**

Create `src/lib/auth.ts` :
```ts
import { SignJWT, jwtVerify } from "jose";

export type Scope = "app" | "mj";

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET manquant");
  return new TextEncoder().encode(s);
}

export function cookieName(scope: Scope): string {
  return scope === "app" ? "app_auth" : "mj_auth";
}

export function checkPassword(scope: Scope, password: string): boolean {
  const expected = scope === "app" ? process.env.APP_PASSWORD : process.env.MJ_PASSWORD;
  return !!expected && password === expected;
}

export async function signSession(scope: Scope): Promise<string> {
  return new SignJWT({ scope })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}

export async function verifySession(token: string | undefined, scope: Scope): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.scope === scope;
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: Lancer, vérifier le succès**

Run: `npm test src/lib/auth.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: module auth (JWT signés, comparaison mot de passe)"
```

---

## Task 4: Middleware + écrans de login (app & MJ)

**Files:**
- Create: `middleware.ts`, `src/app/actions/session.ts`, `src/app/login/page.tsx`, `src/app/mj/login/page.tsx`
- Test: manuel (voir Step 6)

**Interfaces:**
- Consumes: `verifySession`, `checkPassword`, `signSession`, `cookieName` (Task 3).
- Produces: Server Actions `loginApp(formData)`, `loginMj(formData)`.

- [ ] **Step 1: Middleware**

Create `middleware.ts` :
```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth";

const PUBLIC = ["/login", "/mj/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.includes(pathname)) return NextResponse.next();

  const appOk = await verifySession(req.cookies.get("app_auth")?.value, "app");
  if (!appOk) return NextResponse.redirect(new URL("/login", req.url));

  if (pathname.startsWith("/mj")) {
    const mjOk = await verifySession(req.cookies.get("mj_auth")?.value, "mj");
    if (!mjOk) return NextResponse.redirect(new URL("/mj/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

- [ ] **Step 2: Server Actions de login**

Create `src/app/actions/session.ts` :
```ts
"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { checkPassword, cookieName, signSession } from "@/lib/auth";

async function login(scope: "app" | "mj", password: string, dest: string, fail: string) {
  if (!checkPassword(scope, password)) redirect(fail);
  const jar = await cookies();
  jar.set(cookieName(scope), await signSession(scope), {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30,
  });
  redirect(dest);
}

export async function loginApp(formData: FormData) {
  "use server";
  await login("app", String(formData.get("password") ?? ""), "/", "/login?error=1");
}

export async function loginMj(formData: FormData) {
  "use server";
  await login("mj", String(formData.get("password") ?? ""), "/mj", "/mj/login?error=1");
}
```

- [ ] **Step 3: Page login app**

Create `src/app/login/page.tsx` :
```tsx
import { loginApp } from "@/app/actions/session";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <form action={loginApp} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Cairn — Accès</h1>
        {error && <p className="text-red-500 text-sm">Mot de passe incorrect.</p>}
        <input name="password" type="password" placeholder="Mot de passe" autoFocus
          className="w-full rounded border px-3 py-2 bg-transparent" />
        <button className="w-full rounded bg-emerald-700 text-white py-2">Entrer</button>
      </form>
    </main>
  );
}
```

- [ ] **Step 4: Page login MJ**

Create `src/app/mj/login/page.tsx` : identique à Step 3 mais `action={loginMj}`, titre « Interface MJ » et texte du bouton « Déverrouiller ». Écrire le fichier en entier avec `import { loginMj } from "@/app/actions/session";`.

- [ ] **Step 5: Lancer l'app**

Run: `npm run dev`
Vérifier : `/` redirige vers `/login` ; mauvais mot de passe → message d'erreur ; bon mot de passe → `/` (page d'accueil par défaut Next pour l'instant).

- [ ] **Step 6: Vérifier la garde MJ**

Manuel : aller sur `/mj` sans cookie MJ → redirige `/mj/login`. Bon mot de passe MJ → `/mj`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: middleware + écrans login app et MJ"
```

---

## Task 5: Calcul de slots d'inventaire (logique pure)

**Files:**
- Create: `src/lib/inventory.ts`, `src/lib/inventory.test.ts`

**Interfaces:**
- Produces:
  - `usedSlots(items: { slots: number }[], fatigue: number): number`
  - `MAX_SLOTS = 10`
  - `isOverloaded(items, fatigue): boolean`
  - `pettyItems<T extends {slots:number}>(items: T[]): T[]` / `slottedItems<T>(items): T[]`

- [ ] **Step 1: Tests qui échouent**

Create `src/lib/inventory.test.ts` :
```ts
import { expect, test } from "vitest";
import { isOverloaded, pettyItems, slottedItems, usedSlots, MAX_SLOTS } from "@/lib/inventory";

const items = [
  { slots: 0, name: "dague de poche" },
  { slots: 1, name: "épée" },
  { slots: 2, name: "armure lourde" },
];

test("usedSlots somme les slots + la fatigue", () => {
  expect(usedSlots(items, 0)).toBe(3);
  expect(usedSlots(items, 2)).toBe(5);
});

test("isOverloaded au-delà de 10", () => {
  expect(MAX_SLOTS).toBe(10);
  expect(isOverloaded(items, 6)).toBe(false); // 3 + 6 = 9
  expect(isOverloaded(items, 8)).toBe(true);  // 3 + 8 = 11
});

test("séparation petits objets / inventaire", () => {
  expect(pettyItems(items).map((i) => i.name)).toEqual(["dague de poche"]);
  expect(slottedItems(items).map((i) => i.name)).toEqual(["épée", "armure lourde"]);
});
```

- [ ] **Step 2: Lancer, vérifier l'échec**

Run: `npm test src/lib/inventory.test.ts` → FAIL.

- [ ] **Step 3: Implémenter**

Create `src/lib/inventory.ts` :
```ts
export const MAX_SLOTS = 10;

export function usedSlots(items: { slots: number }[], fatigue: number): number {
  return items.reduce((sum, i) => sum + i.slots, 0) + fatigue;
}

export function isOverloaded(items: { slots: number }[], fatigue: number): boolean {
  return usedSlots(items, fatigue) > MAX_SLOTS;
}

export function pettyItems<T extends { slots: number }>(items: T[]): T[] {
  return items.filter((i) => i.slots === 0);
}

export function slottedItems<T extends { slots: number }>(items: T[]): T[] {
  return items.filter((i) => i.slots > 0);
}
```

- [ ] **Step 4: Lancer, vérifier le succès**

Run: `npm test src/lib/inventory.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: calcul de slots d'inventaire (pur, testé)"
```

---

## Task 6: Server Actions personnages (CRUD + items)

**Files:**
- Create: `src/app/actions/characters.ts`
- Test: `src/app/actions/characters.test.ts` (intégration DB — nécessite `.env.local`)

**Interfaces:**
- Consumes: `prisma` (Task 2).
- Produces:
  - `createCharacter(name: string): Promise<string>` (retourne l'id)
  - `updateCharacter(id: string, data: Partial<CharacterFields>): Promise<void>`
  - `deleteCharacter(id: string): Promise<void>`
  - `addItem(characterId: string, data: ItemInput): Promise<void>`
  - `updateItem(id: string, data: Partial<ItemInput>): Promise<void>`
  - `deleteItem(id: string): Promise<void>`
  - `listCharacters()`, `getCharacter(id)` (helpers de lecture)

- [ ] **Step 1: Test d'intégration qui échoue**

Create `src/app/actions/characters.test.ts` :
```ts
import { afterAll, expect, test } from "vitest";
import { prisma } from "@/lib/prisma";
import { addItem, createCharacter, deleteCharacter, getCharacter, updateCharacter } from "@/app/actions/characters";

const created: string[] = [];
afterAll(async () => {
  await prisma.character.deleteMany({ where: { id: { in: created } } });
  await prisma.$disconnect();
});

test("cycle de vie d'un personnage", async () => {
  const id = await createCharacter("Bran");
  created.push(id);
  await updateCharacter(id, { force: 12, pv: 4, pvMax: 4 });
  await addItem(id, { name: "épée", slots: 1, kind: "arme", degats: "d6" });
  const c = await getCharacter(id);
  expect(c?.name).toBe("Bran");
  expect(c?.force).toBe(12);
  expect(c?.items).toHaveLength(1);
  await deleteCharacter(id);
  expect(await getCharacter(id)).toBeNull();
});
```

- [ ] **Step 2: Lancer, vérifier l'échec**

Run: `npm test src/app/actions/characters.test.ts` → FAIL (module absent).

- [ ] **Step 3: Implémenter**

Create `src/app/actions/characters.ts` :
```ts
"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type ItemInput = {
  name: string; slots: number; kind: string;
  degats?: string | null; armorValue?: number | null; uses?: number | null; description?: string;
};

export function listCharacters() {
  return prisma.character.findMany({ orderBy: { name: "asc" }, include: { items: true } });
}

export function getCharacter(id: string) {
  return prisma.character.findUnique({ where: { id }, include: { items: true } });
}

export async function createCharacter(name: string): Promise<string> {
  const c = await prisma.character.create({ data: { name: name || "Sans nom" } });
  revalidatePath("/");
  return c.id;
}

export async function updateCharacter(id: string, data: Record<string, unknown>): Promise<void> {
  await prisma.character.update({ where: { id }, data });
  revalidatePath(`/character/${id}`);
  revalidatePath("/");
  revalidatePath("/mj");
}

export async function deleteCharacter(id: string): Promise<void> {
  await prisma.character.delete({ where: { id } });
  revalidatePath("/");
}

export async function addItem(characterId: string, data: ItemInput): Promise<void> {
  await prisma.item.create({ data: { characterId, ...data } });
  revalidatePath(`/character/${characterId}`);
}

export async function updateItem(id: string, data: Partial<ItemInput>): Promise<void> {
  const item = await prisma.item.update({ where: { id }, data });
  revalidatePath(`/character/${item.characterId}`);
}

export async function deleteItem(id: string): Promise<void> {
  const item = await prisma.item.delete({ where: { id } });
  revalidatePath(`/character/${item.characterId}`);
}
```

- [ ] **Step 4: Lancer, vérifier le succès**

Run: `npm test src/app/actions/characters.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: server actions CRUD personnages et items"
```

---

## Task 7: Écran d'accueil (cards) + création de personnage

**Files:**
- Create: `src/app/page.tsx`, `src/app/character/new/page.tsx`
- Modify: `src/app/actions/characters.ts` (ajout `createCharacterAction` form-friendly si besoin)

**Interfaces:**
- Consumes: `listCharacters`, `createCharacter` (Task 6).
- Produces: page `/` listant les cards + une card MJ liée à `/mj`.

- [ ] **Step 1: Action form-friendly de création**

Add to `src/app/actions/characters.ts` :
```ts
import { redirect } from "next/navigation";

export async function createCharacterForm(formData: FormData): Promise<void> {
  "use server";
  const id = await createCharacter(String(formData.get("name") ?? ""));
  redirect(`/character/${id}`);
}
```

- [ ] **Step 2: Accueil**

Create `src/app/page.tsx` :
```tsx
import Link from "next/link";
import { listCharacters } from "@/app/actions/characters";

export default async function Home() {
  const characters = await listCharacters();
  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6">Cairn</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {characters.map((c) => (
          <Link key={c.id} href={`/character/${c.id}`}
            className="aspect-[3/4] rounded-lg border overflow-hidden flex flex-col hover:ring-2 ring-emerald-600">
            <div className="flex-1 bg-neutral-800">
              {c.imageUrl && <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />}
            </div>
            <div className="p-2 text-center font-medium">{c.name}</div>
          </Link>
        ))}
        <Link href="/mj"
          className="aspect-[3/4] rounded-lg border border-dashed grid place-items-center hover:ring-2 ring-amber-600">
          <span className="font-semibold">Interface MJ</span>
        </Link>
      </div>
      <form action="/character/new" className="mt-6">
        <Link href="/character/new" className="inline-block rounded bg-emerald-700 text-white px-4 py-2">
          + Ajouter un personnage
        </Link>
      </form>
    </main>
  );
}
```

- [ ] **Step 3: Page de création**

Create `src/app/character/new/page.tsx` :
```tsx
import { createCharacterForm } from "@/app/actions/characters";

export default function NewCharacter() {
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <form action={createCharacterForm} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Nouveau personnage</h1>
        <input name="name" placeholder="Nom" autoFocus required
          className="w-full rounded border px-3 py-2 bg-transparent" />
        <button className="w-full rounded bg-emerald-700 text-white py-2">Créer</button>
      </form>
    </main>
  );
}
```

- [ ] **Step 4: Vérifier**

Run: `npm run dev` → `/` affiche les cards + card MJ + bouton ; « Ajouter » crée un perso et redirige vers sa fiche (404 pour l'instant, normal — Task 8).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: écran d'accueil (cards) + création de personnage"
```

---

## Task 8: Fiche de personnage (affichage + édition)

**Files:**
- Create: `src/app/character/[id]/page.tsx`, `src/components/CharacterSheet.tsx`, `src/components/InventoryEditor.tsx`

**Interfaces:**
- Consumes: `getCharacter`, `updateCharacter`, `addItem`, `updateItem`, `deleteItem`, `deleteCharacter` (Task 6) ; `usedSlots`, `isOverloaded`, `pettyItems`, `slottedItems`, `MAX_SLOTS` (Task 5).
- Produces: route `/character/[id]` complète.

- [ ] **Step 1: Page serveur**

Create `src/app/character/[id]/page.tsx` :
```tsx
import { notFound } from "next/navigation";
import { getCharacter } from "@/app/actions/characters";
import { CharacterSheet } from "@/components/CharacterSheet";

export default async function CharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const character = await getCharacter(id);
  if (!character) notFound();
  return <CharacterSheet character={character} />;
}
```

- [ ] **Step 2: Composant fiche (client, édition inline)**

Create `src/components/CharacterSheet.tsx` : composant `"use client"` recevant `character` (avec `items`). Il affiche/édite, via des champs contrôlés qui appellent `updateCharacter(id, {...})` au `onBlur` :
- En-tête : `name`, portrait (`imageUrl` en `<img>`, upload traité Task 9), case `epuise` (Épuisé·e).
- Bloc attributs : FOR/DEX/VOL/PV, chacun deux inputs numériques (courant / max) → `force`/`forceMax`, `dex`/`dexMax`, `vol`/`volMax`, `pv`/`pvMax`.
- `armure`, `sous`, `fatigue` (inputs numériques).
- `<InventoryEditor items={character.items} characterId={id} fatigue={character.fatigue} />`.
- Zones texte : `passe` (Passé), `traits`, `liens` (Liens), `presages` (Présages), `notes`.
- Bouton « Supprimer ce personnage » → `deleteCharacter(id)` puis `router.push("/")` (avec `confirm()`).

Écrire le composant complet. Modèle d'un champ contrôlé :
```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCharacter, updateCharacter } from "@/app/actions/characters";
import { InventoryEditor } from "@/components/InventoryEditor";

function NumField({ id, field, value }: { id: string; field: string; value: number }) {
  const [v, setV] = useState(value);
  return (
    <input type="number" value={v}
      onChange={(e) => setV(Number(e.target.value))}
      onBlur={() => updateCharacter(id, { [field]: v })}
      className="w-16 rounded border px-2 py-1 bg-transparent text-center" />
  );
}
```
(Décliner un `TextField`/`TextArea`/`CheckField` sur le même modèle et composer la fiche. Layout fidèle à la fiche FR : identité en haut, attributs en ligne, inventaire à droite, textes en bas.)

- [ ] **Step 3: Composant inventaire**

Create `src/components/InventoryEditor.tsx` : `"use client"`, reçoit `items`, `characterId`, `fatigue`.
- Affiche le compteur : `usedSlots(items, fatigue)` / `MAX_SLOTS`, en rouge si `isOverloaded`.
- Section **Petits Objets** = `pettyItems(items)` ; section **Inventaire** = `slottedItems(items)`.
- Chaque item : nom, `slots` (0/1/2), `kind`, `degats`, `description`, bouton supprimer → `deleteItem(id)`.
- Formulaire d'ajout → `addItem(characterId, {...})`.
Écrire le composant complet en réutilisant les server actions importées.

- [ ] **Step 4: Vérifier**

Run: `npm run dev` → créer un perso, éditer attributs/PV/inventaire, recharger : les données persistent ; le compteur de slots passe en rouge au-delà de 10.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: fiche de personnage Cairn (édition inline + inventaire)"
```

---

## Task 9: Upload du portrait (Supabase Storage)

**Files:**
- Create: `src/lib/supabase.ts`, `src/app/actions/upload.ts`
- Modify: `src/components/CharacterSheet.tsx` (champ fichier)

**Interfaces:**
- Consumes: `updateCharacter` (Task 6).
- Produces: `uploadPortrait(characterId: string, formData: FormData): Promise<void>` (met à jour `imageUrl`).

- [ ] **Step 1: Client Supabase (service role, serveur uniquement)**

Create `src/lib/supabase.ts` :
```ts
import { createClient } from "@supabase/supabase-js";

export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
```

- [ ] **Step 2: Créer le bucket public `portraits`**

Manuel (dashboard Supabase → Storage) ou via SQL : créer un bucket `portraits` en **public**. Documenter dans le README.

- [ ] **Step 3: Action d'upload**

Create `src/app/actions/upload.ts` :
```ts
"use server";
import { supabaseAdmin } from "@/lib/supabase";
import { updateCharacter } from "@/app/actions/characters";

export async function uploadPortrait(characterId: string, formData: FormData): Promise<void> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return;
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${characterId}-${Date.now()}.${ext}`;
  const sb = supabaseAdmin();
  const { error } = await sb.storage.from("portraits").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = sb.storage.from("portraits").getPublicUrl(path);
  await updateCharacter(characterId, { imageUrl: data.publicUrl });
}
```

- [ ] **Step 4: Champ fichier dans la fiche**

Modify `src/components/CharacterSheet.tsx` : ajouter près du portrait
```tsx
<form action={uploadPortrait.bind(null, id)}>
  <input type="file" name="file" accept="image/*" />
  <button className="text-sm underline">Importer</button>
</form>
```
(Importer `uploadPortrait` depuis `@/app/actions/upload`.)

- [ ] **Step 5: Vérifier**

Run: `npm run dev` → importer une image sur une fiche ; le portrait s'affiche sur la fiche et sur la card d'accueil après rechargement.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: import de portrait via Supabase Storage"
```

---

## Task 10: Interface MJ — tableau de bord

**Files:**
- Create: `src/app/mj/page.tsx`

**Interfaces:**
- Consumes: `listCharacters` (Task 6), `usedSlots` (Task 5).
- Produces: route `/mj` (déjà gardée par le middleware).

- [ ] **Step 1: Page tableau de bord**

Create `src/app/mj/page.tsx` :
```tsx
import Link from "next/link";
import { listCharacters } from "@/app/actions/characters";
import { usedSlots } from "@/lib/inventory";
import { MjNotes } from "@/components/MjNotes";
import { listNotes } from "@/app/actions/notes";

export default async function MjPage() {
  const [characters, notes] = await Promise.all([listCharacters(), listNotes()]);
  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-semibold">Interface MJ</h1>
      <section>
        <h2 className="text-xl mb-3">Personnages</h2>
        <table className="w-full text-sm border-collapse">
          <thead><tr className="text-left border-b">
            <th className="py-2">Nom</th><th>PV</th><th>FOR</th><th>DEX</th><th>VOL</th><th>Épuisé</th><th>Slots</th>
          </tr></thead>
          <tbody>
            {characters.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="py-2"><Link href={`/character/${c.id}`} className="underline">{c.name}</Link></td>
                <td>{c.pv}/{c.pvMax}</td><td>{c.force}</td><td>{c.dex}</td><td>{c.vol}</td>
                <td>{c.epuise ? "oui" : "—"}</td><td>{usedSlots(c.items, c.fatigue)}/10</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <MjNotes notes={notes} />
    </main>
  );
}
```
(`MjNotes` et `listNotes` viennent de la Task 11 — implémenter Task 11 avant de lancer.)

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: tableau de bord MJ (vue des personnages)"
```

---

## Task 11: Notes secrètes MJ (CRUD)

**Files:**
- Create: `src/app/actions/notes.ts`, `src/components/MjNotes.tsx`
- Test: `src/app/actions/notes.test.ts`

**Interfaces:**
- Consumes: `prisma` (Task 2).
- Produces:
  - `listNotes(): Promise<Note[]>`
  - `createNote(): Promise<void>`
  - `updateNote(id, data: {title?: string; content?: string}): Promise<void>`
  - `deleteNote(id): Promise<void>`
  - composant `MjNotes({ notes })`.

- [ ] **Step 1: Test d'intégration qui échoue**

Create `src/app/actions/notes.test.ts` :
```ts
import { afterAll, expect, test } from "vitest";
import { prisma } from "@/lib/prisma";
import { createNote, deleteNote, listNotes, updateNote } from "@/app/actions/notes";

test("cycle de vie d'une note", async () => {
  const before = (await listNotes()).length;
  await createNote();
  const notes = await listNotes();
  expect(notes.length).toBe(before + 1);
  const n = notes[0];
  await updateNote(n.id, { title: "Complot", content: "Le baron ment." });
  await deleteNote(n.id);
  expect((await listNotes()).length).toBe(before);
});
afterAll(() => prisma.$disconnect());
```

- [ ] **Step 2: Lancer, vérifier l'échec**

Run: `npm test src/app/actions/notes.test.ts` → FAIL.

- [ ] **Step 3: Implémenter les actions**

Create `src/app/actions/notes.ts` :
```ts
"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export function listNotes() {
  return prisma.note.findMany({ orderBy: { updatedAt: "desc" } });
}
export async function createNote(): Promise<void> {
  await prisma.note.create({ data: {} });
  revalidatePath("/mj");
}
export async function updateNote(id: string, data: { title?: string; content?: string }): Promise<void> {
  await prisma.note.update({ where: { id }, data });
  revalidatePath("/mj");
}
export async function deleteNote(id: string): Promise<void> {
  await prisma.note.delete({ where: { id } });
  revalidatePath("/mj");
}
```

- [ ] **Step 4: Lancer, vérifier le succès**

Run: `npm test src/app/actions/notes.test.ts` → PASS.

- [ ] **Step 5: Composant notes**

Create `src/components/MjNotes.tsx` : `"use client"`, reçoit `notes`. Bouton « + Nouvelle note » → `createNote()`. Chaque note : input `title` + textarea `content` (sauvegarde `onBlur` via `updateNote`), bouton supprimer (`deleteNote`). Écrire le composant complet sur le modèle des champs contrôlés de la Task 8.

- [ ] **Step 6: Vérifier**

Run: `npm run dev` → `/mj` (après mot de passe MJ) : le tableau des persos s'affiche ; créer/éditer/supprimer une note fonctionne et persiste.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: notes secrètes MJ (CRUD)"
```

---

## Self-Review

**Spec coverage :**
- §2 accès mot de passe app + MJ → Tasks 3, 4. ✅
- §2 accueil en cards + card MJ → Task 7. ✅
- §2 fiches ouvertes en édition à tous → Tasks 6, 8 (aucune restriction). ✅
- §2 interface MJ = tableau de bord + notes → Tasks 10, 11. ✅
- §2 portrait = import fichier → Task 9. ✅
- §3 modèle de données (Character/Item/Note, champs FR) → Task 2. ✅
- §3 règle de slots + fatigue → Task 5, affichée Tasks 8 & 10. ✅
- §4 routes (`/login`, `/`, `/character/[id]`, `/character/new`, `/mj`, `/mj/login`) → Tasks 4, 7, 8, 10. ✅
- §5 middleware + cookies signés, pas de Supabase Auth → Tasks 3, 4. ✅
- §7 hors périmètre (temps réel, dés, compendium) → non implémenté. ✅

**Placeholders :** les Tasks 8 & 11 décrivent des composants UP en prose + un modèle de champ concret plutôt que 150 lignes de JSX ; c'est volontaire (économie), mais chaque champ/action référencé existe et est typé. Aucun « TODO » résiduel.

**Type consistency :** noms de champs (`force`/`forceMax`, `dex`, `vol`, `pv`, `epuise`, `fatigue`, `sous`, `passe`, `liens`, `presages`) identiques entre schéma (Task 2), actions (Task 6) et UI (Tasks 8, 10). `usedSlots(items, fatigue)` : même signature Tasks 5, 8, 10. `ItemInput` défini Task 6, réutilisé Task 8. ✅

## Notes d'exécution

- **Ordre :** implémenter Task 11 (actions + composant `MjNotes`) avant de lancer `/mj` (Task 10 en dépend à l'exécution) — ou intervertir 10 et 11.
- **Tests DB (Tasks 6, 11) :** nécessitent `.env.local` rempli et la migration appliquée ; ils écrivent puis nettoient dans la vraie base Supabase.
- **Prérequis manuel utilisateur :** créer le projet Supabase, remplir `.env.local`, créer le bucket public `portraits`.
