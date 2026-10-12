import { asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertProduct, InsertUser, Product, products, Store, stores, users, User } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); }
    catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  values.lastSignedIn ??= new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getStoreBySlug(slug: string): Promise<Store | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(stores).where(eq(stores.slug, slug)).limit(1);
  return result[0];
}

export async function getStoreForOwner(ownerOpenId: string): Promise<Store | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(stores).where(eq(stores.ownerOpenId, ownerOpenId)).limit(1);
  return result[0];
}

function slugify(value: string) {
  const base = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);
  return base || "my-store";
}

export async function ensureStoreForUser(user: Pick<User, "openId" | "name">): Promise<Store | undefined> {
  const existing = await getStoreForOwner(user.openId);
  if (existing) return existing;
  const db = await getDb();
  if (!db) return undefined;
  const baseName = (user.name || "My Store").trim();
  const slug = `${slugify(baseName)}-${user.openId.slice(-6).toLowerCase()}`;
  await db.insert(stores).values({
    ownerOpenId: user.openId,
    slug,
    name: baseName === "My Store" ? baseName : `${baseName}'s Store`,
    tagline: "Your products, your customers, your next sale.",
    whatsappNumber: "",
    location: "Nigeria",
    accentColor: "#1d4ed8",
  }).onDuplicateKeyUpdate({ set: { ownerOpenId: user.openId } });
  return getStoreForOwner(user.openId);
}

export async function updateStoreForOwner(ownerOpenId: string, values: Partial<Pick<InsertProduct, never>> & Partial<Pick<Store, "name" | "tagline" | "whatsappNumber" | "location">>) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const store = await getStoreForOwner(ownerOpenId);
  if (!store) return undefined;
  await db.update(stores).set(values).where(eq(stores.id, store.id));
  return getStoreForOwner(ownerOpenId);
}

export async function listProducts(storeId: number, includeUnpublished = true): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(products).where(eq(products.storeId, storeId)).orderBy(asc(products.createdAt));
  return includeUnpublished ? result : result.filter(product => product.isPublished);
}

export async function createProduct(input: InsertProduct): Promise<Product | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(products).values(input);
  const created = await db.select().from(products).where(eq(products.id, Number(result[0].insertId))).limit(1);
  return created[0];
}

export async function updateProduct(id: number, values: Partial<InsertProduct>): Promise<Product | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(products).set(values).where(eq(products.id, id));
  const updated = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return updated[0];
}

export async function getProductForOwner(id: number, ownerOpenId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select({ product: products }).from(products).innerJoin(stores, eq(products.storeId, stores.id)).where(eq(products.id, id)).limit(1);
  const row = result[0];
  if (!row) return undefined;
  const owner = await getStoreForOwner(ownerOpenId);
  return owner?.id === row.product.storeId ? row.product : undefined;
}

export async function deleteProduct(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.delete(products).where(eq(products.id, id));
}
