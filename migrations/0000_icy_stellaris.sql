CREATE TABLE "exchange_rates" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_currency" varchar(10) NOT NULL,
	"to_currency" varchar(10) NOT NULL,
	"rate" numeric(20, 8) NOT NULL,
	"source" text DEFAULT 'onramp',
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" text NOT NULL,
	"from_currency" varchar(10),
	"to_currency" varchar(10),
	"from_amount" numeric(20, 8),
	"to_amount" numeric(20, 8),
	"exchange_rate" numeric(20, 8),
	"fee" numeric(20, 8),
	"status" text DEFAULT 'pending',
	"recipient_email" text,
	"recipient_name" text,
	"recipient_phone" text,
	"onramp_transaction_id" text,
	"payment_method" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone_number" text,
	"kyc_status" text DEFAULT 'pending',
	"onramp_user_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"currency" varchar(10) NOT NULL,
	"balance" numeric(20, 8) DEFAULT '0',
	"onramp_wallet_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;