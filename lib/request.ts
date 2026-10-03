import "server-only";

import { headers } from "next/headers";

const DEVELOPMENT_FALLBACK_IP = "95.183.240.91";

export function getRequestIp() {
  const requestHeaders = headers();
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  return requestHeaders.get("x-real-ip") ?? forwarded ?? DEVELOPMENT_FALLBACK_IP;
}

export function getPlayerSuffix(ip: string) {
  const reverseIp = ip.split(".").reverse();
  return `${reverseIp[0] ?? ""}${reverseIp[1] ?? ""}`;
}
