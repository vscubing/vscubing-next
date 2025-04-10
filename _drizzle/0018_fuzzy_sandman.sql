ALTER TABLE "contest" ADD COLUMN "createdAt" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "contest" ADD COLUMN "updatedAt" timestamp with time zone NOT NULL;