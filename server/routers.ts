import { z } from "zod";
import { createProduct, deleteProduct, ensureStoreForUser, getProductForOwner, getStoreBySlug, getStoreForOwner, listProducts, updateProduct, updateStoreForOwner } from "./db";
import { storagePut } from "./storage";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";

const slugInput = z.object({ slug: z.string().min(1).max(120) });

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(() => ({ success: true } as const)),
  }),
  catalog: router({
    get: publicProcedure.input(slugInput).query(async ({ input }) => {
      const store = await getStoreBySlug(input.slug);
      if (!store) return { store: null, products: [] };
      return { store, products: await listProducts(store.id, false) };
    }),
  }),
  merchant: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const store = await ensureStoreForUser(ctx.user);
      if (!store) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Could not create your store yet." });
      return { store, products: await listProducts(store.id, true) };
    }),
    update: protectedProcedure.input(z.object({ name: z.string().trim().min(2).max(160), tagline: z.string().trim().min(3).max(300), whatsappNumber: z.string().trim().min(7).max(32), location: z.string().trim().min(2).max(160) })).mutation(({ ctx, input }) => updateStoreForOwner(ctx.user.openId, input)),
  }),
  media: router({
    uploadImage: protectedProcedure.input(z.object({ dataUrl: z.string().min(20), fileName: z.string().min(1).max(180), contentType: z.enum(["image/jpeg", "image/png", "image/webp"]) })).mutation(async ({ input }) => {
      const [header, payload] = input.dataUrl.split(",", 2);
      if (!header?.startsWith("data:") || !payload) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid image data." });
      if (!header.startsWith(`data:${input.contentType};base64`)) throw new TRPCError({ code: "BAD_REQUEST", message: "Image type does not match its file data." });
      const buffer = Buffer.from(payload, "base64");
      if (!buffer.length) throw new TRPCError({ code: "BAD_REQUEST", message: "The selected image is empty." });
      if (buffer.length > 5 * 1024 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Images must be 5 MB or smaller." });
      const extension = input.contentType === "image/jpeg" ? "jpg" : input.contentType.split("/")[1];
      return storagePut(`products/${Date.now()}-${input.fileName.replace(/[^a-z0-9._-]/gi, "_")}.${extension}`, buffer, input.contentType);
    }),
  }),
  products: router({
    create: protectedProcedure.input(z.object({ name: z.string().trim().min(2).max(180), description: z.string().trim().min(3).max(1000), category: z.string().trim().min(2).max(80), price: z.number().int().positive().max(1000000000), stock: z.number().int().min(0).max(1000000), imageUrl: z.string().refine(value => !value || value.startsWith("/manus-storage/") || /^https?:\/\//.test(value), "Image URL must be a stable storage path or HTTPS URL.") })).mutation(async ({ ctx, input }) => {
      const store = await ensureStoreForUser(ctx.user);
      if (!store) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Could not create your store yet." });
      return createProduct({ ...input, storeId: store.id, imageUrl: input.imageUrl || null, isPublished: true });
    }),
    togglePublished: protectedProcedure.input(z.object({ id: z.number().int().positive(), isPublished: z.boolean() })).mutation(async ({ ctx, input }) => { if (!(await getProductForOwner(input.id, ctx.user.openId))) throw new TRPCError({ code: "FORBIDDEN", message: "You cannot edit this product." }); return updateProduct(input.id, { isPublished: input.isPublished }); }),
    remove: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => { if (!(await getProductForOwner(input.id, ctx.user.openId))) throw new TRPCError({ code: "FORBIDDEN", message: "You cannot delete this product." }); await deleteProduct(input.id); return { success: true } as const; }),
  }),
});

export type AppRouter = typeof appRouter;
