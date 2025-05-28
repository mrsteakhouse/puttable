-- Create a function to update a specific element in a JSONB array
-- Always uses 'scorecards' table and 'data' column
CREATE OR REPLACE FUNCTION update_jsonb_array_element(
  record_id bigint,
  array_index int,
  new_value jsonb
) RETURNS void AS $$
BEGIN
  -- Direct SQL query with hardcoded table and column names
  UPDATE scorecards
  SET data = jsonb_set(data, ('{' || array_index || '}')::text[], new_value::jsonb, true)
  WHERE id = record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_jsonb_array_element TO authenticated;
GRANT EXECUTE ON FUNCTION update_jsonb_array_element TO anon;
GRANT EXECUTE ON FUNCTION update_jsonb_array_element TO service_role;

-- Add comment to explain function usage
COMMENT ON FUNCTION update_jsonb_array_element IS 'Updates a specific element in the data column of the scorecards table. Example: SELECT update_jsonb_array_element(1, 2, ''5''::jsonb);';
