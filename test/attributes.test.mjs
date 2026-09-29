/**
 * N0 — the DOM writes of the native runtime: how a value becomes an attribute and how a value becomes text. These are the rules of HTML and of the canonical IR, not of any
 * framework: an attribute whose value is null or undefined is not there; a boolean attribute of HTML is there (as the empty string) when true and not there when false; any
 * other attribute holds its value as ECMAScript writes it; an array or an object is no attribute value and is refused. Text: null and undefined are nothing, strings are as they
 * are, arrays and objects are JSON indented by two spaces, anything else as ECMAScript writes it.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { BOOLEAN_ATTRIBUTES, displayText, setAttributeValue } from 'obix-runtime-dom';

const element = (tag = 'div') => new JSDOM('').window.document.createElement(tag);

test('a string, a number and a boolean of an ordinary attribute are written as ECMAScript writes them', () => {
  const div = element();
  setAttributeValue(div, 'title', 'hello');
  setAttributeValue(div, 'data-count', 3);
  setAttributeValue(div, 'aria-pressed', false);
  setAttributeValue(div, 'aria-busy', true);
  setAttributeValue(div, 'data-zero', -0);
  assert.equal(div.getAttribute('title'), 'hello');
  assert.equal(div.getAttribute('data-count'), '3');
  assert.equal(div.getAttribute('aria-pressed'), 'false', 'aria-* holds "true" / "false"');
  assert.equal(div.getAttribute('aria-busy'), 'true');
  assert.equal(div.getAttribute('data-zero'), '0', 'String(-0) is "0"');
});

test('null and undefined take the attribute away', () => {
  const div = element();
  setAttributeValue(div, 'title', 'x');
  setAttributeValue(div, 'title', null);
  assert.equal(div.hasAttribute('title'), false);
  setAttributeValue(div, 'title', 'x');
  setAttributeValue(div, 'title', undefined);
  assert.equal(div.hasAttribute('title'), false);
});

test('a boolean attribute of HTML is there as the empty string when true, not there when false, and a string is written as it is', () => {
  const button = element('button');
  setAttributeValue(button, 'disabled', true);
  assert.equal(button.getAttribute('disabled'), '');
  assert.equal(button.disabled, true);
  setAttributeValue(button, 'disabled', false);
  assert.equal(button.hasAttribute('disabled'), false);
  assert.equal(button.disabled, false);
  setAttributeValue(button, 'disabled', 'disabled');
  assert.equal(button.getAttribute('disabled'), 'disabled');
  for (const name of ['checked', 'hidden', 'readonly', 'required', 'selected', 'multiple', 'open', 'inert']) assert.ok(BOOLEAN_ATTRIBUTES.has(name), name);
  assert.equal(BOOLEAN_ATTRIBUTES.has('aria-hidden'), false);
});

test('an array or an object is no attribute value: it is refused, and the attribute is left as it was', () => {
  const div = element();
  setAttributeValue(div, 'class', 'kept');
  assert.throws(() => setAttributeValue(div, 'class', ['a', 'b']), (error) => error.code === 'OBIX_RUNTIME_VALUE' && /class/.test(error.message));
  assert.throws(() => setAttributeValue(div, 'style', { color: 'red' }), (error) => error.code === 'OBIX_RUNTIME_VALUE');
  assert.equal(div.getAttribute('class'), 'kept');
});

test('writing the value an attribute already holds does not write it again', () => {
  const div = element();
  let writes = 0;
  const original = div.setAttribute.bind(div);
  div.setAttribute = (name, value) => { writes++; original(name, value); };
  setAttributeValue(div, 'title', 'same');
  setAttributeValue(div, 'title', 'same');
  setAttributeValue(div, 'data-n', 1);
  setAttributeValue(div, 'data-n', '1');
  assert.equal(writes, 2);
});

test('the text of a value', () => {
  assert.equal(displayText(null), '');
  assert.equal(displayText(undefined), '');
  assert.equal(displayText('as is'), 'as is');
  assert.equal(displayText(0), '0');
  assert.equal(displayText(-0), '0');
  assert.equal(displayText(1.5), '1.5');
  assert.equal(displayText(NaN), 'NaN');
  assert.equal(displayText(true), 'true');
  assert.equal(displayText([1, 'a']), '[\n  1,\n  "a"\n]');
  assert.equal(displayText({ a: 1 }), '{\n  "a": 1\n}');
});
