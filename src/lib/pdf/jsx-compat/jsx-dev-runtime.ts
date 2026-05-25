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

export function jsxDEV(
  tipo: unknown,
  props: Record<string, unknown> | null,
  chave?: string | null,
  _isStaticChildren?: boolean,
  _source?: unknown,
  _self?: unknown,
): unknown {
  void _isStaticChildren;
  void _source;
  void _self;
  return criarElemento(tipo, props, chave);
}

export type { JSX } from "react";
