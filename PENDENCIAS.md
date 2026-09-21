# 📋 Pendências e Roadmap — Sistema OS Ponto dos Fogões

## 🔴 FASE 1 — Base (URGENTE — fazer antes de qualquer outra coisa)

### Infraestrutura
- [ ] Confirmar login funcionando no sistema
- [ ] Firebase ativo e sincronizando em tempo real
- [ ] Apps Script executando e testado na planilha
- [ ] Sistema hospedado no GitHub Pages
- [ ] Trocar senhas padrão 1234

### Segurança
- [ ] Sair do modo de teste no Firebase
- [ ] Configurar regras de segurança no Firebase Realtime Database
- [ ] Implementar Firebase Authentication (senhas seguras)
- [ ] Remover Firebase Secret do código do sistema (usar variáveis de ambiente)

### Dados
- [ ] Testar sincronização real Planilha → Firebase → Sistema
- [ ] Confirmar mapeamento correto de todas as colunas
- [ ] Testar com dados reais da planilha

---

## 🟡 FASE 2 — Campos Ausentes da Planilha

Campos presentes na planilha que ainda não estão no app:

- [ ] **ENTRADA/TAXA** (col 38) — valor de entrada ou taxa de avaliação
- [ ] **RESPONSÁVEL TÉCNICO** (col 40) — quem executou o serviço
- [ ] **DATA APROVAÇÃO** (col 41) — quando cliente aprovou o orçamento
- [ ] **PREVISÃO DE ORÇAMENTO** (col 44) — data prometida
- [ ] **PREVISÃO MENOR ORÇAMENTO** (col 45) — valor mínimo orçado
- [ ] **GARANTIAS EM ORDEM** (col 43) — lista unificada de garantias
- [ ] Integração aba **Cadastro** (clientes)
- [ ] Integração aba **Nota Fiscal**
- [ ] Integração aba **Produção**

---

## 🟡 FASE 2 — Funcionalidades Operacionais

### Para Thais Alves (Auxiliar Administrativo)
- [ ] **Fila de tarefas diárias** — orçamentos para enviar, clientes para ligar, etc.
- [ ] **Central de Pendências** — painel clicável com tudo pendente
- [ ] Alerta quando cliente não responde em X dias

### Para Márcia (Financeiro)
- [ ] **Módulo Financeiro próprio** — forma de pagamento, data, desconto, parcelas
- [ ] Fechamento financeiro separado do operacional
- [ ] Relatório de recebimentos por período

### Para Thais Rangel (Gestão)
- [ ] Auditoria completa — quem fez o quê e quando
- [ ] Histórico detalhado da OS (linha do tempo)
- [ ] Relatório comparativo de períodos

### Fluxo de Status (13 etapas sugeridas)
- [ ] Implementar fluxo completo:
  RECEBIDO → AGUARDANDO AVALIAÇÃO → EM AVALIAÇÃO → ORÇAMENTO →
  AGUARDANDO APROVAÇÃO → APROVADO → AGUARDANDO PEÇA → EM EXECUÇÃO →
  PRONTO → CLIENTE AVISADO → ENTREGUE → GARANTIA
  + paralelos: NÃO APROVADO | CANCELADO | ABANDONADO

---

## ⚪ FASE 3 — Automações

- [ ] WhatsApp automático por mudança de status
- [ ] Envio automático de orçamento quando criado
- [ ] Alerta automático quando aparelho fica pronto
- [ ] Notificação de garantia vencendo
- [ ] Acompanhamento de clientes sem retorno

---

## 👥 Usuários para Ativar

- [ ] **ISACKSON JUNIO** — quando entrar na equipe
  Alterar `ativo:false` para `ativo:true` no arquivo index.html

- [ ] **WILGLER** — quando entrar na equipe
  Alterar `ativo:false` para `ativo:true` no arquivo index.html

---

## ⚠️ Divergências Identificadas

| Item | Planilha | App | Ação necessária |
|---|---|---|---|
| OS número | Coluna 11 (meio da tabela) | Campo principal | Verificar leitura no Apps Script |
| Item 01 histórico | Mesma coluna do serviço | Campos separados | Ajustar leitura |
| Status | Texto livre | Normalizado | Mapear status da planilha |
| Dados demo | Dados reais históricos | Dados fixos no código | Substituir por dados do Firebase |

---

## 📅 Última atualização: Setembro/2026
