# Regras de Negócio (RN)

## RN01 – Identificador Único de Atendimento

Cada atendimento deve possuir um identificador único.

---

## RN02 – Fluxo Sequencial de Atendimento e de Status

O atendimento deve seguir o fluxo:

**Solicitação → Orçamento → Reserva → Escala → Serviço**

Com o status, a cada registro nas etapas, indo de:

**Em Solicitação → Aguardando Orçamento → Orçamento Registrado e Aguardando Aprovação**

Após cliente aprovar orçamento:

**Aguardando Reserva → Reserva Registrada e Aguardando Escala → Escala Definida → Serviço em andamento → Serviço Finalizado**

OBS.: Um atendimento pode ser cancelado em diferentes etapas do fluxo, gravando o momento em que foi cancelado (status) e registrando como:
→ Atendimento Cancelado

---

## RN03 – Validade do Orçamento

Todo orçamento possui validade de sete dias corridos.

---

## RN04 – Conversão de Orçamento em Reserva

Um orçamento só pode ser convertido em reserva após confirmação do cliente.

---

## RN05 – Cadastro Completo de Cliente

Um lead só deve ser convertido em cliente após confirmar seu primeiro serviço.

---

## RN06 – Persistência de Registros

Solicitações, orçamentos, reservas e escalas não podem ser excluídos e todos os atendimentos devem permanecer registrados no sistema para fins de análise e relatórios..

---

## RN07 – Escala Editável

A escala pode ser alterada até a data de execução do serviço.

---

## RN08 – Cancelamento de Atendimento

Um atendimento pode ser cancelado em diferentes etapas do fluxo, gravando o momento em que foi cancelado (status).

---

## RN09 – Salvamento Condicional

Nenhuma etapa pode ser salva sem o preenchimento dos campos obrigatórios.