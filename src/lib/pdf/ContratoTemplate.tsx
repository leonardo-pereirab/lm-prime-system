/* @jsxImportSource ./jsx-compat */
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

const VERSAO_TEMPLATE = "v1";

let fonteRegistrada = false;

function garantirFonteRegistro() {
  if (fonteRegistrada) {
    return;
  }

  const fonteRegular = process.env.CONTRATO_PDF_FONT_REGULAR_URL;
  const fonteBold = process.env.CONTRATO_PDF_FONT_BOLD_URL;

  if (!fonteRegular || !fonteBold) {
    fonteRegistrada = true;
    return;
  }

  // Fallback seguro: caso a fonte externa esteja indisponivel,
  // o renderer usa a fonte padrao sem bloquear a geracao do PDF.
  try {
    Font.register({
      family: "Roboto",
      fonts: [
        {
          src: fonteRegular,
        },
        {
          src: fonteBold,
          fontWeight: 700,
        },
      ],
    });
  } catch {
    // Nao interrompe a geracao em caso de erro no carregamento remoto.
  }

  fonteRegistrada = true;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 36,
    fontFamily: "Helvetica",
    fontSize: 10.5,
    lineHeight: 1.45,
    color: "#111827",
  },
  cabecalho: {
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
    paddingBottom: 12,
    marginBottom: 16,
  },
  empresaNome: {
    fontSize: 14,
    fontWeight: 700,
  },
  empresaLinha: {
    fontSize: 9.5,
    color: "#374151",
    marginTop: 2,
  },
  contratoNumero: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: 700,
  },
  secao: {
    marginTop: 10,
  },
  secaoTitulo: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 6,
  },
  linha: {
    marginTop: 2,
  },
  destaque: {
    fontWeight: 700,
  },
  tabelaTrechos: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  tabelaLinha: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tabelaCabecalho: {
    backgroundColor: "#F3F4F6",
    fontWeight: 700,
  },
  tabelaCelulaOrigemDestino: {
    width: "52%",
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
  },
  tabelaCelulaData: {
    width: "24%",
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
  },
  tabelaCelulaHora: {
    width: "24%",
    padding: 6,
  },
  clausula: {
    marginTop: 4,
    textAlign: "justify",
  },
  assinaturasContainer: {
    marginTop: 26,
    flexDirection: "row",
    gap: 16,
  },
  assinaturaBox: {
    flex: 1,
    alignItems: "center",
  },
  assinaturaLinha: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#9CA3AF",
    marginBottom: 6,
  },
  rodape: {
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    fontSize: 8.5,
    color: "#4B5563",
  },
});

export type ContratoTemplateTrecho = {
  origem: string;
  destino: string;
  data: string;
  hora: string;
};

export type ContratoTemplateData = {
  codigoAtendimento: string;
  dataGeracao: string;
  contratanteNome: string;
  contratanteDocumento: string;
  contratadaNome: string;
  tipoServico: string;
  passageiros: number;
  trechos: ContratoTemplateTrecho[];
  valorTotal: string;
  formaPagamento: string;
  observacoes?: string;
};

type ContratoTemplateProps = {
  nomeArquivo: string;
  dados: ContratoTemplateData;
};

export function ContratoTemplate({
  dados,
  nomeArquivo,
}: ContratoTemplateProps) {
  garantirFonteRegistro();

  return (
    <Document title={nomeArquivo} subject="Contrato de prestacao de servico">
      <Page size="A4" style={styles.page}>
        <View style={styles.cabecalho}>
          <Text style={styles.empresaNome}>{dados.contratadaNome}</Text>
          <Text style={styles.empresaLinha}>
            Prestacao de servicos de transporte com motorista
          </Text>
          <Text style={styles.contratoNumero}>
            Contrato No {dados.codigoAtendimento}
          </Text>
          <Text style={styles.empresaLinha}>
            Data de geracao: {dados.dataGeracao}
          </Text>
        </View>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>1. Identificacao das partes</Text>
          <Text style={styles.linha}>
            <Text style={styles.destaque}>Contratante:</Text>{" "}
            {dados.contratanteNome}
          </Text>
          <Text style={styles.linha}>
            <Text style={styles.destaque}>Documento:</Text>{" "}
            {dados.contratanteDocumento}
          </Text>
          <Text style={styles.linha}>
            <Text style={styles.destaque}>Contratada:</Text>{" "}
            {dados.contratadaNome}
          </Text>
        </View>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>2. Objeto do servico</Text>
          <Text style={styles.linha}>
            Servico contratado: {dados.tipoServico}. Passageiros previstos:{" "}
            {dados.passageiros}.
          </Text>

          <View style={styles.tabelaTrechos}>
            <View style={styles.tabelaLinha}>
              <Text
                style={[
                  styles.tabelaCelulaOrigemDestino,
                  styles.tabelaCabecalho,
                ]}
              >
                Trecho
              </Text>
              <Text style={[styles.tabelaCelulaData, styles.tabelaCabecalho]}>
                Data
              </Text>
              <Text style={[styles.tabelaCelulaHora, styles.tabelaCabecalho]}>
                Hora
              </Text>
            </View>
            {dados.trechos.map((trecho, indice) => (
              <View
                key={`${trecho.origem}-${trecho.destino}-${indice}`}
                style={styles.tabelaLinha}
              >
                <Text style={styles.tabelaCelulaOrigemDestino}>
                  {trecho.origem} {"->"} {trecho.destino}
                </Text>
                <Text style={styles.tabelaCelulaData}>{trecho.data}</Text>
                <Text style={styles.tabelaCelulaHora}>{trecho.hora}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>3. Valor e forma de pagamento</Text>
          <Text style={styles.linha}>
            Valor total contratado: {dados.valorTotal}.
          </Text>
          <Text style={styles.linha}>
            Forma de pagamento: {dados.formaPagamento}.
          </Text>
        </View>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>4. Clausulas gerais</Text>
          <Text style={styles.clausula}>
            4.1 A contratada se compromete a executar o transporte na data,
            horario e trajetos informados, observando normas de seguranca e
            legislacao vigente.
          </Text>
          <Text style={styles.clausula}>
            4.2 Alteracoes de itinerario, horarios ou quantidade de passageiros
            devem ser solicitadas com antecedencia minima de 24 horas, sujeitas
            a reavaliacao comercial.
          </Text>
          <Text style={styles.clausula}>
            4.3 Em caso de cancelamento apos confirmacao da reserva, aplicam-se
            as condicoes operacionais e comerciais registradas no atendimento.
          </Text>
          {dados.observacoes ? (
            <Text style={styles.clausula}>
              4.4 Observacoes adicionais: {dados.observacoes}.
            </Text>
          ) : null}
        </View>

        <View style={styles.secao}>
          <Text>
            Local e data: ________________________________,
            ______/______/________
          </Text>

          <View style={styles.assinaturasContainer}>
            <View style={styles.assinaturaBox}>
              <View style={styles.assinaturaLinha} />
              <Text>Contratante</Text>
            </View>
            <View style={styles.assinaturaBox}>
              <View style={styles.assinaturaLinha} />
              <Text>LM Prime (Contratada)</Text>
            </View>
          </View>
        </View>

        <Text style={styles.rodape}>template_versao: {VERSAO_TEMPLATE}</Text>
      </Page>
    </Document>
  );
}
