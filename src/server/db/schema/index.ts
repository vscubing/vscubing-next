import { sql } from "drizzle-orm";
import { index, pgTable } from "drizzle-orm/pg-core";
import { users } from "./accounts";
import { DISCIPLINES } from "@/shared";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */

export const posts = pgTable(
  "post",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    createdById: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("created_by_idx").on(t.createdById),
    index("name_idx").on(t.name),
  ],
);

export const disciplines = pgTable("discipline", (d) => ({
  slug: d.text({ enum: DISCIPLINES }).primaryKey(),
}));

export const contests = pgTable("contest", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  slug: d.text().notNull().unique(),
  startDate: d
    .timestamp({
      withTimezone: true,
      mode: "string",
    })
    .notNull(),
  endDate: d.timestamp({ withTimezone: true, mode: "string" }),
  isOngoing: d.boolean().notNull(),
}));

export const disciplinesToContests = pgTable("contest_discipline", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  contestId: d
    .integer()
    .notNull()
    .references(() => contests.id, { onDelete: "cascade" }),
  disciplineSlug: d
    .text()
    .notNull()
    .references(() => disciplines.slug, { onDelete: "cascade" }),
}));

export * from "./accounts";
