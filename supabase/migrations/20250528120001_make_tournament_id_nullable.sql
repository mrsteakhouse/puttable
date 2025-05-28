-- Make tournament_id nullable in sessions table
ALTER TABLE "public"."sessions" ALTER COLUMN "tournament_id" DROP NOT NULL;