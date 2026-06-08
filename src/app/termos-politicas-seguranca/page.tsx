import Link from "next/link";

export const metadata = {
  title: "Termos e politicas de seguranca | LM Prime System",
};

export default function TermosPoliticasSegurancaPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold text-neutral-900">
          Termos, políticas de segurança e proteção de dados
        </h1>
        <p className="text-sm text-neutral-600">
          Documento público de referência sobre o uso do LM Prime System,
          tratamento de dados pessoais, segurança da informação, direitos dos
          titulares e responsabilidades dos usuários internos.
        </p>
      </header>

      <section className="space-y-6 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-neutral-900">
            1. Apresentação e finalidade da página
          </h2>
          <p className="text-sm leading-6 text-neutral-700">
            Esta página apresenta, de forma resumida, os termos, políticas e
            diretrizes de privacidade, proteção de dados e segurança da
            informação aplicáveis ao LM Prime System — Gestão e Controle de
            Atendimento. O sistema é uma aplicação web utilizada pela LM Prime
            para apoiar a gestão de atendimentos, clientes, funcionários,
            motoristas, veículos, parceiros, orçamentos, reservas, escalas,
            contratos e histórico operacional dos serviços prestados.
          </p>
          <p className="text-sm leading-6 text-neutral-700">
            Embora o sistema seja destinado ao uso interno por usuários
            autorizados, esta página também serve como referência pública para
            clientes e demais titulares de dados pessoais que desejem
            compreender como seus dados podem ser tratados no contexto dos
            serviços prestados pela empresa.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-neutral-900">
            2. Política de Privacidade e Proteção de Dados
          </h2>
          <p className="text-sm leading-6 text-neutral-700">
            O LM Prime System poderá tratar dados pessoais de clientes,
            solicitantes de serviços, funcionários, usuários internos,
            motoristas, parceiros operacionais e seus eventuais contatos. O
            sistema também poderá tratar dados de veículos vinculados à
            operação, especialmente quando associados a pessoas naturais.
          </p>
          <p className="text-sm leading-6 text-neutral-700">
            Entre os dados tratados podem estar nome completo, CPF ou CNPJ, RG
            ou inscrição estadual, telefone, e-mail, endereço, dados da
            solicitação de serviço, locais de saída, destino e retorno, datas,
            horários, quantidade de passageiros, informações de orçamento,
            reserva, contrato, dados de CNH de motoristas, dados cadastrais de
            funcionários, dados de parceiros e informações operacionais
            necessárias à execução dos serviços.
          </p>
          <p className="text-sm leading-6 text-neutral-700">
            Esses dados são utilizados para registrar solicitações, elaborar
            orçamentos, confirmar reservas, formalizar contratos, executar
            serviços, definir escalas operacionais, manter histórico de
            atendimentos, gerar indicadores internos, permitir o acesso seguro
            de funcionários autorizados e atender solicitações relacionadas aos
            direitos dos titulares.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-neutral-900">
            3. Bases legais e compartilhamento de dados
          </h2>
          <p className="text-sm leading-6 text-neutral-700">
            O tratamento de dados pessoais no LM Prime System poderá se
            fundamentar, conforme o caso, na execução de contrato ou de
            procedimentos preliminares relacionados a contrato, no cumprimento
            de obrigação legal ou regulatória, no legítimo interesse da empresa,
            no exercício regular de direitos e no consentimento, quando alguma
            situação específica exigir autorização expressa do titular.
          </p>
          <p className="text-sm leading-6 text-neutral-700">
            Os dados pessoais poderão ser compartilhados apenas quando
            necessário para as finalidades informadas, incluindo o acesso por
            funcionários autorizados, motoristas responsáveis pela execução dos
            serviços, parceiros operacionais, prestadores de tecnologia
            utilizados na hospedagem, armazenamento e funcionamento do sistema,
            autoridades públicas quando houver obrigação legal, ou terceiros
            estritamente necessários para cumprimento de contrato, defesa de
            direitos ou execução do serviço contratado.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-neutral-900">
            4. Termo de Uso do Sistema
          </h2>
          <p className="text-sm leading-6 text-neutral-700">
            O acesso ao LM Prime System é restrito a usuários previamente
            autorizados pela empresa, conforme perfil definido pela LM Prime. O
            sistema poderá ser utilizado por administradores, gerentes e
            atendentes, de acordo com as permissões atribuídas a cada perfil.
          </p>
          <p className="text-sm leading-6 text-neutral-700">
            O sistema deve ser utilizado exclusivamente para finalidades
            profissionais e operacionais, como registrar atendimentos e
            solicitações de clientes, cadastrar e consultar clientes, registrar
            orçamentos e reservas, definir escalas de motoristas, veículos e
            parceiros, gerar contratos, consultar histórico de atendimentos,
            acompanhar indicadores do negócio e executar atividades
            administrativas autorizadas.
          </p>
          <p className="text-sm leading-6 text-neutral-700">
            O usuário interno compromete-se a utilizar o sistema apenas para
            fins profissionais, acessar somente informações necessárias ao
            desempenho de suas atividades, manter sigilo sobre os dados pessoais
            e informações comerciais acessadas, registrar informações
            verdadeiras e atualizadas, não copiar, divulgar ou exportar dados
            sem autorização e respeitar as políticas internas de privacidade,
            segurança da informação e proteção de dados.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-neutral-900">
            5. Credenciais, perfis e responsabilidades dos usuários
          </h2>
          <p className="text-sm leading-6 text-neutral-700">
            As credenciais de acesso são pessoais, sigilosas e intransferíveis.
            Cada usuário é responsável pelas ações realizadas com sua conta,
            devendo proteger login e senha, não compartilhar credenciais, não
            utilizar conta de outro funcionário, não permitir acesso de
            terceiros não autorizados e não tentar acessar áreas, dados ou
            funcionalidades fora de sua autorização.
          </p>
          <p className="text-sm leading-6 text-neutral-700">
            O sistema poderá possuir perfis como administrador, gerente e
            atendente. Cada perfil terá permissões compatíveis com suas
            responsabilidades. Usuários com perfil administrativo ou gerencial
            devem utilizar suas permissões com cautela, especialmente em ações
            de cadastro, edição, inativação, anonimização ou gestão de
            funcionários.
          </p>
          <p className="text-sm leading-6 text-neutral-700">
            O uso indevido do sistema poderá gerar restrição de acesso,
            inativação de usuário, apuração interna e demais medidas cabíveis,
            conforme a gravidade da conduta e o risco à segurança da informação,
            à privacidade dos titulares ou à integridade dos registros.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-neutral-900">
            6. Segurança da informação
          </h2>
          <p className="text-sm leading-6 text-neutral-700">
            A LM Prime adota medidas técnicas e administrativas proporcionais ao
            porte e à finalidade do sistema, visando proteger dados pessoais e
            informações operacionais contra acesso não autorizado, perda,
            alteração, divulgação indevida ou tratamento inadequado.
          </p>
          <p className="text-sm leading-6 text-neutral-700">
            Entre as medidas adotadas estão o uso de autenticação, controle de
            usuários autorizados, definição de perfis de acesso, restrição do
            sistema a usuários internos, utilização de banco de dados
            estruturado, armazenamento protegido de credenciais e variáveis
            sensíveis, anonimização de dados de clientes e funcionários quando
            aplicável e orientação dos usuários para uso adequado do sistema.
          </p>
          <p className="text-sm leading-6 text-neutral-700">
            As credenciais técnicas, como chaves, URLs de banco, tokens e
            variáveis de ambiente, devem ser armazenadas em locais protegidos e
            não devem ser expostas em repositórios públicos, mensagens, prints
            ou documentos sem necessidade. Ainda não há método de recuperação de
            senha disponível, sendo essa funcionalidade reconhecida como
            melhoria futura do sistema.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-neutral-900">
            7. Contratos, documentos digitais e histórico operacional
          </h2>
          <p className="text-sm leading-6 text-neutral-700">
            O sistema poderá gerar contratos e documentos digitais com base nas
            informações registradas durante o atendimento, orçamento e reserva.
            Esses documentos podem conter dados pessoais de clientes e
            informações do serviço contratado.
          </p>
          <p className="text-sm leading-6 text-neutral-700">
            Contratos e documentos gerados devem ser acessados, baixados e
            compartilhados apenas por usuários autorizados e para finalidade
            legítima. O envio de contratos ao cliente deve ocorrer com cuidado,
            evitando encaminhamento para destinatários incorretos ou canais
            inadequados.
          </p>
          <p className="text-sm leading-6 text-neutral-700">
            Contratos antigos de clientes que venham a solicitar exclusão de
            seus dados por meio de anonimização ainda poderão conter os dados
            reais existentes no momento da geração do documento. Nesses casos,
            poderão ser avaliadas medidas como arquivamento, restrição de
            acesso, substituição ou manutenção do documento, conforme a
            finalidade contratual, a necessidade de guarda e os direitos
            envolvidos.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-neutral-900">
            8. Anonimização, retenção e minimização de dados
          </h2>
          <p className="text-sm leading-6 text-neutral-700">
            O LM Prime System possui recurso de anonimização para dados de
            clientes e funcionários. A anonimização consiste na substituição ou
            descaracterização de dados pessoais identificáveis, de modo que o
            titular deixe de ser diretamente identificado nos registros do
            sistema.
          </p>
          <p className="text-sm leading-6 text-neutral-700">
            A exclusão de dados pessoais poderá ser tratada como anonimização
            quando a eliminação total comprometer registros necessários à
            operação, ao cumprimento de obrigações, à defesa de direitos ou à
            preservação de histórico legítimo da empresa. Após anonimizado, o
            registro poderá permanecer no sistema para fins de histórico
            operacional, relatórios, indicadores e preservação de informações
            não identificáveis.
          </p>
          <p className="text-sm leading-6 text-neutral-700">
            A empresa deve evitar a coleta de dados desnecessários e manter
            apenas informações compatíveis com as finalidades do sistema,
            observando a natureza da operação, a relação contratual, a
            necessidade de manutenção de histórico e eventuais obrigações
            legais.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-neutral-900">
            9. Direitos dos titulares de dados pessoais
          </h2>
          <p className="text-sm leading-6 text-neutral-700">
            Os titulares de dados pessoais poderão solicitar, conforme aplicável
            e nos termos da LGPD, confirmação da existência de tratamento,
            acesso aos dados pessoais, correção ou atualização de dados
            incompletos, inexatos ou desatualizados, anonimização, bloqueio ou
            eliminação de dados desnecessários, excessivos ou tratados em
            desconformidade, informação sobre compartilhamento de dados,
            revogação do consentimento quando o tratamento estiver baseado nessa
            hipótese e esclarecimentos sobre as finalidades de uso dos dados.
          </p>
          <p className="text-sm leading-6 text-neutral-700">
            As solicitações serão avaliadas conforme a natureza dos dados, a
            finalidade do tratamento, a existência de contrato, atendimento,
            reserva ou histórico relacionado, a necessidade de preservação
            contratual, o cumprimento de obrigações legais ou regulatórias, o
            exercício regular de direitos e a defesa de interesses da empresa.
          </p>
          <p className="text-sm leading-6 text-neutral-700">
            Antes de fornecer, alterar, excluir ou anonimizar dados pessoais, a
            empresa poderá solicitar informações adicionais para confirmar a
            identidade do titular e evitar que dados pessoais sejam acessados,
            alterados ou removidos por terceiros não autorizados.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-neutral-900">
            10. Termo de ciência e consentimento dos usuários internos
          </h2>
          <p className="text-sm leading-6 text-neutral-700">
            O acesso de usuários internos ao LM Prime System depende de
            cadastro, ativação de conta e aceite das condições aplicáveis ao uso
            da aplicação. O aceite ocorre antes do primeiro acesso e registra a
            ciência do usuário quanto ao tratamento de seus dados pessoais e às
            suas responsabilidades no uso do sistema.
          </p>
          <p className="text-sm leading-6 text-neutral-700">
            Ao aceitar os termos, o usuário interno declara estar ciente de que
            seus dados pessoais poderão ser tratados para cadastro, ativação,
            controle de acesso, autenticação, definição de permissões, segurança
            do sistema, organização interna e resguardo de direitos e interesses
            legítimos da empresa.
          </p>
          <p className="text-sm leading-6 text-neutral-700">
            O aceite não impede que determinados tratamentos sejam realizados
            com fundamento em outras bases legais previstas na LGPD, quando
            necessários à operação, à segurança do sistema, à gestão interna ou
            à defesa de direitos da empresa.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-neutral-900">
            11. Incidentes, suporte e melhorias futuras
          </h2>
          <p className="text-sm leading-6 text-neutral-700">
            Considera-se incidente de segurança qualquer evento que possa
            comprometer a confidencialidade, integridade ou disponibilidade das
            informações, como acesso indevido, vazamento de dados pessoais,
            envio de contrato para destinatário incorreto, perda ou exposição de
            credenciais, alteração indevida de registros, exclusão ou
            anonimização não autorizada, suspeita de invasão ou uso indevido da
            conta.
          </p>
          <p className="text-sm leading-6 text-neutral-700">
            Ao identificar ou suspeitar de incidente, o usuário deverá comunicar
            imediatamente o responsável interno. Ainda não há política formal e
            completa de resposta a incidentes, mas recomenda-se que a empresa
            adote medidas como identificação do evento, contenção do risco,
            registro do ocorrido, avaliação dos dados afetados, correção da
            falha, adoção de medidas preventivas e comunicação a titulares ou
            autoridades quando exigido pela legislação aplicável.
          </p>
          <p className="text-sm leading-6 text-neutral-700">
            O sistema poderá passar por melhorias contínuas, incluindo
            recuperação de senha, aperfeiçoamentos de segurança, auditoria,
            registros de atividade, política formal de resposta a incidentes,
            política de retenção e descarte de documentos e novos mecanismos de
            proteção de dados.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-neutral-900">
            12. Canal para solicitações
          </h2>
          <p className="text-sm leading-6 text-neutral-700">
            Solicitações relacionadas à privacidade, proteção de dados,
            atualização cadastral, acesso, correção, exclusão, anonimização,
            revogação de consentimento quando aplicável ou esclarecimentos sobre
            o tratamento de dados pessoais poderão ser encaminhadas pelo titular
            por meio do canal oficial da empresa.
          </p>
          <p className="text-sm leading-6 text-neutral-700">
            Canal de contato: primeiralocadora@gmail.com
            <br />
            Responsável pelo atendimento: Lilian Danielle Pereira
          </p>
          <p className="text-sm leading-6 text-neutral-700">
            A empresa poderá solicitar informações adicionais para confirmar a
            identidade do solicitante e evitar acesso indevido a dados pessoais
            de terceiros.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-neutral-900">
            13. Atualizações desta página
          </h2>
          <p className="text-sm leading-6 text-neutral-700">
            Esta página poderá ser atualizada sempre que houver alterações
            relevantes no sistema, nos processos internos, nas finalidades de
            tratamento, nas políticas da empresa ou nas exigências legais
            aplicáveis.
          </p>
          <p className="text-sm leading-6 text-neutral-700">
            Versão: 1.0
            <br />
            Data de elaboração: 30/05/2026
            <br />
            Sistema: LM Prime System — Gestão e Controle de Atendimento
          </p>
        </div>
      </section>

      <div className="mt-8 flex items-center gap-4">
        <Link
          href="/login"
          className="text-sm font-medium text-primary-700 hover:text-primary-800"
        >
          Voltar para login
        </Link>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-primary-700 hover:text-primary-800"
        >
          Ir para início
        </Link>
      </div>
    </main>
  );
}
