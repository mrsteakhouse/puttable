-- Enable realtime for scorecards table
ALTER PUBLICATION supabase_realtime ADD TABLE scorecards;
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;

CREATE POLICY "Enable listening for scorecard changes" ON "realtime"."messages"
    AS PERMISSIVE TO authenticated
    WITH CHECK (
        ((extension = 'postgres_changes'::text) AND (realtime.topic() = 'scorecard-changes'::text))
    );

CREATE POLICY "Enable listening for session changes" ON "realtime"."messages"
    AS PERMISSIVE TO authenticated
    WITH CHECK (
        ((extension = 'postgres_changes'::text) AND (realtime.topic() = 'tournament-session-changes'::text))
    );