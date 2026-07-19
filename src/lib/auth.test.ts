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
