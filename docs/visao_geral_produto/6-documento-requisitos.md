# Documento de Requisitos do Sistema  
**LM Prime System – Gestão e Controle de Atendimento**

---

# 1. Requisitos Funcionais (RF)

## 1.1 Autenticação e Controle de Usuários

### RF01 – Autenticação de Usuários
O sistema deve permitir que usuários acessem a aplicação mediante autenticação por login e senha.

### RF02 – Cadastro de Usuários Atendentes
O sistema deve permitir o cadastro de usuários atendentes com credenciais individuais de acesso.

### RF03 – Controle de Acesso por Perfis
O sistema deve permitir definir perfis de acesso, como administrador (acesso total) e atendente (acesso limitado às funcionalidade de negócio), controlando as permissões de cada usuário dentro do sistema.

### RF04 – Recuperação de Senha
O sistema deve permitir que o usuário recupere sua senha através da funcionalidade **“Esqueci minha senha”**.

### RF05 – Encerrar Sessão
O sistema deve permitir que o usuário encerre sua sessão através da funcionalidade de **logout**.

### RF06 – Exclusão de Conta de Usuário
O sistema deve permitir excluir contas de usuários cadastrados.

### RF07 – Solicitação de Remoção de Dados Pessoais
O sistema deve permitir que o usuário solicite a remoção de seus dados pessoais armazenados no sistema.

---

# 1.2 Gestão de Clientes

### RF08 – Cadastrar Cliente
O sistema deve permitir cadastrar clientes contendo dados como **nome, telefone, e-mail, CPF/CNPJ e endereço**.

### RF09 – Listar Clientes e Visualizar Cadastro Completo
O sistema deve permitir visualizar uma lista de clientes cadastrados e permitir visualizar os dados completos de um cliente ao selecioná-lo.

### RF10 – Pesquisar e Filtrar Clientes
O sistema deve permitir pesquisar clientes por **nome ou identificador**, e também permitir aplicar **filtros na listagem de clientes**.

### RF11 – Manutenção de Clientes
O sistema deve permitir **editar e excluir registros de clientes cadastrados**.

---

# 1.3 Gestão de Atendimentos

### RF12 – Iniciar Novo Atendimento
O sistema deve permitir iniciar um novo atendimento por meio da opção **“Novo Atendimento”**, iniciando uma solicitação de serviço feita por um cliente ou lead.

### RF13 – Registro da Solicitação de Serviço
O sistema deve permitir registrar informações da solicitação, como **data do contato, origem, destino, horário, quantidade de passageiros, necessidade de emissão de NF-e e tipo de serviço**.

### RF14 – Validar Campos Obrigatórios
O sistema deve validar o preenchimento de **campos obrigatórios** antes de salvar registros.

### RF15 – Manutenção da Solicitação
O sistema deve permitir **editar dados da solicitação registrada, limpar campos e salvar alterações**.

### RF16 – Encerrar Atendimento
O sistema deve permitir **encerrar um atendimento em qualquer etapa do atendimento**.

---

# 1.4 Gestão de Orçamentos

### RF17 – Registrar Orçamento
O sistema deve permitir registrar um **orçamento associado a uma solicitação de serviço**.

### RF18 – Registrar Dados do Orçamento
O sistema deve permitir registrar **valor total, forma de pagamento, prazo de validade do pagamento e veículos previstos para execução do serviço (tipos e quantidade)**.

### RF19 – Manutenção de Orçamentos
O sistema deve permitir **editar um orçamento registrado ou cancelar um orçamento manualmente**.

### RF20 – Cancelamento Automático de Orçamento
O sistema deve **cancelar automaticamente orçamentos após sete dias sem confirmação**.

### RF21 – Associar Orçamento a Cliente ou Lead
O sistema deve permitir registrar **orçamentos para clientes cadastrados ou leads (interessados ainda não cadastrados como clientes)**.

---

# 1.5 Gestão de Reservas

### RF22 – Converter Orçamento em Reserva
O sistema deve permitir **converter um orçamento aprovado em uma reserva**, avançando assim as etapas/seções.

### RF23 – Registrar Dados da Reserva e Completar Cadastro do Lead
O sistema deve registrar as informações da reserva confirmada após coletar **dados adicionais apenas dos leads (RG/IE, CPF/CNPJ, endereço)** passando-os para um novo cliente.

### RF24 – Atualizar Status para Aguardando Reserva e para Reserva Registrada
O sistema deve atualizar automaticamente o **status do atendimento** ao confirmar um orçamento e entrar na etapa de reserva.  
Entra como **Aguardando Reserva** e após registrar, passa para **Reserva Registrada Aguardando Escala**.

### RF25 – Manutenção de Reservas
O sistema deve permitir **editar ou cancelar reservas registradas**.

---

# 1.6 Gestão de Escala Operacional

### RF26 – Registrar Escala Operacional
O sistema deve permitir registrar a **escala responsável pela execução do serviço associado a uma reserva registrada**.

### RF27 – Associação de Recursos Operacionais
O sistema deve permitir associar **motoristas, veículos e empresas parceiras (quando for terceirizar)** ao serviço a ser executado.
Para esses três recursos, deve haver **cadastro prévio no sistema com as informações básicas pertinentes a cada entidade**.

### RF28 – Manutenção da Escala Operacional
O sistema deve permitir **editar informações da escala registrada**.

---

# 1.7 Gestão de Contratos

### RF29 – Gerar Contrato de Serviço
O sistema deve gerar **contratos de prestação de serviço a partir de um modelo definido utilizando dados específicos do atendimento**.

### RF30 – Geração e Download de Contrato em PDF
O sistema deve gerar contratos no **formato PDF** e permitir que os usuários realizem o **download do documento**.

### RF31 – Consulta de Contratos
O sistema deve permitir **listar, pesquisar e filtrar (por cliente e datas) contratos gerados no sistema**.

---

# 1.8 Controle de Status do Atendimento

### RF32 – Gerenciar Atendimento por ID Único
O sistema deve atribuir um **identificador único a cada atendimento**.

### RF33 – Atualizar e Exibir Status do Atendimento
O sistema deve **atualizar automaticamente o status do atendimento conforme o avanço das etapas** entre as seções do atendimento e **exibir em evidência nas seções o status atual do atendimento**.

---

# 1.9 Dashboard e Indicadores

### RF34 – Exibir Dashboard Inicial
O sistema deve apresentar **na tela inicial um dashboard com indicadores operacionais**.

### RF35 – Visualização de Indicadores
O sistema deve permitir visualizar métricas como:

- quantidade de atendimentos
- conversão em orçamentos
- conversão em reservas
- cancelamentos
- serviços realizados
- recursos operacionais mais utilizados

com possibilidade de **filtragem por período** e visualização de **veículos, motoristas e parceiros mais utilizados**.

### RF36 – Exibir Histórico de Serviços
O sistema deve apresentar **histórico de serviços executados**.

---

# 2. Requisitos Não Funcionais (RNF)

Os requisitos não funcionais descrevem **características de qualidade, restrições tecnológicas e padrões de funcionamento do sistema**, que não estão diretamente relacionados às funcionalidades, mas que são essenciais para garantir **segurança, desempenho, usabilidade e manutenibilidade da aplicação**.

---

# 2.1 Arquitetura e Estrutura do Sistema

### RNF01 – Arquitetura em Camadas
O sistema deve ser desenvolvido utilizando **arquitetura em camadas**, separando as responsabilidades entre:

- interface de usuário (frontend)
- lógica de negócio (backend)
- acesso a dados (banco de dados)

Essa separação permite **maior organização do código, facilidade de manutenção e escalabilidade do sistema**.

### RNF02 – Aplicação Web
O sistema deve ser desenvolvido como **aplicação web**, acessível por meio de **navegadores de internet**, sem necessidade de instalação de software no computador do usuário.

Isso garante **maior acessibilidade e facilidade de utilização**.

### RNF03 – Organização Modular do Código
O código-fonte do sistema deve ser estruturado de forma **modular**, organizando funcionalidades em **componentes e módulos independentes**.

Essa abordagem facilita:

- manutenção
- reutilização de código
- evolução do sistema

---

# 2.2 Infraestrutura e Hospedagem

### RNF04 – Hospedagem em Ambiente Cloud
O sistema deve ser hospedado em **infraestrutura de computação em nuvem**, garantindo:

- acesso remoto
- maior disponibilidade
- facilidade de implantação e atualização do sistema

### RNF05 – Banco de Dados Relacional
O sistema deve utilizar um **banco de dados relacional** para armazenar as informações da aplicação, garantindo:

- integridade dos dados
- consistência
- suporte a consultas estruturadas

### RNF06 – Persistência em PostgreSQL
O sistema deve utilizar o **PostgreSQL** como sistema gerenciador de banco de dados, aproveitando seus recursos de **confiabilidade, segurança, escalabilidade e suporte a transações**.

---

# 2.3 Segurança da Informação

### RNF07 – Criptografia de Senhas
As senhas dos usuários devem ser armazenadas no banco de dados utilizando **mecanismos de criptografia ou hashing seguro**, garantindo que informações sensíveis não sejam armazenadas em formato legível.

### RNF08 – Comunicação Segura via HTTPS
O sistema deve utilizar **protocolo HTTPS** para comunicação entre cliente e servidor, garantindo que os dados transmitidos estejam protegidos contra interceptação.

### RNF09 – Controle de Acesso por Perfil
O sistema deve implementar **controle de acesso baseado em perfis de usuário**, restringindo o acesso a determinadas funcionalidades de acordo com o tipo de usuário autenticado no sistema.

---

# 2.4 Usabilidade e Experiência do Usuário

### RNF10 – Interface Intuitiva
A interface do sistema deve ser desenvolvida de forma **simples, clara e intuitiva**, permitindo que os usuários realizem suas tarefas com facilidade e reduzindo a necessidade de treinamento.

### RNF11 – Navegação por Etapas
O sistema deve apresentar as **etapas do atendimento de forma organizada e sequencial**, facilitando o acompanhamento do processo e evitando erros operacionais durante o fluxo de atendimento.

---

# 2.5 Integração com Serviços Externos

### RNF12 – Integração com API de Consulta de CEP
O sistema deve integrar-se a uma **API externa de consulta de CEP**, permitindo a obtenção automática de informações de endereço a partir do código postal informado pelo usuário.

### RNF13 – Preenchimento Automático de Endereço
Ao informar o **CEP no cadastro de clientes**, o sistema deve preencher automaticamente os campos de endereço, como:

- rua
- bairro
- cidade
- estado

utilizando os dados retornados pela API de consulta.

---

# 2.6 Manutenibilidade e Controle de Versão

### RNF14 – Versionamento de Código
O código-fonte do sistema deve ser mantido em um **repositório de versionamento**, permitindo:

- controle de alterações
- colaboração entre desenvolvedores
- rastreabilidade de modificações realizadas no sistema

### RNF15 – Padronização de Código
O desenvolvimento do sistema deve seguir **padrões de qualidade e organização de código**, utilizando ferramentas de análise estática e boas práticas de programação para garantir **legibilidade, manutenção e consistência do software**.