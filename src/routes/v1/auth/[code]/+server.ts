import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { readFileSync } from "fs";

export const GET: RequestHandler = async ({ params, locals: { supabase, safeGetSession } }) => {
  const { session } = await safeGetSession()

  if (session) {
    throw redirect(307, "/tournament");
  }

  let secret;
  try {
    secret = readFileSync("secret", "utf-8").trim();
  } catch (error) {
    throw redirect(307, "/");
  }

  let decoded = Buffer.from(params.code, 'base64').toString('ascii');

  if (!!secret || decoded !== secret) {
    throw redirect(307, "/");
  }

  const { error } = await supabase.auth.signInAnonymously();

  if (error) {
    console.error(error);
    throw redirect(307, "/");
  }

  throw redirect(307, "/tournament");
}