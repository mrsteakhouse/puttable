CREATE TABLE IF NOT EXISTS "public"."rating_classes_to_tournaments"
(
    tournament_id   bigint not null
        constraint rating_classes_to_tournaments_tournaments_id_fk
            references tournaments,
    rating_class_id bigint
        constraint rating_classes_to_tournaments_rating_classes_id_fk
            references rating_classes
);

ALTER TABLE "public"."rating_classes_to_tournaments" OWNER TO "postgres";

ALTER TABLE "public"."rating_classes_to_tournaments" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON "public"."rating_classes_to_tournaments" FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."rating_classes_to_tournaments" FOR INSERT TO "authenticated" WITH CHECK (true);

ALTER TABLE ONLY "public"."rating_classes_to_tournaments"
    ADD CONSTRAINT "rating_classes_to_tournaments_pkey" PRIMARY KEY ("tournament_id", "rating_class_id");

ALTER TABLE ONLY "public"."rating_classes_to_tournaments"
    ADD CONSTRAINT "rating_classes_to_tournaments_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."rating_classes_to_tournaments"
    ADD CONSTRAINT "rating_classes_to_tournaments_rating_class_id_fkey" FOREIGN KEY ("rating_class_id") REFERENCES "public"."rating_classes"("id") ON UPDATE CASCADE ON DELETE CASCADE;