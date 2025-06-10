ALTER TABLE "users" ADD COLUMN "stellar_public_key" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stellar_wallet_created" boolean DEFAULT false;