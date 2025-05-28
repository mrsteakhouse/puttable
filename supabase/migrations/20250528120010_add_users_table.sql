-- Migration to add users table and link it to the RBAC implementation

-- Create users table
CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" uuid NOT NULL,
    "email" text,
    "display_name" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "public"."users" OWNER TO "postgres";
ALTER TABLE ONLY "public"."users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."users" ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own user data" ON "public"."users"
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own user data" ON "public"."users"
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Enable read access for admins" ON "public"."users"
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() AND r.name = 'admin'
        )
    );

-- Grant permissions
GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";

-- Create trigger to automatically create a user record when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.users (id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Update the list_users_with_roles function to use the new users table
CREATE OR REPLACE FUNCTION public.list_users_with_roles()
RETURNS TABLE (
    user_id uuid,
    email text,
    user_name text,
    roles text[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id AS user_id,
        u.email,
        u.display_name AS user_name,
        ARRAY_AGG(r.name) AS roles
    FROM
        public.users u
    LEFT JOIN
        public.user_roles ur ON u.id = ur.user_id
    LEFT JOIN
        public.roles r ON ur.role_id = r.id
    GROUP BY
        u.id, u.email, u.display_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill existing users
INSERT INTO public.users (id, email, display_name)
SELECT
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', au.email)
FROM
    auth.users au
LEFT JOIN
    public.users pu ON au.id = pu.id
WHERE
    pu.id IS NULL;