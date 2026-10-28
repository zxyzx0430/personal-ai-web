import parse, { attributesToProps, domToReact, Element, type DOMNode, type HTMLReactParserOptions } from 'html-react-parser';
import type { ReactNode } from 'react';

/** Keep source typography and semantic structure while migrating interactive islands. */
export function htmlMarkup(source: string, replace?: HTMLReactParserOptions['replace']): ReactNode {
  return parse(source, { replace });
}
export function isElement(node: DOMNode): node is Element { return node instanceof Element; }
export function nodeChildren(node: Element, replace?: HTMLReactParserOptions['replace']): ReactNode {
  return domToReact(node.children as DOMNode[], { replace });
}
export function attrs(node: Element) { return attributesToProps(node.attribs); }
