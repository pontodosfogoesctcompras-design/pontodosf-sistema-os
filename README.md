# 🔥 Ponto dos Fogões — Sistema de Ordens de Serviço

> Sistema completo de gestão de Ordens de Serviço para assistência técnica em eletrodomésticos e panelas & utensílios — Contagem, MG.

---

## 📁 Estrutura do Repositório

```
pontodosf-sistema-os/
│
├── sistema/
│   └── index.html          ← Sistema principal (abrir no navegador)
│
├── scripts/
│   ├── AppsScript_FINAL.gs       ← Instalar no Google Sheets
│   └── Integracao_Completa.gs    ← Versão completa da integração
│
├── docs/
│   └── SETUP.md            ← Guia de configuração
│
└── README.md
```

---

## 👥 Usuários do Sistema

| Usuária | Cargo | Senha | Status |
|---|---|---|---|
| THAIS RANGEL | Gestão (admin total) | 1234 | ✅ Ativo |
| MÁRCIA | Financeiro | 1234 | ✅ Ativo |
| THAIS ALVES | Auxiliar Administrativo | 1234 | ✅ Ativo |
| ISACKSON JUNIO | Aux. Manutenção — Elétricos | 1234 | 🔜 Em breve |
| WILGLER | Aux. Manutenção — Panelas | 1234 | 🔜 Em breve |

> ⚠️ Trocar as senhas padrão `1234` antes de usar em produção.

---

## 🏗️ Arquitetura

```
Planilha Google Sheets
"Ordem de serviço - PDF - NOVA"
        ↓
  Google Apps Script
  (lê a cada 5 min)
        ↓
Firebase Realtime Database
ponto-dos-fogoes-ff949
        ↓
   Sistema Web/PWA
   index.html
        ↓
PC + Android + iPhone
```

---

## ⚙️ Configuração Firebase

- **Projeto:** `ponto-dos-fogoes-ff949`
- **Database URL:** `https://ponto-dos-fogoes-ff949-default-rtdb.firebaseio.com`
- **Secret:** armazenado no Apps Script (não expor publicamente)

---

## 📋 Mapeamento de Colunas — Planilha

| Col | Campo | No App |
|---|---|---|
| 2 | CLIENTE | ✅ |
| 3 | DATA ENTRADA | ✅ |
| 4 | TELEFONE | ✅ |
| 5 | SETOR | ✅ |
| 6 | ATENDENTE | ✅ |
| 7 | ENTREGUE EM | ✅ |
| 8–37 | ITENS 01–06 | ✅ |
| 11 | O.S. (número) | ✅ |
| 39 | STATUS | ✅ |
| 42 | VALOR TOTAL | ✅ |
| 38 | ENTRADA/TAXA | 🔴 Pendente |
| 40 | RESPONSÁVEL TÉCNICO | 🔴 Pendente |
| 41 | DATA APROVAÇÃO | 🔴 Pendente |
| 44 | PREVISÃO ORÇAMENTO | 🔴 Pendente |
| 45 | PREVISÃO MENOR ORC. | 🔴 Pendente |

---

## 🔴 Pendências — FASE 1

- [ ] Confirmar login funcionando
- [ ] Firebase ativo e sincronizando em tempo real
- [ ] Apps Script executando e testado
- [ ] Senhas individuais configuradas
- [ ] Campos ausentes: ENTRADA/TAXA, RESP. TÉCNICO, DATA APROVAÇÃO
- [ ] Segurança Firebase (sair do modo teste)
- [ ] Auditoria de ações
- [ ] Histórico completo da OS
- [ ] GitHub Pages hospedando o sistema

---

## 🟡 Pendências — FASE 2

- [ ] Central de Pendências
- [ ] Fila de tarefas diárias (Thais Alves)
- [ ] Módulo Financeiro (Márcia)
- [ ] Fluxo de status completo (13 etapas)
- [ ] Ativar Isackson Junio
- [ ] Ativar Wilgler
- [ ] Integração aba Nota Fiscal
- [ ] Integração aba Produção

---

## ⚪ Pendências — FASE 3

- [ ] WhatsApp automático por mudança de status
- [ ] Alerta de acompanhamento (cliente sem retorno)
- [ ] Firebase Authentication (senhas seguras)

---

## 📱 Como Usar

### No computador
1. Baixe o arquivo `sistema/index.html`
2. Abra no Chrome ou Edge
3. Selecione seu perfil e digite a senha

### No iPhone
1. Abra o link do sistema no **Safari**
2. Toque em **Compartilhar** → **Adicionar à Tela de Início**
3. O ícone aparece como app nativo

### No Android
1. Abra no Chrome
2. Menu (⋮) → **Adicionar à tela inicial**

---

## 🗂️ Setores

- ⚡ **Eletrodomésticos** — air fryers, microondas, ventiladores, ferros, secadores, etc.
- 🫕 **Panelas & Utensílios** — panelas de pressão, tampas, cabos, alças, frigideiras, etc.

---

## 📍 Empresa

**Ponto dos Fogões**
Rua Rodrigues da Cunha 767, Ressaca — Contagem, MG
📱 (31) 99268-3079
📧 pontodosfogoesct@outlook.com
CNPJ: 40.629.028/0001-07

---

*Sistema desenvolvido para uso interno. Versão 3.0 — Set/2026*
