import { beforeAll, expect, test } from "vitest";
import { checkPassword, COOKIE_NAME, signSession, verifySession } from "@/lib/auth";

beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-at-least-32-characters-long!!";
  process.env.APP_PASSWORD = "app-pw";
});

test("checkPassword compare au mot de passe de l'app", () => {
  expect(checkPassword("app-pw")).toBe(true);
  expect(checkPassword("mauvais")).toBe(false);
  expect(checkPassword("")).toBe(false);
});

test("le cookie de session garde son nom historique", () => {
  expect(COOKIE_NAME).toBe("app_auth");
});

test("un token signé se vérifie, un token invalide non", async () => {
  const token = await signSession();
  expect(await verifySession(token)).toBe(true);
  expect(await verifySession(undefined)).toBe(false);
  expect(await verifySession("garbage")).toBe(false);
});
