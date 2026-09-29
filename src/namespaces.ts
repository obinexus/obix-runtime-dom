/**
 * The namespace an element is made in, as an HTML parser decides it — and as a browser needs it to draw it: an `svg` element and what is inside it are SVG elements, a `math`
 * element and what is inside it MathML elements, and the content of an SVG `foreignObject` is HTML again. An HTML element is made by `createElement` (the document's own
 * rules), any other by `createElementNS`, which keeps the case of the name (`foreignObject`, `linearGradient`) and of its attributes (`viewBox`).
 */
export type Namespace = 'html' | 'svg' | 'mathml';

export const NAMESPACE_URI: Readonly<Record<Namespace, string>> = Object.freeze({
  html: 'http://www.w3.org/1999/xhtml',
  svg: 'http://www.w3.org/2000/svg',
  mathml: 'http://www.w3.org/1998/Math/MathML',
});

/** The namespace of an element named `tag`, written where `parent` is the namespace. */
export function elementNamespace(tag: string, parent: Namespace): Namespace {
  if (parent !== 'html') return parent;
  if (tag === 'svg') return 'svg';
  if (tag === 'math') return 'mathml';
  return 'html';
}

/** The namespace of what is inside an element named `tag` of `namespace`. */
export function contentNamespace(tag: string, namespace: Namespace): Namespace {
  return namespace === 'svg' && tag === 'foreignObject' ? 'html' : namespace;
}

/** The namespace of what is put inside `element`. */
export function namespaceInside(element: Element): Namespace {
  if (element.namespaceURI === NAMESPACE_URI.svg) return contentNamespace(element.localName, 'svg');
  if (element.namespaceURI === NAMESPACE_URI.mathml) return 'mathml';
  return 'html';
}

/** Make an element named `tag` in `namespace`, by `document`. */
export function createElementIn(document: Document, tag: string, namespace: Namespace): Element {
  return namespace === 'html' ? document.createElement(tag) : document.createElementNS(NAMESPACE_URI[namespace], tag);
}
