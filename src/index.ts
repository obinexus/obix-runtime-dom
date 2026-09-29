/**
 * obix-runtime-dom — the DOM of OBIX's native runtime (Phase 6, docs/recovery/native-runtime.md): how a value of the canonical IR becomes an attribute and
 * becomes text, by HTML's rules. It reads no global: every node it touches is one it is given.
 */
export { ObixRuntimeError } from 'obix-runtime-reactivity';
export type { ObixRuntimeErrorCode } from 'obix-runtime-reactivity';
export { BOOLEAN_ATTRIBUTES, attributeText, setAttributeValue, setBoundAttribute } from './attributes.js';
export { displayText } from './text.js';
export { NAMESPACE_URI, contentNamespace, createElementIn, elementNamespace, namespaceInside } from './namespaces.js';
export type { Namespace } from './namespaces.js';
