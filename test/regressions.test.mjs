/**
 * Regression tests written for the survivors of the Phase 6 mutation campaign (tests/mutation/runtime-dom.json; docs/recovery/native-runtime.md §15). The live properties of
 * form controls and the namespaces were held only by the component package's tests, which the DOM package's campaign does not run: they are stated here, where they live.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { NAMESPACE_URI, contentNamespace, createElementIn, elementNamespace, namespaceInside, setAttributeValue, setBoundAttribute } from 'obix-runtime-dom';

const documentOf = () => new JSDOM('<!doctype html><html><body></body></html>').window.document;

test('D07–D11: a function, a symbol and an object are refused as attribute values, each named for what it is', () => {
  const div = documentOf().createElement('div');
  const refusal = (value) => { try { setAttributeValue(div, 'title', value); return null; } catch (error) { return `${error.code}: ${error.message}`; } };
  assert.match(refusal(() => 1), /^OBIX_RUNTIME_VALUE: the attribute title is given a function:/);
  assert.match(refusal(Symbol('s')), /^OBIX_RUNTIME_VALUE: the attribute title is given a symbol:/);
  assert.match(refusal(['a', 1]), /^OBIX_RUNTIME_VALUE: the attribute title is given \["a",1\]:/);
  const circular = {};
  circular.self = circular;
  assert.match(refusal(circular), /^OBIX_RUNTIME_VALUE: the attribute title is given an object:/);
  assert.equal(div.hasAttribute('title'), false);
});

test('D15–D17, D20: a bound value is the live value of an input, a textarea and a select — and taking it away empties the field', () => {
  const document = documentOf();
  const input = document.createElement('input');
  input.value = 'typed by a user';
  setBoundAttribute(input, 'value', 'from the state');
  assert.equal(input.value, 'from the state');
  setBoundAttribute(input, 'value', null);
  assert.equal(input.value, '', 'no value: an empty field, not what the user had typed');
  assert.equal(input.hasAttribute('value'), false);
  const area = document.createElement('textarea');
  area.value = 'typed';
  setBoundAttribute(area, 'value', 'bound');
  assert.equal(area.value, 'bound');
  const select = document.createElement('select');
  for (const v of ['a', 'b']) { const o = document.createElement('option'); o.value = v; select.append(o); }
  setBoundAttribute(select, 'value', 'b');
  assert.equal(select.value, 'b');
  const div = document.createElement('div');
  setBoundAttribute(div, 'value', 'x');
  assert.equal(div.getAttribute('value'), 'x', 'on anything else, the attribute alone');
});

test('D18–D19: a bound checked is the live state of a box, and a bound selected the live state of an option', () => {
  const document = documentOf();
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = true;
  setBoundAttribute(box, 'checked', false);
  assert.equal(box.checked, false);
  setBoundAttribute(box, 'checked', true);
  assert.equal(box.checked, true);
  const select = document.createElement('select');
  const [a, b] = ['a', 'b'].map((v) => { const o = document.createElement('option'); o.value = v; select.append(o); return o; });
  // a user's choice first: from then on an option's attribute alone no longer moves the selection — only its live state does
  a.selected = true;
  b.selected = false;
  setBoundAttribute(b, 'selected', true);
  assert.equal(select.value, 'b');
  setBoundAttribute(a, 'selected', true);
  setBoundAttribute(b, 'selected', false);
  assert.equal(select.value, 'a');
});

test('D24–D30: namespaces as an HTML parser gives them, and elements made in them', () => {
  assert.equal(elementNamespace('svg', 'html'), 'svg');
  assert.equal(elementNamespace('math', 'html'), 'mathml');
  assert.equal(elementNamespace('div', 'html'), 'html');
  assert.equal(elementNamespace('div', 'svg'), 'svg', 'inside svg, every element is SVG');
  assert.equal(elementNamespace('mi', 'mathml'), 'mathml');
  assert.equal(contentNamespace('foreignObject', 'svg'), 'html');
  assert.equal(contentNamespace('g', 'svg'), 'svg');
  assert.equal(contentNamespace('foreignObject', 'html'), 'html');
  const document = documentOf();
  const svg = createElementIn(document, 'svg', 'svg');
  assert.equal(svg.namespaceURI, NAMESPACE_URI.svg);
  assert.equal(createElementIn(document, 'linearGradient', 'svg').localName, 'linearGradient', 'the case of an SVG name is kept');
  assert.equal(createElementIn(document, 'mi', 'mathml').namespaceURI, NAMESPACE_URI.mathml);
  assert.equal(createElementIn(document, 'p', 'html').namespaceURI, NAMESPACE_URI.html);
  assert.equal(namespaceInside(svg), 'svg');
  assert.equal(namespaceInside(createElementIn(document, 'foreignObject', 'svg')), 'html');
  assert.equal(namespaceInside(createElementIn(document, 'math', 'mathml')), 'mathml');
  assert.equal(namespaceInside(document.createElement('div')), 'html');
});
