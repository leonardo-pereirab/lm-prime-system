# Fluxo Operacional

## O que vai ser

Será um **sistema WEB**.

---

# Principais Etapas do Processo de Atendimento

## 1. Atendimento inicial

**Objetivo:**  
Receber e registrar a solicitação de serviço do cliente; verificar e passar a disponibilidade ao cliente (se será possível fazer o serviço ou não).

### Se for possível fazer o serviço

**Dados coletados:**

- data do contato
- nome do cliente/solicitante
- telefone(s) para contato
- local ou locais de saída
- hora de saída inicial
- destino(s)
- se for ter volta, coletar os mesmos dados de saída e destino para o retorno
- quantidade de passageiros
- tipo de serviço
- se vai querer nota fiscal ou não (pois muda o valor do serviço)

**OBS.:**  
O contato inicial é feito via **telefone ou WhatsApp**, mas os registros da solicitação devem ser feitos **via sistema**.

### Fluxo

Dado início ao atendimento pelo botão **"Iniciar Novo Atendimento"**, o status do atendimento já deve entrar como **"Em Solicitação"**.

Fluxo do processo: Preencher formulários > Salvar Alterações > Ir para Orçamento

Opções disponíveis:

- **Editar Solicitação**
- **Limpar Campos**
- **Salvar Alterações**

Regras:

- Não deve salvar até todos os **campos obrigatórios** estarem preenchidos.
- Não deve permitir **excluir solicitação em nenhum lugar**, para não comprometer os relatórios.

### Botões em evidência na etapa "Solicitação"

1. **Encerrar atendimento**  
   - Encerra o atendimento por completo.  
   - Registra o status em que ele parou.  
   - Direciona o usuário para a tela inicial.

2. **Ir para Orçamento**  
   - Dá início à próxima etapa, dando continuidade ao atendimento.  
   - Só será liberado após **Salvar Alterações** do formulário.

3. **Cancelar e sair**  
   - Direciona o usuário para a tela inicial.  
   - Só é liberado se **nenhuma alteração tiver sido salva**.  
   - Após o primeiro **Salvar Alterações**, esse botão é bloqueado e só será possível **Encerrar atendimento** ou **Ir para Orçamento**.

---

# 2. Devolução e registro de orçamento

**Objetivo:**  
Passar ao cliente informações referentes a **valores e pagamento** e atualizar o status do atendimento de **"solicitação de serviço"** para **"em orçamento"**.

### Dados informados ao cliente e registrados no sistema

- valor total do serviço
- forma de pagamento
- vencimento
- tipo(s) de veículo(s)
- quantidade de veículos que será utilizada

### OBS.

O registro do orçamento deve ser feito **mesmo que o cliente fique de dar um retorno depois**, pois os registros precisam ficar salvos para possível consulta posterior caso o cliente confirme o serviço.

Deve permitir:

- registro de orçamento para **clientes já cadastrados previamente** (realizando consulta/busca);
- registro de orçamento para **interessados iniciais (leads)** que ainda não são cadastrados como clientes.

Um cliente **só deve ser cadastrado por completo no sistema após confirmar e realizar seu primeiro serviço**.

Caso o cliente não prossiga com a solicitação e orçamento e nunca mais entre em contato, **não faz sentido cadastrá-lo como cliente**.

A ideia disso é **manter o banco de dados limpo**.

### Fluxo

Um orçamento deve permanecer no status **"em orçamento" por até 7 dias corridos**, pois essa é a validade de um orçamento.

Se não for confirmado ou aprovado dentro desse prazo, o sistema deve **atualizar automaticamente o status para "Orçamento Cancelado"**.

Deve existir também a opção:

- **Cancelar Orçamento**

Fluxo do processo: Preencher formulários > Salvar Alterações > Ir para Reserva

Opções disponíveis:

- **Editar Orçamento**
- **Limpar Campos**
- **Salvar Alterações**

Regras:

- Não deve salvar até todos os **campos obrigatórios** estarem preenchidos.
- Não deve permitir **excluir orçamentos em nenhum lugar**, para não comprometer os relatórios.

---

# 3. Encerrar atendimento ou prosseguir com reserva

Depende da **confirmação do cliente**.

### Botões em evidência na etapa "Orçamento"

1. **Encerrar atendimento**

   - Se **não tiver salvado alterações de orçamento**, o sistema registra o status em que o atendimento parou na última atualização, encerra o atendimento por completo e direciona para a tela inicial.

   - Se **já tiver salvado pelo menos uma vez alterações de orçamento**, o sistema encerra o atendimento registrando o status como **"Orçamento Cancelado"** e direciona para a tela inicial.

2. **Ir para Reserva**

   - Dá início à próxima etapa, dando continuidade ao atendimento.
   - Só será liberado após clicar em **Salvar Alterações** da etapa atual.

3. **Voltar para Solicitação**

   - Permite voltar uma etapa para possíveis edições.

---

# 4. Fazer a reserva

**Objetivo:**  
Atualizar o status do atendimento de **"em orçamento"** para **"em reserva"**, registrando a reserva do serviço no sistema.

### Dados adicionais coletados do cliente (lead)

Para completar o cadastro antes de prosseguir com a reserva (caso ainda não seja cliente cadastrado):

- RG/IE
- CPF/CNPJ
- endereço do cliente

Essas informações devem realizar o **cadastro do novo cliente no sistema**.

Também deve existir **uma seção exclusiva para cadastrar novos clientes**, sem necessariamente passar por um atendimento.

### Fluxo

Essa etapa ocorre **após o registro do orçamento**, sendo feita logo na sequência caso o orçamento seja aprovado.

Fluxo do processo: Preencher formulários > Salvar Alterações > Ir para Escala

Opções disponíveis:

- **Editar Reserva**
- **Limpar Campos**
- **Salvar Alterações**

Regras:

- Não deve salvar até todos os **campos obrigatórios** estarem preenchidos.
- Não deve permitir **excluir reserva em nenhum lugar**, para não comprometer os relatórios.

### Botões em evidência na etapa "Reserva"

1. **Encerrar atendimento**

   - Se **não tiver salvado alterações de reserva**, registra o status em que o atendimento parou na última atualização, encerra o atendimento e direciona para a tela inicial.

   - Se **já tiver salvado pelo menos uma vez alterações de reserva**, encerra o atendimento registrando o status como **"Reserva Cancelada"** e direciona para a tela inicial.

2. **Ir para Escala**

   - Dá início à próxima etapa.  
   - Só será liberado após clicar em **Salvar Alterações** da etapa atual.

3. **Voltar para Orçamento**

   - Permite voltar uma etapa para possíveis edições.

---

# 5. Definição da escala

**Objetivo:**  
Designar **motorista(s), veículo(s) e/ou parceiro(s)** que serão atribuídos à reserva já feita para o atendimento em questão.

### Fluxo

Esta etapa ocorre **após a etapa de Reservas**.

Fluxo do processo: Preencher formulários > Salvar Alterações > Ir para Emissão de Contrato

Opções disponíveis:

- **Editar Escala**
- **Limpar Campos**
- **Salvar Alterações**

Regras:

- Não deve salvar até todos os **campos obrigatórios** estarem preenchidos.
- Não deve permitir **excluir escala em nenhum lugar**, para não comprometer os relatórios.

### Botões em evidência na etapa "Escala"

1. **Encerrar atendimento**

   - Independente das ações realizadas nesta etapa, o sistema encerra o atendimento registrando o status como **"Reserva Cancelada"** e direciona para a tela inicial.

2. **Ir para Emissão de Contrato**

   - Dá início à próxima etapa.  
   - Este botão deve estar **sempre liberado**, pois a próxima etapa não depende das informações desta etapa.

3. **Voltar para Reserva**

   - Permite voltar uma etapa para possíveis edições.

### OBS.

O cadastro de:

- motoristas
- veículos
- parceiros

deve ser feito **previamente no sistema**, para apenas serem **buscados/consultados na etapa de escala**.

Os dados da escala devem ser **editáveis**, pois até o dia do serviço podem haver alterações.

---

# 6. Emissão de contrato

**Objetivo:**  
Gerar o **contrato de serviço entre as partes envolvidas**.

### Fluxo

Após concluir a reserva com as principais informações, deve haver uma sequência de botões:

Gerar Contrato > Gerar PDF > Baixar contrato

O contrato então poderá ser enviado ao cliente, **a princípio manualmente**, por exemplo **via WhatsApp**.

Para isso:

- haverá um **documento modelo pré-definido e editável**;
- o sistema preencherá automaticamente os campos desse documento com base em informações registradas nas etapas do fluxo de atendimento.

### OBS.

Esta etapa **independe dos dados da escala**, pois até a data do serviço podem haver alterações na escala.

O contrato é algo que **deve ser resolvido com antecedência**.

### Botões em evidência na etapa "Emissão de Contrato"

1. **Encerrar atendimento**

   - Independente das ações realizadas nesta etapa, o sistema encerra o atendimento registrando o status como **"Reserva Cancelada"** e direciona para a tela inicial.

2. **Iniciar Serviço**

   - Altera o status do atendimento para **"Serviço em Andamento"**.

3. **Finalizar Serviço**

   - Altera o status do atendimento para **"Serviço Finalizado"**.

