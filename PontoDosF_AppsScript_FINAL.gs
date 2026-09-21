// ══════════════════════════════════════════════════════════════════════
// PONTO DOS FOGÕES — Apps Script FINAL
// Planilha: "Ordem de serviço - PDF - NOVA"
// Aba:      "Ordem de serviços"
// Versão:   3.1 — Mapeamento de colunas REAL da planilha
// ══════════════════════════════════════════════════════════════════════
//
// INSTALAÇÃO (fazer UMA VEZ):
// 1. Abra a planilha "Ordem de serviço - PDF - NOVA"
// 2. Menu: Extensões → Apps Script
// 3. Apague tudo e cole este arquivo
// 4. Preencha FIREBASE_URL e FIREBASE_SECRET abaixo
// 5. Execute: configurarTriggers()
// 6. Autorize as permissões quando solicitado
// ══════════════════════════════════════════════════════════════════════

const CONFIG = {

  // ── FIREBASE ─────────────────────────────────────────────────────────
  // Cole aqui a URL do seu banco (termina em .firebaseio.com)
  FIREBASE_URL: "https://ponto-dos-fogoes-ff949-default-rtdb.firebaseio.com",

  // Cole aqui o Secret (Configurações → Contas de serviço → Segredos)
  FIREBASE_SECRET: "HGNmjuiTvxvn82waxywDOO8HJ8tLpT18J4RlexOd",

  // ── PLANILHA ──────────────────────────────────────────────────────────
  ABA_OS:       "Ordem de serviços",  // aba principal de OSs
  ABA_CLIENTES: "Cadastro",           // aba de clientes
  ABA_NF:       "Nota fiscal",        // aba de notas fiscais
  ABA_PROD:     "Produção",           // aba de produção

  // Linha onde começam os dados (1 = sem cabeçalho, 2 = pula 1 linha de cabeçalho)
  // Ajuste se sua planilha tiver mais linhas de cabeçalho
  LINHA_INICIO: 2,

  // ── MAPEAMENTO EXATO DAS COLUNAS ─────────────────────────────────────
  // Baseado no cabeçalho real da sua planilha:
  // Col 1:  (índice/linha numérica)
  // Col 2:  CLIENTE
  // Col 3:  DATA ENTRADA
  // Col 4:  TELEFONE
  // Col 5:  SETOR
  // Col 6:  ATENDENTE
  // Col 7:  ENTREGUE EM
  // Col 8:  ITEM 01
  // Col 9:  GARANTIA 01
  // Col 10: SERVIÇO 01
  // Col 11: O.S.: (número da OS)
  // Col 12: VALOR 01
  // Col 13: ITEM 02
  // Col 14: GARANTIA 02
  // Col 15: SERVIÇO 02
  // Col 16: HISTÓRICO 02
  // Col 17: VALOR 02
  // Col 18: ITEM 03
  // Col 19: GARANTIA 03
  // Col 20: SERVIÇO 03
  // Col 21: HISTÓRICO 03
  // Col 22: VALOR 03
  // Col 23: ITEM 04
  // Col 24: GARANTIA 04
  // Col 25: SERVIÇO 04
  // Col 26: HISTÓRICO 04
  // Col 27: VALOR 04
  // Col 28: ITEM 05
  // Col 29: GARANTIA 05
  // Col 30: SERVIÇO 05
  // Col 31: HISTÓRICO 05
  // Col 32: VALOR 05
  // Col 33: ITEM 06
  // Col 34: GARANTIA 06
  // Col 35: SERVIÇO 06
  // Col 36: HISTÓRICO 06
  // Col 37: VALOR 06
  // Col 38: ENTRADA/TAXA
  // Col 39: STATUS
  // Col 40: RESPONSÁVEL TÉCNICO
  // Col 41: DATA APROVAÇÃO
  // Col 42: VALOR TOTAL
  // Col 43: GARANTIAS EM ORDEM DE ITENS
  // Col 44: PREVISÃO DE ORÇAMENTO
  // Col 45: PREVISÃO MENOR ORÇAMENTO

  C: {
    LINHA_NUM:    1,   // número sequencial da linha
    CLIENTE:      2,
    DATA_ENTRADA: 3,
    TELEFONE:     4,
    SETOR:        5,
    ATENDENTE:    6,
    ENTREGUE_EM:  7,
    ITEM1:        8,
    GARANTIA1:    9,
    SERVICO1:     10,
    OS:           11,  // ← número da OS (O.S.:)
    VALOR1:       12,
    ITEM2:        13,
    GARANTIA2:    14,
    SERVICO2:     15,
    HIST2:        16,
    VALOR2:       17,
    ITEM3:        18,
    GARANTIA3:    19,
    SERVICO3:     20,
    HIST3:        21,
    VALOR3:       22,
    ITEM4:        23,
    GARANTIA4:    24,
    SERVICO4:     25,
    HIST4:        26,
    VALOR4:       27,
    ITEM5:        28,
    GARANTIA5:    29,
    SERVICO5:     30,
    HIST5:        31,
    VALOR5:       32,
    ITEM6:        33,
    GARANTIA6:    34,
    SERVICO6:     35,
    HIST6:        36,
    VALOR6:       37,
    ENTRADA_TAXA: 38,
    STATUS:       39,
    RESP_TECNICO: 40,
    DATA_APROVAC: 41,
    VALOR_TOTAL:  42,
    GARANTIAS:    43,
    PREV_ORC:     44,
    PREV_ORC_MIN: 45,
  },

  // ── COMPORTAMENTO ────────────────────────────────────────────────────
  SYNC_MINUTOS:      5,
  EMAIL_RESUMO:      "thaisrangel2015@outlook.com", // ← seu email, // seu email
  NOTIFICAR_EMAIL:   true,
};


// ══════════════════════════════════════════════════════════════════════
//  PRAZOS DE ENTREGA POR SETOR
// ══════════════════════════════════════════════════════════════════════
const PRAZOS_ENTREGA = {
  'ELÉTRICOS':        30,
  'MICROONDAS':       30,
  'SERVIÇOS':         30,
  'LIQUIDIFICADORES': 20,
  'PANELAS':          10,
  'OUTROS':           10,
};

function calcularPrazoEntrega(setor, dataEntrada) {
  const prazo = PRAZOS_ENTREGA[setor] || 15;
  if (!dataEntrada) return '';
  const d = new Date(dataEntrada);
  d.setDate(d.getDate() + prazo);
  return Utilities.formatDate(d, 'America/Sao_Paulo', 'yyyy-MM-dd');
}

// ══════════════════════════════════════════════════════════════════════
//  SINCRONIZAR CLIENTES (aba Cadastro) — sem duplicatas
//  Identifica pelo telefone como chave primária
// ══════════════════════════════════════════════════════════════════════
function sincronizarClientesCadastro(osList) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const wsCad = ss.getSheetByName(CONFIG.ABA_CLIENTES);
  if (!wsCad) return;

  // Ler clientes existentes (col A = nome, col B = telefone)
  const ultimaLinha = wsCad.getLastRow();
  const existentes = {};
  if (ultimaLinha >= 2) {
    const dados = wsCad.getRange(2, 1, ultimaLinha - 1, 4).getValues();
    dados.forEach(row => {
      const tel = String(row[1] || '').replace(/\D/g, '');
      if (tel) existentes[tel.slice(-8)] = true;
    });
  }

  // Identificar novos clientes
  const clientesMap = {};
  osList.forEach(o => {
    const tel = String(o.tel || '').replace(/\D/g, '');
    const chave = tel.slice(-8);
    if (tel && o.cliente && !existentes[chave] && !clientesMap[chave]) {
      clientesMap[chave] = {
        nome:  o.cliente,
        tel:   o.tel,
        setor: o.setor,
        primeiraOS: o.os,
      };
    }
  });

  const novos = Object.values(clientesMap);
  if (novos.length === 0) return;

  // Gravar novos clientes na aba Cadastro
  novos.forEach(c => {
    const proxLinha = wsCad.getLastRow() + 1;
    wsCad.getRange(proxLinha, 1).setValue(c.nome);
    wsCad.getRange(proxLinha, 2).setValue(c.tel);
    wsCad.getRange(proxLinha, 3).setValue(c.setor);
    wsCad.getRange(proxLinha, 4).setValue(`OS #${c.primeiraOS}`);
  });

  console.log(`👥 ${novos.length} novos clientes cadastrados na aba Cadastro`);
  return novos.length;
}

// ══════════════════════════════════════════════════════════════════════
//  GERAR PRÓXIMO NÚMERO DE OS (sequencial, sem repetição)
// ══════════════════════════════════════════════════════════════════════
function gerarProximaOS() {
  const url = `${CONFIG.FIREBASE_URL}/meta/ultimaOS.json?auth=${CONFIG.FIREBASE_SECRET}`;
  const resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  const atual = parseInt(resp.getContentText()) || 0;
  const proximo = atual + 1;

  // Atualizar no Firebase
  UrlFetchApp.fetch(url, {
    method: 'PUT',
    contentType: 'application/json',
    payload: JSON.stringify(proximo),
    muteHttpExceptions: true,
  });

  return proximo;
}

// ══════════════════════════════════════════════════════════════════════
//  SINCRONIZAÇÃO PRINCIPAL
//  Lê a aba "Ordem de serviços" → processa → envia ao Firebase
// ══════════════════════════════════════════════════════════════════════
function sincronizarParaFirebase() {
  const inicio = new Date();
  const log = [`⏱️ Início: ${fmtDH(inicio)}`];

  try {
    const ss  = SpreadsheetApp.getActiveSpreadsheet();
    const ws  = ss.getSheetByName(CONFIG.ABA_OS);

    if (!ws) throw new Error(`Aba "${CONFIG.ABA_OS}" não encontrada!`);

    const ultimaLinha = ws.getLastRow();
    const totalLinhas = ultimaLinha - CONFIG.LINHA_INICIO + 1;

    if (totalLinhas <= 0) {
      log.push("⚠️ Nenhum dado encontrado na aba");
      gravarLog(log, false);
      return;
    }

    log.push(`📋 Lendo ${totalLinhas} linhas...`);

    // Ler todos os dados de uma vez (mais eficiente)
    const dados = ws.getRange(
      CONFIG.LINHA_INICIO, 1,
      totalLinhas,
      CONFIG.C.PREV_ORC_MIN   // última coluna
    ).getValues();

    // Processar linhas → montar objetos OS
    const osList  = [];
    const erros   = [];

    for (let i = 0; i < dados.length; i++) {
      const row     = dados[i];
      const numLinha = CONFIG.LINHA_INICIO + i;

      // OS sem número → pular
      const osNum = row[CONFIG.C.OS - 1];
      if (!osNum || String(osNum).trim() === "") continue;

      try {
        const os = montarObjOS(row, numLinha);
        if (os) osList.push(os);
      } catch (e) {
        erros.push(`Linha ${numLinha}: ${e.message}`);
      }
    }

    log.push(`✅ ${osList.length} OSs processadas`);
    if (erros.length) log.push(`⚠️ ${erros.length} erros de leitura`);

    // Enviar para Firebase
    if (osList.length > 0) {
      const res = enviarFirebase(osList);
      log.push(`🔥 Firebase: ${res.total} OSs sincronizadas`);
      log.push(`💰 Faturamento total: ${fmtVal(res.faturamento)}`);

      // Alertar OSs prontas
      const prontas = osList.filter(o => o.status === "PRONTO");
      if (prontas.length > 0) {
        log.push(`🔔 ${prontas.length} OS(s) prontas para retirada`);
        marcarProntasFirebase(prontas);
      }
    }

    // Sincronizar clientes (Firebase)
    sincronizarClientes(ss);
    // Sincronizar clientes na aba Cadastro (sem duplicatas)
    sincronizarClientesCadastro(osList);

    const dur = Math.round((new Date() - inicio) / 1000);
    log.push(`⏱️ Concluído em ${dur}s`);
    gravarLog(log, true);

  } catch (e) {
    log.push(`❌ ERRO: ${e.message}`);
    gravarLog(log, false);
    console.error(e);
  }
}

// ══════════════════════════════════════════════════════════════════════
//  MONTAR OBJETO OS A PARTIR DE UMA LINHA DA PLANILHA
// ══════════════════════════════════════════════════════════════════════
function montarObjOS(row, numLinha) {
  const C = CONFIG.C;

  // Dados principais
  const osNum    = String(row[C.OS - 1]).trim();
  const cliente  = String(row[C.CLIENTE - 1] || "").trim();
  const setor    = String(row[C.SETOR - 1] || "").trim().toUpperCase();
  const atend    = String(row[C.ATENDENTE - 1] || "").trim().toUpperCase();
  const respTec  = String(row[C.RESP_TECNICO - 1] || "").trim();
  const status   = normalizarStatus(String(row[C.STATUS - 1] || ""));
  const entrada  = fmtDataISO(row[C.DATA_ENTRADA - 1]);
  const entrega  = fmtDataISO(row[C.ENTREGUE_EM - 1]);
  const dataAprov= fmtDataISO(row[C.DATA_APROVAC - 1]);
  const prevOrc  = fmtDataISO(row[C.PREV_ORC - 1]);
  const prevMin  = fmtDataISO(row[C.PREV_ORC_MIN - 1]);

  // Telefone — garantir DDI 55
  let tel = String(row[C.TELEFONE - 1] || "").replace(/\D/g, "");
  if (tel.length > 0 && !tel.startsWith("55")) tel = "55" + tel;

  // Entrada/Taxa (sinal)
  const entradaTaxa = parseFloat(String(row[C.ENTRADA_TAXA - 1]).replace(",", ".")) || 0;

  // Valor total da planilha (col 42) — usar como referência
  const valorTotalPlanilha = parseFloat(String(row[C.VALOR_TOTAL - 1]).replace(",", ".")) || 0;

  // ── Itens (até 6 por OS) ──────────────────────────────────────────
  // Observação: item 01 não tem HISTÓRICO separado — serviço E histórico
  // estão na mesma coluna (SERVIÇO 01). A partir do item 02 há coluna
  // separada de HISTÓRICO.
  const grupos = [
    { item: C.ITEM1, gar: C.GARANTIA1, serv: C.SERVICO1, hist: C.SERVICO1,  val: C.VALOR1  },
    { item: C.ITEM2, gar: C.GARANTIA2, serv: C.SERVICO2, hist: C.HIST2,     val: C.VALOR2  },
    { item: C.ITEM3, gar: C.GARANTIA3, serv: C.SERVICO3, hist: C.HIST3,     val: C.VALOR3  },
    { item: C.ITEM4, gar: C.GARANTIA4, serv: C.SERVICO4, hist: C.HIST4,     val: C.VALOR4  },
    { item: C.ITEM5, gar: C.GARANTIA5, serv: C.SERVICO5, hist: C.HIST5,     val: C.VALOR5  },
    { item: C.ITEM6, gar: C.GARANTIA6, serv: C.SERVICO6, hist: C.HIST6,     val: C.VALOR6  },
  ];

  const itens = [];
  for (const g of grupos) {
    const ap   = String(row[g.item - 1] || "").trim();
    const serv = String(row[g.serv - 1] || "").trim();
    const hist = String(row[g.hist - 1] || "").trim();
    const gar  = String(row[g.gar  - 1] || "30").trim();
    const val  = parseFloat(String(row[g.val - 1] || "0").replace(",", ".")) || 0;

    if (!ap && !serv && val === 0) continue; // linha de item vazia

    itens.push({
      ap,
      hist:     serv !== hist ? `${serv} ${hist}`.trim() : serv,
      val,
      garantia: parseInt(gar) || 30,
    });
  }

  if (itens.length === 0) {
    itens.push({ ap: "", hist: "", val: 0, garantia: 30 });
  }

  // Garantia principal (do primeiro item)
  const garantiaPrincipal = itens[0]?.garantia || 30;

  return {
    os:              Number(osNum),
    cliente,
    tel,
    setor,
    atendente:       atend,
    responsavelTec:  respTec,
    itens,
    status,
    entrada,
    entrega,
    dataAprovacao:   dataAprov,
    previsaoOrc:     prevOrc,
    previsaoOrcMin:  prevMin,
    entradaTaxa,
    valorTotal:      valorTotalPlanilha || itens.reduce((s,i) => s + i.val, 0),
    garantia:        garantiaPrincipal,
    obs:             "",
    fonte:           "planilha",
    linhaOrigem:     numLinha,
    syncAt:          new Date().toISOString(),
  };
}

// ══════════════════════════════════════════════════════════════════════
//  SINCRONIZAR CLIENTES (aba Cadastro)
// ══════════════════════════════════════════════════════════════════════
function sincronizarClientes(ss) {
  try {
    const ws = ss.getSheetByName(CONFIG.ABA_CLIENTES);
    if (!ws) return;

    const dados = ws.getRange(2, 1, ws.getLastRow() - 1, 10).getValues();
    const clientes = {};

    for (const row of dados) {
      const nome = String(row[0] || "").trim();
      if (!nome) continue;
      // Adaptar conforme colunas reais do Cadastro
      clientes[nome.replace(/[.#$[\]]/g, "_")] = {
        nome,
        tel:       String(row[1] || "").replace(/\D/g, ""),
        email:     String(row[2] || ""),
        cidade:    String(row[3] || ""),
        syncAt:    new Date().toISOString(),
      };
    }

    const url = `${CONFIG.FIREBASE_URL}/clientes.json?auth=${CONFIG.FIREBASE_SECRET}`;
    UrlFetchApp.fetch(url, {
      method: "PUT",
      contentType: "application/json",
      payload: JSON.stringify(clientes),
      muteHttpExceptions: true,
    });

    console.log(`👥 ${Object.keys(clientes).length} clientes sincronizados`);
  } catch (e) {
    console.warn("Erro ao sincronizar clientes:", e.message);
  }
}

// ══════════════════════════════════════════════════════════════════════
//  ENVIAR PARA FIREBASE
// ══════════════════════════════════════════════════════════════════════
function enviarFirebase(osList) {
  // Montar objeto indexado pelo número da OS
  const payload = {};
  let faturamento = 0;

  for (const os of osList) {
    const key = `os_${os.os}`;
    payload[key] = os;
    faturamento += os.valorTotal || 0;
  }

  // Enviar OSs
  const urlOS = `${CONFIG.FIREBASE_URL}/ordens.json?auth=${CONFIG.FIREBASE_SECRET}`;
  const respOS = UrlFetchApp.fetch(urlOS, {
    method: "PUT",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  if (respOS.getResponseCode() !== 200) {
    throw new Error(`Firebase erro ${respOS.getResponseCode()}: ${respOS.getContentText()}`);
  }

  // Atualizar metadados
  const urlMeta = `${CONFIG.FIREBASE_URL}/meta.json?auth=${CONFIG.FIREBASE_SECRET}`;
  UrlFetchApp.fetch(urlMeta, {
    method: "PUT",
    contentType: "application/json",
    payload: JSON.stringify({
      ultimaSync:   new Date().toISOString(),
      totalOS:      osList.length,
      faturamento,
      prontas:      osList.filter(o => o.status === "PRONTO").length,
      entregues:    osList.filter(o => o.status === "ENTREGUE").length,
      aguardando:   osList.filter(o => ["AGUARDANDO ORÇAMENTO","AGUARDANDO APROVAÇÃO","AGUARDANDO PEÇA"].includes(o.status)).length,
      versao:       "3.1",
    }),
    muteHttpExceptions: true,
  });

  return { total: osList.length, faturamento };
}

// ══════════════════════════════════════════════════════════════════════
//  MARCAR OSS PRONTAS NO FIREBASE (para alertas no sistema)
// ══════════════════════════════════════════════════════════════════════
function marcarProntasFirebase(prontas) {
  try {
    // Buscar quais já foram notificadas
    const urlHist = `${CONFIG.FIREBASE_URL}/notificacoes.json?auth=${CONFIG.FIREBASE_SECRET}`;
    const resp = UrlFetchApp.fetch(urlHist, { muteHttpExceptions: true });
    const hist = JSON.parse(resp.getContentText()) || {};
    const jaNotif = new Set(Object.values(hist).map(n => String(n.os)));

    for (const os of prontas) {
      if (jaNotif.has(String(os.os))) continue;
      UrlFetchApp.fetch(urlHist, {
        method: "POST",
        contentType: "application/json",
        payload: JSON.stringify({
          os:       os.os,
          cliente:  os.cliente,
          tel:      os.tel,
          valor:    os.valorTotal,
          status:   "PENDENTE_NOTIFICACAO",
          criadoEm: new Date().toISOString(),
        }),
        muteHttpExceptions: true,
      });
    }
  } catch (e) {
    console.warn("Erro notificações:", e.message);
  }
}

// ══════════════════════════════════════════════════════════════════════
//  WEBHOOK — Sistema web → Firebase (via Apps Script)
// ══════════════════════════════════════════════════════════════════════
function doPost(e) {
  try {
    const dados = JSON.parse(e.postData.contents);

    if (dados.acao === "novaOS") {
      const url = `${CONFIG.FIREBASE_URL}/ordens/os_${dados.os.os}.json?auth=${CONFIG.FIREBASE_SECRET}`;
      UrlFetchApp.fetch(url, {
        method: "PUT",
        contentType: "application/json",
        payload: JSON.stringify({ ...dados.os, syncAt: new Date().toISOString(), fonte: "sistema_web" }),
      });
      return ok({ os: dados.os.os });
    }

    if (dados.acao === "atualizarStatus") {
      const url = `${CONFIG.FIREBASE_URL}/ordens/os_${dados.os}.json?auth=${CONFIG.FIREBASE_SECRET}`;
      UrlFetchApp.fetch(url, {
        method: "PATCH",
        contentType: "application/json",
        payload: JSON.stringify({ status: dados.status, atualizadoEm: new Date().toISOString() }),
      });
      return ok({ os: dados.os, status: dados.status });
    }

    if (dados.acao === "registrarWA") {
      const url = `${CONFIG.FIREBASE_URL}/historico_wa.json?auth=${CONFIG.FIREBASE_SECRET}`;
      UrlFetchApp.fetch(url, {
        method: "POST",
        contentType: "application/json",
        payload: JSON.stringify({ ...dados, dataHora: new Date().toISOString() }),
      });
      return ok({});
    }

    return err("Ação desconhecida");
  } catch (e) {
    return err(e.message);
  }
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    status:  "online",
    projeto: "Ponto dos Fogões",
    versao:  "3.1",
    hora:    new Date().toISOString(),
  })).setMimeType(ContentService.MimeType.JSON);
}

const ok  = d => ContentService.createTextOutput(JSON.stringify({ ok: true,  ...d })).setMimeType(ContentService.MimeType.JSON);
const err = m => ContentService.createTextOutput(JSON.stringify({ ok: false, erro: m })).setMimeType(ContentService.MimeType.JSON);

// ══════════════════════════════════════════════════════════════════════
//  EMAIL DIÁRIO — Resumo para Thais Rangel
// ══════════════════════════════════════════════════════════════════════
function resumoDiario() {
  if (!CONFIG.NOTIFICAR_EMAIL) return;

  const ss  = SpreadsheetApp.getActiveSpreadsheet();
  const ws  = ss.getSheetByName(CONFIG.ABA_OS);
  if (!ws) return;

  const dados  = ws.getRange(CONFIG.LINHA_INICIO, 1, ws.getLastRow() - CONFIG.LINHA_INICIO + 1, CONFIG.C.PREV_ORC_MIN).getValues();
  const osList = dados.map((row, i) => {
    try { return montarObjOS(row, CONFIG.LINHA_INICIO + i); } catch(e) { return null; }
  }).filter(Boolean);

  const prontas    = osList.filter(o => o.status === "PRONTO");
  const aguardando = osList.filter(o => ["AGUARDANDO ORÇAMENTO","AGUARDANDO APROVAÇÃO"].includes(o.status));
  const entregues  = osList.filter(o => o.status === "ENTREGUE");
  const faturamento= osList.reduce((s, o) => s + (o.valorTotal || 0), 0);
  const hoje       = Utilities.formatDate(new Date(), "America/Sao_Paulo", "dd/MM/yyyy");

  const linhaOS = (o, i) => `
    <tr style="background:${i%2?"#1A1A1A":"#141414"}">
      <td style="padding:8px;color:#FF8E11;font-weight:700">#${o.os}</td>
      <td style="padding:8px;color:#F5F5F5">${o.cliente}</td>
      <td style="padding:8px;color:#aaa">${o.setor}</td>
      <td style="padding:8px;color:#aaa">${(o.itens[0]?.ap||"—").slice(0,25)}</td>
      <td style="padding:8px;text-align:right;color:#FF8E11;font-weight:700">${fmtVal(o.valorTotal)}</td>
    </tr>`;

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto">
    <div style="background:#0A4A96;padding:22px 24px;border-radius:10px 10px 0 0">
      <h2 style="color:#fff;margin:0;font-size:22px">🔥 Ponto dos Fogões</h2>
      <p style="color:#90B8E8;margin:6px 0 0;font-size:13px">Resumo automático — ${hoje}</p>
    </div>
    <div style="background:#141414;padding:24px;border-radius:0 0 10px 10px">
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr>
          ${[
            [osList.length,  "Total OSs",    "#FF8E11"],
            [prontas.length, "Prontas",      "#22C55E"],
            [aguardando.length,"Aguardando", "#F59E0B"],
            [entregues.length,"Entregues",   "#3B82F6"],
          ].map(([val,lbl,cor])=>`
            <td style="background:#1A1A1A;border-radius:8px;padding:16px;text-align:center;width:23%">
              <div style="color:${cor};font-size:28px;font-weight:900">${val}</div>
              <div style="color:#666;font-size:11px;margin-top:4px">${lbl}</div>
            </td><td style="width:2%"></td>`).join("")}
        </tr>
      </table>
      <div style="background:#1A1A1A;border-radius:8px;padding:14px;text-align:center;margin-bottom:24px">
        <div style="color:#FF8E11;font-size:24px;font-weight:900">${fmtVal(faturamento)}</div>
        <div style="color:#666;font-size:12px;margin-top:4px">Faturamento Total</div>
      </div>
      ${prontas.length > 0 ? `
      <h3 style="color:#22C55E;font-size:14px;margin:0 0 10px">✅ Prontas para retirada</h3>
      <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:20px">
        <tr style="background:#222">
          <th style="padding:8px;text-align:left;color:#aaa">OS</th>
          <th style="padding:8px;text-align:left;color:#aaa">Cliente</th>
          <th style="padding:8px;text-align:left;color:#aaa">Setor</th>
          <th style="padding:8px;text-align:left;color:#aaa">Aparelho</th>
          <th style="padding:8px;text-align:right;color:#aaa">Valor</th>
        </tr>
        ${prontas.slice(0,15).map(linhaOS).join("")}
      </table>` : ""}
      <p style="color:#444;font-size:11px;text-align:center;margin:0;border-top:1px solid #222;padding-top:14px">
        Ponto dos Fogões — Sistema OS v3.1 | Contagem MG<br>
        Email gerado automaticamente às 08h00
      </p>
    </div>
  </div>`;

  MailApp.sendEmail({
    to:       CONFIG.EMAIL_RESUMO,
    subject:  `🔥 Ponto dos Fogões — ${hoje} | ${prontas.length} prontas | ${fmtVal(faturamento)}`,
    htmlBody: html,
  });
}

// ══════════════════════════════════════════════════════════════════════
//  LOG DE SINCRONIZAÇÃO
// ══════════════════════════════════════════════════════════════════════
function gravarLog(linhas, sucesso) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let wsLog = ss.getSheetByName("🔄 Log Sistema");
  if (!wsLog) {
    wsLog = ss.insertSheet("🔄 Log Sistema");
    wsLog.getRange("A1:D1").setValues([["Data/Hora","Status","Última Mensagem","Log Completo"]]);
    wsLog.getRange("A1:D1").setBackground("#0A4A96").setFontColor("#fff").setFontWeight("bold");
    wsLog.setTabColor("#0A4A96");
    wsLog.setColumnWidth(1, 160); wsLog.setColumnWidth(2, 80); wsLog.setColumnWidth(3, 280); wsLog.setColumnWidth(4, 600);
  }
  const ultima = wsLog.getLastRow() + 1;
  wsLog.getRange(ultima, 1).setValue(new Date()).setNumberFormat("dd/MM/yyyy HH:mm:ss");
  wsLog.getRange(ultima, 2).setValue(sucesso ? "✅ OK" : "❌ ERRO").setFontColor(sucesso ? "#22C55E" : "#EF4444");
  wsLog.getRange(ultima, 3).setValue(linhas[linhas.length - 1]);
  wsLog.getRange(ultima, 4).setValue(linhas.join(" | "));
  if (ultima > 202) wsLog.deleteRows(2, ultima - 202);
}

// ══════════════════════════════════════════════════════════════════════
//  CONFIGURAR TRIGGERS
// ══════════════════════════════════════════════════════════════════════
function configurarTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (["sincronizarParaFirebase","resumoDiario"].includes(t.getHandlerFunction()))
      ScriptApp.deleteTrigger(t);
  });

  // A cada N minutos
  ScriptApp.newTrigger("sincronizarParaFirebase")
    .timeBased().everyMinutes(CONFIG.SYNC_MINUTOS).create();

  // Ao abrir a planilha
  ScriptApp.newTrigger("sincronizarParaFirebase")
    .forSpreadsheet(SpreadsheetApp.getActive()).onOpen().create();

  // Email diário às 8h
  if (CONFIG.NOTIFICAR_EMAIL) {
    ScriptApp.newTrigger("resumoDiario")
      .timeBased().atHour(8).everyDays(1).create();
  }

  SpreadsheetApp.getUi().alert(
    "✅ Tudo configurado!\n\n" +
    `• Sync automático: a cada ${CONFIG.SYNC_MINUTOS} minutos\n` +
    "• Sync ao abrir a planilha\n" +
    "• Email de resumo: todos os dias às 08h\n\n" +
    "Executando primeira sincronização agora..."
  );

  sincronizarParaFirebase();
}

// ══════════════════════════════════════════════════════════════════════
//  TESTAR CONEXÃO
// ══════════════════════════════════════════════════════════════════════
function testarFirebase() {
  try {
    const url  = `${CONFIG.FIREBASE_URL}/teste.json?auth=${CONFIG.FIREBASE_SECRET}`;
    const resp = UrlFetchApp.fetch(url, {
      method: "PUT",
      contentType: "application/json",
      payload: JSON.stringify({ ok: true, hora: new Date().toISOString() }),
      muteHttpExceptions: true,
    });
    const code = resp.getResponseCode();
    if (code === 200) {
      SpreadsheetApp.getUi().alert("✅ Conexão com Firebase OK!\n\nAgora execute 'Configurar Triggers'.");
    } else {
      SpreadsheetApp.getUi().alert(`❌ Erro ${code}\n\n${resp.getContentText()}\n\nVerifique FIREBASE_URL e FIREBASE_SECRET.`);
    }
  } catch (e) {
    SpreadsheetApp.getUi().alert(`❌ Erro: ${e.message}`);
  }
}

// ══════════════════════════════════════════════════════════════════════
//  MENU NO GOOGLE SHEETS
// ══════════════════════════════════════════════════════════════════════
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🔥 Ponto dos Fogões")
    .addItem("🔄 Sincronizar Agora → Firebase", "sincronizarParaFirebase")
    .addSeparator()
    .addItem("🧪 Testar Conexão Firebase",       "testarFirebase")
    .addItem("⚙️ Configurar Triggers (1ª vez)",  "configurarTriggers")
    .addSeparator()
    .addItem("📧 Enviar Resumo Agora",            "resumoDiario")
    .addToUi();
}

// ══════════════════════════════════════════════════════════════════════
//  UTILITÁRIOS
// ══════════════════════════════════════════════════════════════════════
function normalizarStatus(s) {
  s = (s || "").toUpperCase().trim();
  if (s.includes("ENTREGUE"))                                   return "ENTREGUE";
  if (s.includes("PRONTO"))                                     return "PRONTO";
  if (s.includes("CANCELADO"))                                  return "CANCELADO";
  if (s.includes("DESCARTE"))                                   return "DESCARTE";
  if (s.includes("NÃO APROVADO") || s.includes("N/APROVADO"))  return "NÃO APROVADO";
  if (s.includes("PEÇA") || s.includes("PECA"))                 return "AGUARDANDO PEÇA";
  if (s.includes("APROVAÇÃO") || s.includes("APROVACAO"))       return "AGUARDANDO APROVAÇÃO";
  if (s.includes("ORÇAMENTO") || s.includes("ORCAMENTO"))       return "AGUARDANDO ORÇAMENTO";
  if (s.includes("AGUARDANDO"))                                  return "AGUARDANDO ORÇAMENTO";
  return s || "AGUARDANDO ORÇAMENTO";
}

function fmtDataISO(val) {
  if (!val) return "";
  if (val instanceof Date) return Utilities.formatDate(val, "America/Sao_Paulo", "yyyy-MM-dd");
  const s = String(val).trim();
  if (s.includes("/")) {
    const p = s.split("/");
    if (p.length === 3) return `${p[2].padStart(4,"20")}-${p[1].padStart(2,"0")}-${p[0].padStart(2,"0")}`;
  }
  return s;
}

function fmtDH(d) {
  return Utilities.formatDate(d, "America/Sao_Paulo", "dd/MM/yyyy HH:mm:ss");
}

function fmtVal(v) {
  return "R$ " + Number(v||0).toLocaleString("pt-BR", { minimumFractionDigits:2, maximumFractionDigits:2 });
}
