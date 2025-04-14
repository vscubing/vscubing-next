CREATE INDEX "avg_ms_idx" ON "round_session" USING btree ("avg_ms");--> statement-breakpoint
CREATE INDEX "time_ms_idx" ON "solve" USING btree ("time_ms");