DROP INDEX "subscriptions_next_payment_at_idx";--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "expired_at" timestamp with time zone NOT NULL;--> statement-breakpoint
CREATE INDEX "subscriptions_expired_at_idx" ON "subscriptions" USING btree ("expired_at");--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "next_payment_at";