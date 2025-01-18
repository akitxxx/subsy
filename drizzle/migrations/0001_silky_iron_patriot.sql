CREATE TABLE "user_auths" (
	"user_id" uuid NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "user_auths_user_id_provider_pk" PRIMARY KEY("user_id","provider"),
	CONSTRAINT "user_auths_provider_unique_idx" UNIQUE("provider","provider_id")
);
--> statement-breakpoint
ALTER TABLE "user_auths" ADD CONSTRAINT "user_auths_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_auths_provider_id_idx" ON "user_auths" USING btree ("provider_id");