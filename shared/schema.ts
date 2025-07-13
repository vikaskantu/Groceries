import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  isExpanded: boolean("is_expanded").default(true),
  order: integer("order").default(0),
});

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categories.id),
  name: text("name").notNull(),
  quantity: integer("quantity").default(1),
  unit: text("unit").default("Nos."), // "Nos.", "Gms.", "Kgs."
  referencePrice: text("reference_price").default(""),
  colorState: integer("color_state").default(0), // 0-3 for color cycling
  checked: boolean("checked").default(false),
  order: integer("order").default(0),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
});

export const updateCategorySchema = insertCategorySchema.partial();
export const updateItemSchema = insertItemSchema.partial();

export type Category = typeof categories.$inferSelect;
export type Item = typeof items.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;
export type UpdateItem = z.infer<typeof updateItemSchema>;
