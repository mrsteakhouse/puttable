-- Alter the existing markdown domain to allow NULL and empty values
ALTER DOMAIN "public"."markdown" DROP CONSTRAINT IF EXISTS markdown_check;
ALTER DOMAIN "public"."markdown" ADD CONSTRAINT markdown_check CHECK (value IS NULL OR value ~ '^[\w\d*\-:\(\)`~_#\\+\{\}\[\].!\s,\.;\"]*$');