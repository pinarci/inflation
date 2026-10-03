import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_VALUE = "macrogames-admin";

function adminPassword() {
  const password = process.env.NEXT_PRIVATE_ADMIN_PASSWORD;
  if (!password) throw new Error("Missing NEXT_PRIVATE_ADMIN_PASSWORD");
  return password;
}

export function createAdminSession() {
  return createHmac("sha256", adminPassword()).update(SESSION_VALUE).digest("hex");
}

export function isAdminSession(value?: string) {
  if (!value) return false;
  const expected = createAdminSession();
  const actualBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export function isAdminPassword(value: FormDataEntryValue | null) {
  const submitted = Buffer.from(String(value));
  const expected = Buffer.from(adminPassword());
  return submitted.length === expected.length && timingSafeEqual(submitted, expected);
}
