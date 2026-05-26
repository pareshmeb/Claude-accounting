/**
 * Converts a date string from YYYY-MM-DD to dd/mm/yyyy for display.
 * Returns the original value if it's falsy or not in expected format.
 */
export function formatDate(dateStr) {
  if (!dateStr) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}
