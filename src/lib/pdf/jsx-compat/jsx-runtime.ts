// Custom JSX runtime for react-pdf templates.
//
// Next.js 15 aliases react/jsx-runtime to an internal React 19 canary build
// that uses Symbol.for('react.transitional.element') as $$typeof.
// react-pdf's reconciler (built for React 18) only recognises
// Symbol.for('react.element'), so JSX compiled through Next.js's runtime is
// rejected at render time with React error #31.
//
// This module provides jsx/jsxs functions that produce React 18-compatible
// elements regardless of which React version Next.js injects into the bundle.
// Files using react-pdf primitives should declare:
//   /* @jsxImportSource ../jsx-compat */
// (path relative to the importing file).

const REACT_ELEMENT_TYPE = Symbol.for("react.element");

export const Fragment = Symbol.for("react.fragment");

function criarElemento(
  tipo: unknown,
  props: Record<string, unknown> | null,
  chave?: string | null,
): unknown {
  const { ref = null, ...rest } = props ?? {};
  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type: tipo,
    key: chave == null ? null : String(chave),
    ref,
    props: rest,
    _owner: null,
    _store: {},
  };
}

export function jsx(
  tipo: unknown,
  props: Record<string, unknown> | null,
  chave?: string | null,
): unknown {
  return criarElemento(tipo, props, chave);
}

export function jsxs(
  tipo: unknown,
  props: Record<string, unknown> | null,
  chave?: string | null,
): unknown {
  return criarElemento(tipo, props, chave);
}

// Namespace re-exported so TypeScript has prop types from @react-pdf/renderer.
export type { JSX } from "react";
