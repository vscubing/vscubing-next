DROP INDEX "account_emailaddress_upper";--> statement-breakpoint
CREATE INDEX "account_emailaddress_upper" ON "account_emailaddress" USING btree (upper((email)::text));