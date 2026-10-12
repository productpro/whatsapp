import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const stores = mysqlTable("stores", {
  id: int("id").autoincrement().primaryKey(),
  ownerOpenId: varchar("ownerOpenId", { length: 64 }).notNull().unique(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  tagline: text("tagline").notNull(),
  whatsappNumber: varchar("whatsappNumber", { length: 32 }).notNull(),
  location: varchar("location", { length: 160 }).notNull(),
  accentColor: varchar("accentColor", { length: 20 }).default("#1d4ed8").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("storeId").notNull().references(() => stores.id),
  name: varchar("name", { length: 180 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  price: int("price").notNull(),
  stock: int("stock").default(0).notNull(),
  imageUrl: text("imageUrl"),
  isPublished: boolean("isPublished").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Store = typeof stores.$inferSelect;
export type InsertStore = typeof stores.$inferInsert;
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
