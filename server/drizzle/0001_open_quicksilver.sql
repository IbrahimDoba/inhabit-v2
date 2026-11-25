CREATE TABLE "waitlist" (
	"email" text PRIMARY KEY NOT NULL,
	"newsletter" boolean DEFAULT false NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_token_unique" UNIQUE("token")
);
