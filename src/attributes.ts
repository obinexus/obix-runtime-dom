/**
 * How a value becomes an attribute — HTML's rules and the canonical IR's, not a framework's:
 *
 *   null, undefined        the attribute is not there
 *   a boolean attribute    (HTML's list below) there as the empty string when `true`, not there when `false`; a string is written as it is
 *   anything else          its text as ECMAScript writes it — a number by `String`, `true` / `false` as the words (what `aria-*` and `data-*` hold)
 *   an array, an object    no attribute value: refused (OBIX_RUNTIME_VALUE), and the attribute is left as it was
 *
 * The attribute is written only when its text changes.
 */
import { ObixRuntimeError } from 'obix-runtime-reactivity';

/** The boolean attributes of HTML, by their HTML names. */
export const BOOLEAN_ATTRIBUTES: ReadonlySet<string> = new Set([
  'allowfullscreen', 'async', 'autofocus', 'autoplay', 'checked', 'controls', 'default', 'defer', 'disabled', 'formnovalidate', 'hidden', 'inert', 'loop', 'multiple', 'muted',
  'nomodule', 'novalidate', 'open', 'playsinline', 'readonly', 'required', 'reversed', 'selected',
]);

/** The text an attribute holds for a value, or `null` when the attribute is not there. */
export function attributeText(name: string, value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (BOOLEAN_ATTRIBUTES.has(name) && typeof value === 'boolean') return value ? '' : null;
  if (typeof value === 'object' || typeof value === 'function' || typeof value === 'symbol') {
    throw new ObixRuntimeError('OBIX_RUNTIME_VALUE', `the attribute ${name} is given ${describe(value)}: an array, an object or a function is no attribute value`);
  }
  return String(value);
}

function describe(value: unknown): string {
  if (typeof value === 'function') return 'a function';
  if (typeof value === 'symbol') return 'a symbol';
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return 'an object';
  }
}

/** Write `value` into the attribute `name` of `element` by the rules above. */
export function setAttributeValue(element: Element, name: string, value: unknown): void {
  const text = attributeText(name, value);
  if (text === null) {
    if (element.hasAttribute(name)) element.removeAttribute(name);
  } else if (element.getAttribute(name) !== text) {
    element.setAttribute(name, text);
  }
}

/**
 * Write a BOUND attribute: the attribute, by the rules above, and — for the controls whose attribute is only their default — the live property a user sees and changes: the
 * `value` of an input, a textarea or a select, the `checked` of an input, the `selected` of an option. So what a field shows follows the value, though the user typed in it.
 */
export function setBoundAttribute(element: Element, name: string, value: unknown): void {
  setAttributeValue(element, name, value);
  const tag = element.localName;
  if (name === 'value' && (tag === 'input' || tag === 'textarea' || tag === 'select')) {
    const control = element as HTMLInputElement;
    const text = attributeText(name, value) ?? '';
    if (control.value !== text) control.value = text;
  } else if (name === 'checked' && tag === 'input') {
    const control = element as HTMLInputElement;
    const on = attributeText(name, value) !== null;
    if (control.checked !== on) control.checked = on;
  } else if (name === 'selected' && tag === 'option') {
    const option = element as HTMLOptionElement;
    const on = attributeText(name, value) !== null;
    if (option.selected !== on) option.selected = on;
  }
}
