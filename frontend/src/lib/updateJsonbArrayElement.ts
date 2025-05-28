import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Updates a specific element in the 'data' JSONB array column of the 'scorecards' table in Supabase
 *
 * @param supabase - The Supabase client
 * @param id - The ID of the scorecard record to update
 * @param index - The array index to update (0-based)
 * @param value - The new value for the array element
 * @returns The result of the update operation
 */
export async function updateJsonbArrayElement<T>(
  supabase: SupabaseClient,
  id: number,
  index: number,
  value: T
) {
  // Use PostgreSQL's jsonb_set function to update a specific array element
  // This function is hardcoded to use the 'scorecards' table and 'data' column
  // The path format for arrays is '{index}' where index is the 0-based position

  return supabase.rpc('update_jsonb_array_element', {
    record_id: id,
    array_index: index,
    new_value: value
  });
}

/**
 * Example usage:
 *
 * // Update the 3rd element (index 2) of the 'data' array in the 'scorecards' table
 * const result = await updateJsonbArrayElement(
 *   supabase,
 *   scorecard.id,
 *   2,
 *   5
 * );
 *
 * if (result.error) {
 *   console.error('Error updating array element:', result.error);
 * }
 */
