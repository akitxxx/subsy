CREATE INDEX "subscriptions_started_at_idx" ON "subscriptions" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "subscriptions_cancelled_at_idx" ON "subscriptions" USING btree ("cancelled_at");--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_name_unique_idx" UNIQUE("user_id","name");--> statement-breakpoint
ALTER TABLE "user_auths" ADD CONSTRAINT "user_auths_user_id_provider_id_unique_idx" UNIQUE("user_id","provider_id");--> statement-breakpoint
ALTER TABLE "user_auths" ADD CONSTRAINT "user_auths_user_id_provider_unique_idx" UNIQUE("user_id","provider");