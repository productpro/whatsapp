import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { getSupabaseUser } from "./supabase";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: User | null = null;
  const authorization = opts.req.headers.authorization;
  if (typeof authorization === "string" && authorization.startsWith("Bearer ")) {
    try {
      const supabaseUser = await getSupabaseUser(authorization.slice(7));
      if (supabaseUser) {
        const metadata = supabaseUser.user_metadata ?? {};
        const name = String(metadata.full_name || metadata.name || supabaseUser.email?.split("@")[0] || "Merchant");
        await db.upsertUser({ openId: supabaseUser.id, name, email: supabaseUser.email ?? null, loginMethod: "email", lastSignedIn: new Date() });
        user = (await db.getUserByOpenId(supabaseUser.id)) ?? null;
      }
    } catch (error) {
      console.warn("[Supabase Auth] Request authentication failed", error instanceof Error ? error.message : "unknown error");
    }
  }
  return { req: opts.req, res: opts.res, user };
}
