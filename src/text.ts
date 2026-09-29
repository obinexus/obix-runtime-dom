/**
 * The text of a value, as the canonical IR says a text part shows it: `null` and `undefined` are nothing, a string is as it is, an array or an object is its JSON indented by two
 * spaces, anything else as ECMAScript writes it (`String`).
 */
export function displayText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}
