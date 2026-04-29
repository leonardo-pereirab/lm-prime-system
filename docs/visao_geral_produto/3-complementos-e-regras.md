# Complementos, Requisitos e Regras do Sistema

## Login e Controle de Acesso

- **Autenticação:** via login e senha para ambos os tipos de usuários.

- **Administrador do sistema (eu):**  
  Deve possuir **controle de acesso total**.

- **Atendentes:**  
  Deve permitir um **cadastro simples no sistema para cada atendente**, com:

  - credenciais únicas de acesso;
  - meio de recuperação de acesso (**"esqueci minha senha"**);
  - criptografia;
  - logout;
  - meio de exclusão de conta;
  - solicitação de remoção dos dados pessoais do banco de dados (segundo a **LGPD**).

  O controle de acesso dos(as) atendentes pode ser **quase total**, restringindo-os apenas de **configurações do sistema que não façam sentido para eles(as)** e liberando tudo o que se refere **ao negócio em si**.

---

# Tela Inicial

A **página inicial do sistema** deve conter, além das principais seções e menus, um **Dashboard informativo**, que servirá de relatório para análise de dados, como:

- quantos **atendimentos/solicitações** foram feitos;
- quantos **viraram orçamento**;
- quantos **foram cancelados**;
- quantos **viraram reservas**;
- quantas **foram concluídas**;
- **histórico de locações**;
- **veículos, motoristas e parceiros mais utilizados**.

O dashboard deve permitir **interagir e filtrar períodos**, por exemplo.

Inicialmente com essas informações, mas podendo ser **escalável futuramente** com outras informações, como:

- valores que entraram (**receita**);
- outras análises relevantes para o negócio.

---

## Menu Principal

Deve conter:

- nome do usuário logado;
- botão **"Signout"** para encerrar a sessão;
- botão **"Configurações"** para acessar configurações do sistema;
- botão **"Dashboard"** para abrir o dashboard em uma tela exclusiva;
- botão **"Contratos"** para listar o histórico de contratos já gerados em **PDF**.

### Listagem de Contratos

Os contratos devem ser titulados no formato: contrato_cliente_data


A listagem deve conter:

- sistema de **filtros por cliente e data**;
- botões laterais de:
  - visualizar
  - baixar
  - excluir

---

## Entidades Gerenciáveis

O menu principal também deve conter **botões de acesso a todas as entidades gerenciáveis do sistema**, levando aos seus respectivos **sistemas de CRUD**, de acordo com as particularidades de cada entidade.

---

## Botões Fixos de Ação

Devem existir **3 botões em destaque fixos na tela**, independentemente da rolagem:

1. **Novo Atendimento**  
   - botão principal do sistema;
   - deve ficar em evidência;
   - representa a entidade que **gerencia o negócio e avança em etapas para alteração de status**.

2. **Fila de Orçamentos**

3. **Fila de Reservas em Andamento**

---

# Fluxo de Evolução de Status

Todo o gerenciamento dessa parte acontece **dentro do mesmo registro em Atendimentos (ID único)**.

Na **tabela Atendimentos**, o campo **status** muda conforme a etapa/seção/tela do atendimento.

### Fluxo de Status

O atendimento deve seguir o fluxo: Solicitação → Orçamento → Reserva → Escala → Serviço

O status do atendimento, a cada registro nas etapas, segue por: 

→ Em Solicitação
→ Aguardando Orçamento
→ Orçamento Registrado e Aguardando Aprovação

Após cliente aprovar orçamento: 
→ Aguardando Reserva
→ Reserva Registrada e Aguardando Escala 
→ Escala Definida
→ Serviço em andamento 
→ Serviço Finalizado

OBS.: Um atendimento pode ser cancelado em diferentes etapas do fluxo, gravando o momento em que foi cancelado (status) e registrando como:
→ Atendimento Cancelado

Para cada fase do atendimento, pode ser utilizado um **fluxo de etapas semelhante ao utilizado em sistemas de compras online/e-commerce**, onde o cliente avança entre seções/telas como: Entrega → Pagamento → Confirmação

Ou seja, algo similar a um **fluxo multi-step checkout**.

---

## Confirmação de Ações

Todos os botões do sistema devem pedir **confirmação da ação através de uma mensagem de confirmação**, incluindo:

- **Salvar Alterações**
- **Ir para a próxima etapa**
- **Cancelar e Sair**
- **Encerrar**
- **Voltar**

---

## Navegação entre Etapas do Atendimento

Ao entrar em **"Novo Atendimento"**, deve existir um **menu suspenso com as etapas/seções do atendimento**, permitindo:

- navegação direta entre as etapas;
- acesso por clique no botão da etapa desejada.

Cada etapa deve **trazer informações das etapas anteriores**.