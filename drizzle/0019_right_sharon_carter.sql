CREATE TABLE "replay_link" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"discipline" text NOT NULL,
	"scramble" text NOT NULL,
	"solution" varchar(500000) NOT NULL,
	"time_ms" integer NOT NULL,
	"username" text,
	"date" bigint,
	"created_by_id" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "replay_link" ADD CONSTRAINT "replay_link_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;