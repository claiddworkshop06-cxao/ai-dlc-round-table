import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  defaultReturnDays: integer("default_return_days"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id")
    .notNull()
    .references(() => equipment.id),
  borrowerName: text("borrower_name").notNull(),
  borrowedAt: timestamp("borrowed_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
  returnDueAt: timestamp("return_due_at", { mode: "date", withTimezone: true }),
  returnedAt: timestamp("returned_at", { mode: "date", withTimezone: true }),
});
