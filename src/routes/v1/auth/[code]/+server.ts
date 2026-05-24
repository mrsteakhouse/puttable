import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { readFileSync } from "fs";

export const GET: RequestHandler = async ({ params, locals: { supabase, safeGetSession } }) => {
  const { session } = await safeGetSession()

  if (session) {
    console.log("User is already logged in");
    throw redirect(307, "/tournament");
  }

  let secret;
  try {
    secret = readFileSync("secret", "utf-8").trim();
  } catch (error) {
    console.error("Error reading secret file:", error);
    throw redirect(307, "/");
  }

  const decoded = Buffer.from(params.code, 'base64').toString('ascii').trim();

  if (!secret || decoded !== secret) {
    console.error("Invalid code or empty secret.");
    throw redirect(307, "/");
  }

  const { error } = await supabase.auth.signInAnonymously();

  if (error) {
    console.error(error);
    throw redirect(307, "/");
  }

  throw redirect(307, "/tournament");
}