ALTER TABLE "contest" RENAME COLUMN "name" TO "slug";--> statement-breakpoint
ALTER TABLE "contest" ADD CONSTRAINT "contest_slug_unique" UNIQUE("slug");