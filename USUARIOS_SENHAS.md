# 🔐 Usuários e Senhas — Ponto dos Fogões

## Perfis Ativos

| Usuária | Cargo | Senha Atual | Nova Senha |
|---|---|---|---|
| THAIS RANGEL | Gestão (admin total) | 1234 | ________ |
| MÁRCIA | Financeiro | 1234 | ________ |
| THAIS ALVES | Auxiliar Administrativo | 1234 | ________ |

## Perfis Inativos (em breve)

| Usuário | Cargo | Setor | Senha |
|---|---|---|---|
| ISACKSON JUNIO | Aux. Manutenção | Elétricos | 1234 |
| WILGLER | Aux. Manutenção | Panelas | 1234 |

## Como trocar as senhas

1. Abrir `sistema/index.html` no Bloco de Notas
2. Pressionar Ctrl+F e buscar: `const USUARIOS`
3. Localizar a linha com o nome da usuária
4. Trocar `senha:'1234'` pela senha desejada
5. Salvar o arquivo (Ctrl+S)
6. Fazer novo upload no GitHub

## Permissões por perfil

### THAIS RANGEL — Gestão
✅ Dashboard | ✅ Relatórios | ✅ Criar OS | ✅ Editar OS
✅ **EXCLUIR OS** | ✅ Ver valores | ✅ Exportar CSV
✅ WhatsApp | ✅ Clientes | ✅ Garantias | ✅ **Gerenciar usuários**

### MÁRCIA — Financeiro
✅ Dashboard | ✅ Relatórios | ✅ Criar OS | ✅ Editar OS
❌ Excluir OS | ✅ Ver valores | ✅ Exportar CSV
✅ WhatsApp | ✅ Clientes | ✅ Garantias

### THAIS ALVES — Auxiliar Administrativo
✅ Dashboard | ❌ Relatórios | ✅ Criar OS | ✅ Editar OS
❌ Excluir OS | ✅ Ver valores | ❌ Exportar CSV
✅ WhatsApp | ✅ Clientes | ✅ Garantias

### ISACKSON JUNIO — Técnico Elétricos (inativo)
✅ Ver OSs do setor Elétricos | ✅ Atualizar status
✅ Registrar observação técnica | ✅ Imprimir OS
❌ Criar/Editar/Excluir | ❌ Ver valores | ❌ WhatsApp

### WILGLER — Técnico Panelas (inativo)
✅ Ver OSs do setor Panelas | ✅ Atualizar status
✅ Registrar observação técnica | ✅ Imprimir OS
❌ Criar/Editar/Excluir | ❌ Ver valores | ❌ WhatsApp
