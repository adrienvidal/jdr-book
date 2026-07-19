import { expect, test } from "vitest";
import { ping } from "@/lib/ping";

test("ping renvoie pong", () => {
  expect(ping()).toBe("pong");
});
