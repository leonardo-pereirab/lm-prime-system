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
            Prestação de serviços de transporte com motorista
          </Text>
          <Text style={styles.contratoNumero}>
            Contrato No {dados.codigoAtendimento}
          </Text>
          <Text style={styles.empresaLinha}>
            Data de geração: {dados.dataGeracao}
          </Text>
        </View>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>1. Identificação das partes</Text>
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
          <Text style={styles.secaoTitulo}>2. Objeto do serviço</Text>
          <Text style={styles.linha}>
            Serviço contratado: {dados.tipoServico}. Passageiros previstos:{" "}
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
            horário e trajetos informados, observando normas de segurança,
            legislação vigente e condições operacionais registradas no
            atendimento.
          </Text>
          <Text style={styles.clausula}>
            4.2 Alterações de itinerário, horários, quantidade de passageiros ou
            demais informações do serviço devem ser solicitadas com antecedência
            mínima de 24 horas, ficando sujeitas a avaliação de disponibilidade,
            viabilidade operacional e eventual reavaliação comercial.
          </Text>
          <Text style={styles.clausula}>
            4.3 Em caso de cancelamento após confirmação da reserva, aplicam-se
            as condições operacionais e comerciais registradas no atendimento.
          </Text>
          {dados.observacoes ? (
            <Text style={styles.clausula}>
              4.4 Observações adicionais: {dados.observacoes}.
            </Text>
          ) : null}
        </View>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>
            5. Privacidade, proteção de dados e direitos do cliente
          </Text>
          <Text style={styles.clausula}>
            5.1 Para fins de execução do presente contrato de prestação de
            serviço de transporte, o CLIENTE declara estar ciente de que a
            CONTRATADA poderá tratar seus dados pessoais e informações
            relacionadas ao serviço contratado, incluindo, quando aplicável,
            nome completo, CPF ou CNPJ, RG ou inscrição estadual, telefone,
            e-mail, endereço, locais de saída, destino e retorno, datas,
            horários, quantidade de passageiros, informações de orçamento,
            reserva, contrato e demais dados necessários a adequada prestação do
            serviço.
          </Text>
          <Text style={styles.clausula}>
            5.2 Os dados pessoais informados pelo CLIENTE serão utilizados para
            finalidades relacionadas ao atendimento, elaboração de orçamento,
            confirmação de reserva, emissão do contrato, execução do serviço,
            comunicação entre as partes, organização operacional, manutenção de
            histórico, geração de registros internos e cumprimento de obrigações
            legais, contratuais ou regulatórias aplicáveis.
          </Text>
          <Text style={styles.clausula}>
            5.3 A CONTRATADA compromete-se a tratar os dados pessoais do CLIENTE
            em conformidade com a Lei Geral de Proteção de Dados Pessoais -
            LGPD, adotando medidas técnicas e administrativas razoáveis para
            proteger tais dados contra acesso não autorizado, perda, alteração,
            divulgação indevida ou tratamento inadequado.
          </Text>
          <Text style={styles.clausula}>
            5.4 O CLIENTE declara estar ciente de que determinados dados
            pessoais e informações operacionais poderão ser compartilhados com
            usuários internos autorizados, motoristas, parceiros operacionais,
            prestadores de tecnologia ou terceiros estritamente envolvidos na
            prestação contratada, quando necessário para organização da escala,
            definição de veículo, comunicação operacional, deslocamento,
            identificação do serviço contratado e cumprimento das obrigações
            assumidas entre as partes.
          </Text>
          <Text style={styles.clausula}>
            5.5 O CLIENTE, na qualidade de titular de dados pessoais, poderá
            solicitar a confirmação da existência de tratamento, o acesso aos
            seus dados pessoais, a correção ou atualização de dados incompletos,
            inexatos ou desatualizados, informações sobre eventual
            compartilhamento, bem como a anonimização, bloqueio ou eliminação de
            dados desnecessários, excessivos ou tratados em desconformidade,
            conforme aplicável e nos termos da LGPD.
          </Text>
          <Text style={styles.clausula}>
            5.6 Quando o CLIENTE solicitar a exclusão de seus dados pessoais, a
            CONTRATADA avaliará se os dados ainda são necessários para execução
            do contrato, cumprimento de obrigação legal ou regulatória,
            manutenção de histórico operacional, preservação de documentos
            contratuais, exercício regular de direitos ou defesa de interesses
            da empresa. Quando a exclusão total não for possível ou adequada, a
            CONTRATADA poderá realizar a anonimização dos dados pessoais do
            CLIENTE.
          </Text>
          <Text style={styles.clausula}>
            5.7 A anonimização consiste na substituição ou descaracterização de
            informações que identifiquem diretamente o titular, preservando,
            quando necessário, registros operacionais não identificáveis
            relacionados ao atendimento, contrato, serviço, relatório, indicador
            ou histórico da empresa. O CLIENTE declara estar ciente de que a
            anonimização realizada nos registros do sistema não altera
            automaticamente documentos digitais já gerados anteriormente, como
            contratos em PDF.
          </Text>
          <Text style={styles.clausula}>
            5.8 A CONTRATADA poderá manter determinados dados pessoais e
            registros relacionados ao CLIENTE quando tal manutenção for
            necessária para cumprimento de obrigação legal ou regulatória,
            execução do contrato, preservação de histórico operacional,
            comprovação da prestação do serviço, exercício regular de direitos,
            defesa em eventual processo administrativo, judicial ou
            extrajudicial, ou proteção de seus interesses legítimos.
          </Text>
          <Text style={styles.clausula}>
            5.9 Solicitações relacionadas a privacidade, proteção de dados,
            atualização cadastral, acesso, correção, exclusão, anonimização ou
            esclarecimentos sobre o tratamento de dados pessoais poderão ser
            encaminhadas pelo CLIENTE ao canal de contato:
            primeiralocadora@gmail.com, aos cuidados de Lilian Danielle Pereira.
            A CONTRATADA poderá solicitar informações adicionais para confirmar
            a identidade do solicitante e evitar acesso indevido a dados
            pessoais de terceiros.
          </Text>
          <Text style={styles.clausula}>
            5.10 Informações adicionais sobre privacidade, proteção de dados,
            segurança da informação, direitos dos titulares e responsabilidades
            dos usuários internos estão disponíveis em:
            https://lm-prime-system.vercel.app/termos-politicas-seguranca.
          </Text>
          <Text style={styles.clausula}>
            5.11 Ao firmar o presente contrato, o CLIENTE declara estar ciente
            de que seus dados pessoais serão tratados pela CONTRATADA para
            finalidades relacionadas à prestação do serviço contratado, à
            comunicação entre as partes, à formalização contratual, à execução
            operacional, à manutenção de histórico, ao cumprimento de obrigações
            legais e à defesa de direitos.
          </Text>
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
