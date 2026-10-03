import { z } from "zod";

export const usernameSchema = z
  .string()
  .min(3)
  .max(11)
  .regex(/^[a-zA-Z0-9]+$/);

export function messageUrl(pathname: string, key: "error" | "message", value: string) {
  return `${pathname}?${key}=${encodeURIComponent(value)}`;
}
