# ⚙️ Guia de Configuração — Ponto dos Fogões Sistema OS

## PASSO 1 — Firebase (já criado)
- Projeto: `ponto-dos-fogoes-ff949`
- URL: `https://ponto-dos-fogoes-ff949-default-rtdb.firebaseio.com`
- ✅ Concluído

## PASSO 2 — Apps Script na Planilha
1. Abrir "Ordem de serviço - PDF - NOVA" no Google Sheets
2. Extensões → Apps Script
3. Colar conteúdo de `scripts/AppsScript_FINAL.gs`
4. Preencher `EMAIL_RESUMO` com email real
5. Executar `testarFirebase()` → deve retornar ✅
6. Executar `configurarTriggers()`
- 🔴 Pendente teste confirmado

## PASSO 3 — Sistema Online (GitHub Pages)
1. Ir em Settings do repositório
2. Pages → Source: Deploy from branch
3. Branch: main / Pasta: /sistema
4. Salvar → URL gerada automaticamente
- 🔴 Pendente

## PASSO 4 — Senhas
Alterar no arquivo `sistema/index.html` na seção `const USUARIOS`:
- THAIS RANGEL: trocar `'1234'` pela senha desejada
- MÁRCIA: trocar `'1234'`
- THAIS ALVES: trocar `'1234'`
- 🔴 Pendente

## PASSO 5 — Segurança Firebase
No Firebase Console → Realtime Database → Regras:
Substituir regras de teste por regras reais
- 🔴 Pendente
