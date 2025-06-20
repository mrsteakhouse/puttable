SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

SET default_tablespace = '';
SET default_table_access_method = "heap";

create domain "public"."markdown" AS character varying CHECK (value ~ '^[\w\d*\-:\(\)`~_#\\+\{\}\[\].!\s,\.;\"]+$');
create domain "public"."alphanumeric" as character varying NOT NULL CHECK (value ~ '^[\w\d\-\s,\.]+$');

CREATE TABLE IF NOT EXISTS "public"."players" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "firstname" "public"."alphanumeric",
    "lastname" "public"."alphanumeric",
    "rating_class_id" bigint NOT NULL
);

ALTER TABLE "public"."players" OWNER TO "postgres";
ALTER TABLE "public"."players" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."players_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


CREATE TABLE IF NOT EXISTS "public"."rating_classes" (
    "id" bigint NOT NULL,
    "name" "public"."alphanumeric" NOT NULL
);

ALTER TABLE "public"."rating_classes" OWNER TO "postgres";
ALTER TABLE "public"."rating_classes" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."rating_classes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


CREATE TABLE IF NOT EXISTS "public"."sessions" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "submitted_at" timestamp with time zone,
    "tournament_id" bigint NOT NULL,
    "user_id" "uuid"
);

ALTER TABLE "public"."sessions" OWNER TO "postgres";
ALTER TABLE "public"."sessions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."sessions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


CREATE TABLE IF NOT EXISTS "public"."tournaments" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "public"."markdown" NOT NULL,
    "start_date" timestamp with time zone NOT NULL,
    "end_date" timestamp with time zone NOT NULL,
    "number_of_holes" bigint NOT NULL,
    "minimum_participants" bigint NOT NULL,
    "description" "public"."markdown"
);

ALTER TABLE "public"."tournaments" OWNER TO "postgres";
ALTER TABLE "public"."tournaments" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."tournaments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

create table if not exists "public"."scorecards" (
    "id" bigint not null,
    "session_id" bigint not null,
    "player_id" bigint not null,
    "data" jsonb not null
);

ALTER TABLE "public"."scorecards" OWNER TO "postgres";
ALTER TABLE "public"."scorecards" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."scorecards_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


ALTER TABLE ONLY "public"."players" ADD CONSTRAINT "players_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."rating_classes" ADD CONSTRAINT "rating_classes_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."sessions" ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."tournaments" ADD CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."scorecards" ADD CONSTRAINT "scorecards_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."players" ADD CONSTRAINT "players_rating_class_id_fkey" FOREIGN KEY ("rating_class_id") REFERENCES "public"."rating_classes"("id");

ALTER TABLE ONLY "public"."sessions" ADD CONSTRAINT "sessions_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."scorecards" ADD CONSTRAINT "scorecards_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "public"."scorecards" ADD CONSTRAINT "scorecards_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON UPDATE CASCADE ON DELETE CASCADE;


CREATE POLICY "Enable read access for all users" ON "public"."players" FOR SELECT USING (true);
CREATE POLICY "Enable all users to insert" ON "public"."players" FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON "public"."sessions" FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON "public"."sessions" FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON "public"."sessions" FOR UPDATE WITH CHECK (submitted_at IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."rating_classes" FOR INSERT TO "authenticated" WITH CHECK (true);
CREATE POLICY "Enable read access for all users" ON "public"."rating_classes" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."tournaments" FOR SELECT TO anon USING (true);
CREATE POLICY "Enable read access for authenticated users" ON "public"."tournaments" FOR SELECT TO "authenticated" USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON "public"."tournaments" FOR INSERT TO "authenticated" WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON "public"."tournaments" FOR UPDATE TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON "public"."scorecards" FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON "public"."scorecards" FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON "public"."scorecards" FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM "public"."sessions" s
        WHERE s.id = "session_id"
        AND s.submitted_at IS NULL
    )
);

ALTER TABLE "public"."players" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."rating_classes" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."sessions" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."tournaments" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."scorecards" ENABLE ROW LEVEL SECURITY;


ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON TABLE "public"."players" TO "anon";
GRANT ALL ON TABLE "public"."players" TO "authenticated";
GRANT ALL ON TABLE "public"."players" TO "service_role";

GRANT ALL ON SEQUENCE "public"."players_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."players_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."players_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."rating_classes" TO "anon";
GRANT ALL ON TABLE "public"."rating_classes" TO "authenticated";
GRANT ALL ON TABLE "public"."rating_classes" TO "service_role";

GRANT ALL ON SEQUENCE "public"."rating_classes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."rating_classes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."rating_classes_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."sessions" TO "anon";
GRANT ALL ON TABLE "public"."sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."sessions" TO "service_role";

GRANT ALL ON SEQUENCE "public"."sessions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."sessions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."sessions_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."tournaments" TO "anon";
GRANT ALL ON TABLE "public"."tournaments" TO "authenticated";
GRANT ALL ON TABLE "public"."tournaments" TO "service_role";

GRANT ALL ON SEQUENCE "public"."tournaments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tournaments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tournaments_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."scorecards" TO "anon";
GRANT ALL ON TABLE "public"."scorecards" TO "authenticated";
GRANT ALL ON TABLE "public"."scorecards" TO "service_role";

GRANT ALL ON SEQUENCE "public"."scorecards_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."scorecards_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."scorecards_id_seq" TO "service_role";


ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
