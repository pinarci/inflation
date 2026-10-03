"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PLAYER_IDENTITY_COOKIE } from "@/lib/player-session";

const allowedDestinations = new Set(["/", "/inflation", "/money"]);

export async function startNewPlayerSession(formData: FormData) {
  const requestedDestination = String(formData.get("destination") ?? "/inflation");
  const destination = allowedDestinations.has(requestedDestination)
    ? requestedDestination
    : "/inflation";

  cookies().delete(PLAYER_IDENTITY_COOKIE);
  redirect(destination);
}
