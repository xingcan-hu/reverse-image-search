CREATE INDEX "referrals_inviter_created_at_idx" ON "referrals" USING btree ("inviter_user_id","created_at");--> statement-breakpoint
CREATE INDEX "search_logs_user_id_idx" ON "search_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transactions_user_created_at_idx" ON "transactions" USING btree ("user_id","created_at");