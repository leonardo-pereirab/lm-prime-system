# Funcionalidades

## Funcionalidades Principais

- Cadastro e gerenciamento de clientes;
- Cadastro e gerenciamento de motoristas;
- Cadastro e gerenciamento de veículos;
- Cadastro e gerenciamento de empresas parceiras;
- Registro de solicitações de serviço e atendimento;
- Registro e controle de orçamentos de serviços;
- Conversão de orçamentos em reservas confirmadas;
- Atualização de status do atendimento a cada etapa do processo de atendimento;
- Definição de escala de motoristas, veículos e parceiros para execução dos serviços;
- Geração de contratos em formato digital para formalização dos serviços;
- Dashboard com indicadores do negócio, como, por exemplo, quantidade de atendimentos, orçamentos realizados, reservas confirmadas e histórico de serviços.

---

# Detalhamento das Funcionalidades

## Cadastro e gerenciamento de clientes

Essa funcionalidade permite realizar o cadastro completo de clientes que solicitam serviços à empresa.

O sistema armazenará informações como:

- nome
- telefone
- documento (CPF ou CNPJ)
- endereço
- e-mail
- outros dados necessários para contato e formalização de contratos

Além do cadastro inicial, também será possível consultar clientes já registrados em uma lista com:

- sistema de pesquisa por nome
- sistema de pesquisa por ID
- sistema de filtros para pesquisa de clientes:
  - de A a Z
  - de Z a A
  - mais recentes
  - mais antigos

Na lista ainda será possível:

- selecionar um cliente para visualizar seu cadastro completo
- editar seus dados
- excluí-lo do sistema

Mantendo sempre um **histórico organizado** para facilitar atendimentos futuros.

---

## Cadastro e gerenciamento de motoristas

Essa funcionalidade permite realizar o cadastro e gerenciamento dos **motoristas disponíveis para execução dos serviços** prestados pela empresa.

O sistema armazenará informações básicas necessárias para identificação e contato do motorista, como:

- nome completo
- telefone para contato
- documento de identificação
- número da CNH
- categoria da CNH
- data de validade da CNH
- observações gerais

Os motoristas cadastrados ficarão disponíveis para **consulta e seleção durante a etapa de definição de escala**, quando um serviço precisar ser atribuído a um motorista específico.

Além do cadastro inicial, o sistema deverá permitir:

- visualizar a lista de motoristas cadastrados
- pesquisar motoristas por nome ou por ID
- aplicar filtros de ordenação (de A a Z, de Z a A, mais recentes e mais antigos)

Também será possível:

- visualizar o cadastro completo de um motorista
- editar suas informações
- excluí-lo do sistema

Essa funcionalidade garante que os motoristas estejam previamente cadastrados no sistema, permitindo que sejam facilmente selecionados durante a organização da escala operacional dos serviços.

---

## Cadastro e gerenciamento de veículos

Essa funcionalidade permite realizar o cadastro e gerenciamento dos **veículos disponíveis para a realização dos serviços de transporte**.

O sistema armazenará informações básicas sobre cada veículo, como:

- tipo de veículo
- modelo
- placa
- capacidade de passageiros
- ano do veículo
- observações gerais

Os veículos cadastrados ficarão disponíveis para **consulta e seleção durante a etapa de definição de escala**, quando for necessário definir qual veículo será utilizado para a execução do serviço.

Além do cadastro inicial, o sistema deverá permitir:

- visualizar a lista de veículos cadastrados
- pesquisar veículos por placa ou por ID
- aplicar filtros de ordenação (de A a Z, de Z a A, mais recentes e mais antigos)

Também será possível:

- visualizar o cadastro completo de um veículo
- editar suas informações
- excluí-lo do sistema

Essa funcionalidade permite manter um **controle organizado da frota da empresa**, facilitando o planejamento operacional dos serviços.

---

## Cadastro e gerenciamento de empresas parceiras

Essa funcionalidade permite realizar o cadastro e gerenciamento das **empresas parceiras que podem ser acionadas quando a empresa não possuir veículos suficientes ou o tipo de veículo solicitado pelo cliente**.

O sistema armazenará informações básicas dessas empresas, como:

- nome da empresa
- telefone para contato
- documento da empresa (CNPJ)
- endereço
- observações gerais

As empresas parceiras cadastradas ficarão disponíveis para **consulta e seleção durante a etapa de definição de escala**, quando um serviço precisar ser terceirizado.

Além do cadastro inicial, o sistema deverá permitir:

- visualizar a lista de empresas parceiras cadastradas
- pesquisar empresas por nome ou por ID
- aplicar filtros de ordenação (de A a Z, de Z a A, mais recentes e mais antigos)

Também será possível:

- visualizar o cadastro completo da empresa parceira
- editar suas informações
- excluí-la do sistema

Essa funcionalidade permite manter um **registro organizado das parcerias operacionais da empresa**, facilitando a terceirização de serviços quando necessário.

---

## Registro de solicitações de serviço e atendimento

Essa funcionalidade é utilizada no momento do **primeiro contato com o cliente**.

Durante o atendimento, o(a) atendente registra informações essenciais da solicitação, como:

- data do contato
- local ou locais de saída
- horário de saída
- destino(s)
- quantidade de passageiros
- tipo de serviço solicitado

O objetivo é **centralizar essas informações no sistema** para que possam ser utilizadas posteriormente no processo de **elaboração do orçamento e acompanhamento do atendimento**.

---

## Registro e controle de orçamentos de serviços

Após o registro da solicitação de serviço, o sistema permitirá **cadastrar o orçamento correspondente ao avançar a etapa do atendimento**.

Serão registrados dados como:

- valor total do serviço
- forma de pagamento
- prazo de vencimento
- tipo(s) de veículo(s) que será(ão) utilizado(s) e quantidade de cada

O sistema manterá esses registros por um **tempo determinado**, colocando uma **validade de 7 dias corridos** para cada orçamento a partir do momento de seu registro.

Após esse tempo, o **atendimento é encerrado**.

Atendimentos encerrados ainda terão seus **registros mantidos no sistema**, de acordo com o status em que foram encerrados, permitindo:

- consultas futuras
- geração de insights para relatórios da empresa

---

## Conversão de orçamentos em reservas confirmadas

Quando o cliente **confirma o orçamento apresentado**, o sistema possibilita a **conversão desse orçamento em uma reserva de serviço em andamento**.

Nesse momento:

- o **status do atendimento é atualizado**
- podem ser registrados **dados adicionais do cliente**, caso necessário, como:
  - documentos pessoais
  - endereço

Essa etapa **formaliza a contratação** e garante que o serviço seja **incluído na programação operacional da empresa**.

---

## Atualização de status do atendimento

O sistema utiliza um **mecanismo de status** para representar o **estágio atual de cada etapa do atendimento**, do início ao fim.

Entre os principais estados estão:

- solicitação registrada
- aguardanndo orçamento
- orçamento enviado
- orçamento cancelado
- aguardando reserva
- reserva confirmada
- reserva cancelada
- em definição de escala
- serviço em andamento
- serviço finalizado
- atendimento cancelado

Esse controle facilita:

- o **acompanhamento do fluxo de trabalho**
- a **identificação rápida da etapa em que cada atendimento se encontra**

---

## Definição de escala de motoristas, veículos e parceiros

Após a confirmação da reserva, o sistema permitirá **definir a escala operacional responsável pela realização do serviço**.

Nessa etapa será possível:

- selecionar o **motorista**
- selecionar o **veículo**
- indicar **empresas parceiras e seus veículos**, caso o serviço seja terceirizado

As informações da escala poderão ser **editadas até a data do serviço**, permitindo **ajustes operacionais quando necessário**.

---

## Geração de contratos em formato digital

O sistema contará com uma funcionalidade de **geração automática de contratos de prestação de serviço**.

A partir dos dados cadastrados desde o atendimento até a reserva, o sistema:

- preencherá um **modelo de contrato previamente definido**
- gerará um documento em **formato digital (PDF)**

Esse documento poderá ser:

- **baixado**
- **enviado manualmente ao cliente**

para **formalização do serviço**.

---

## Dashboard com indicadores do negócio

O sistema disponibilizará um **dashboard com indicadores que auxiliam na análise da operação da empresa**.

Entre as informações exibidas estarão:

- quantidade de atendimentos registrados
- orçamentos realizados
- reservas confirmadas
- histórico de serviços executados
- recursos operacionais mais usados (motoristas, veículos, parceiros)

O painel poderá permitir **filtragem por períodos específicos**, possibilitando:

- uma **visão mais clara da evolução das atividades**
- análise do **desempenho do negócio**.