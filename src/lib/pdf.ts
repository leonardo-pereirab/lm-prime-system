import { type DocumentProps, renderToBuffer } from "@react-pdf/renderer";

import {
  ContratoTemplate,
  type ContratoTemplateData,
} from "@/lib/pdf/ContratoTemplate";

export async function gerarPdfContrato(
  dados: ContratoTemplateData,
  nomeArquivo: string,
): Promise<Buffer> {
  // Call the template as a plain function so the returned element tree is
  // built by ContratoTemplate's own pdfEl factory (React 18-compatible $$typeof).
  // Using createElement(ContratoTemplate, ...) would go through Next.js's
  // aliased React 19 jsx-runtime and produce Symbol('react.transitional.element'),
  // which react-pdf's reconciler (built for React 18) does not recognise.
  return renderToBuffer(
    ContratoTemplate({
      dados,
      nomeArquivo,
    }) as unknown as React.ReactElement<DocumentProps>,
  );
}
