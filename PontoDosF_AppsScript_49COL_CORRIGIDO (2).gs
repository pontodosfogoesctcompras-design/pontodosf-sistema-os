// ══════════════════════════════════════════════════════════════════════
// PONTO DOS FOGÕES — Apps Script — BASE OFICIAL 49 COLUNAS
// Google Sheets = fonte oficial das O.S.
// Firebase é opcional e NÃO participa da gravação principal.
// ══════════════════════════════════════════════════════════════════════

const CONFIG = {
  ABA_OS: 'Ordem de serviços',
  ABA_CLIENTES: 'Cadastro',
  LINHA_INICIO: 2,
  TOTAL_COLUNAS: 49,
  TIMEZONE: 'America/Sao_Paulo',
  // Depois de publicar este projeto como aplicativo da Web,
  // coloque a URL /exec no HTML, em APP_CONFIG.APPS_SCRIPT_URL.
};

// MAPA OFICIAL — NÃO ALTERAR A ORDEM.
const C = Object.freeze({
  OS:1, CLIENTE:2, DATA_ENTRADA:3, TELEFONE:4, SETOR:5, ATENDENTE:6,
  ENTREGUE_EM:7,
  ITEM1:8, GARANTIA1:9, SERVICO1:10, HIST1:11, VALOR1:12,
  ITEM2:13, GARANTIA2:14, SERVICO2:15, HIST2:16, VALOR2:17,
  ITEM3:18, GARANTIA3:19, SERVICO3:20, HIST3:21, VALOR3:22,
  ITEM4:23, GARANTIA4:24, SERVICO4:25, HIST4:26, VALOR4:27,
  ITEM5:28, GARANTIA5:29, SERVICO5:30, HIST5:31, VALOR5:32,
  ITEM6:33, GARANTIA6:34, SERVICO6:35, HIST6:36, VALOR6:37,
  ENTRADA_TAXA:38, STATUS:39, RESPONSAVEL_TECNICO:40,
  DATA_APROVACAO:41, VALOR_TOTAL:42, GARANTIAS_ORDEM:43,
  PREVISAO_ORCAMENTO:44, PREVISAO_MENOR_ORCAMENTO:45,
  COL46:46, COL47:47, COL48:48, COL49:49
});

const ITEM_MAP = [
  {item:C.ITEM1, garantia:C.GARANTIA1, servico:C.SERVICO1, historico:C.HIST1, valor:C.VALOR1},
  {item:C.ITEM2, garantia:C.GARANTIA2, servico:C.SERVICO2, historico:C.HIST2, valor:C.VALOR2},
  {item:C.ITEM3, garantia:C.GARANTIA3, servico:C.SERVICO3, historico:C.HIST3, valor:C.VALOR3},
  {item:C.ITEM4, garantia:C.GARANTIA4, servico:C.SERVICO4, historico:C.HIST4, valor:C.VALOR4},
  {item:C.ITEM5, garantia:C.GARANTIA5, servico:C.SERVICO5, historico:C.HIST5, valor:C.VALOR5},
  {item:C.ITEM6, garantia:C.GARANTIA6, servico:C.SERVICO6, historico:C.HIST6, valor:C.VALOR6},
];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(CONFIG.ABA_OS);
  if (!sh) throw new Error(`Aba "${CONFIG.ABA_OS}" não encontrada.`);
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function ok_(data) { return json_(Object.assign({ok:true}, data || {})); }
function err_(message) { return json_({ok:false, erro:String(message || 'Erro desconhecido')}); }

function normStatus_(s) {
  s = String(s || '').toUpperCase().trim();
  if (s.includes('ENTREGUE')) return 'ENTREGUE';
  if (s.includes('PRONTO')) return 'PRONTO';
  if (s.includes('CANCELADO')) return 'CANCELADO';
  if (s.includes('DESCARTE')) return 'DESCARTE';
  if (s.includes('NÃO APROVADO') || s.includes('NAO APROVADO') || s.includes('N/APROVADO')) return 'NÃO APROVADO';
  if (s.includes('PEÇA') || s.includes('PECA')) return 'AGUARDANDO PEÇA';
  if (s.includes('APROVAÇÃO') || s.includes('APROVACAO')) return 'AGUARDANDO APROVAÇÃO';
  if (s.includes('ORÇAMENTO') || s.includes('ORCAMENTO')) return 'AGUARDANDO ORÇAMENTO';
  return s || 'AGUARDANDO ORÇAMENTO';
}

function dateValue_(value) {
  if (!value) return '';
  if (value instanceof Date) return Utilities.formatDate(value, CONFIG.TIMEZONE, 'yyyy-MM-dd');
  const s = String(value).trim();
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0,10);
  const m = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
  if (m) return `${m[3]}-${String(m[2]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`;
  return s;
}

function num_(value) {
  if (typeof value === 'number') return value;
  const s = String(value == null ? '' : value).trim();
  if (!s) return 0;
  // Aceita 1.234,56 e 1234.56.
  const normalized = s.includes(',') ? s.replace(/\./g,'').replace(',','.') : s;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

function cleanPhone_(value) {
  return String(value || '').replace(/\D/g,'');
}

function rowToOS_(row, rowNumber) {
  const osNum = num_(row[C.OS - 1]);
  if (!osNum) return null;

  const os = {
    os: osNum,
    cliente: String(row[C.CLIENTE-1] || '').trim(),
    entrada: dateValue_(row[C.DATA_ENTRADA-1]),
    tel: cleanPhone_(row[C.TELEFONE-1]),
    setor: String(row[C.SETOR-1] || '').trim(),
    atendente: String(row[C.ATENDENTE-1] || '').trim(),
    entrega: dateValue_(row[C.ENTREGUE_EM-1]),
    itens: [],
    entradaTaxa: num_(row[C.ENTRADA_TAXA-1]),
    status: normStatus_(row[C.STATUS-1]),
    respTecnico: String(row[C.RESPONSAVEL_TECNICO-1] || '').trim(),
    dataAprovacao: dateValue_(row[C.DATA_APROVACAO-1]),
    valorTotal: num_(row[C.VALOR_TOTAL-1]),
    garantiasOrdem: String(row[C.GARANTIAS_ORDEM-1] || '').trim(),
    prevOrc: dateValue_(row[C.PREVISAO_ORCAMENTO-1]),
    prevOrcMin: num_(row[C.PREVISAO_MENOR_ORCAMENTO-1]),
    obs: '',
    linhaPlanilha: rowNumber,
  };

  ITEM_MAP.forEach(g => {
    const ap = String(row[g.item-1] || '').trim();
    const servico = String(row[g.servico-1] || '').trim();
    const historico = String(row[g.historico-1] || '').trim();
    const garantia = num_(row[g.garantia-1]);
    const valor = num_(row[g.valor-1]);
    if (ap || servico || historico || valor) {
      os.itens.push({ap, servico, historico, hist: historico || servico, val:valor, gar:garantia || 30});
    }
  });

  if (!os.valorTotal) os.valorTotal = os.itens.reduce((s,i)=>s + num_(i.val), 0);
  if (!os.itens.length) os.itens.push({ap:'',servico:'',historico:'',hist:'',val:0,gar:30});
  return os;
}

function readAllOS_() {
  const sh = getSheet_();
  const last = sh.getLastRow();
  if (last < CONFIG.LINHA_INICIO) return [];
  const rows = sh.getRange(CONFIG.LINHA_INICIO, 1, last-CONFIG.LINHA_INICIO+1, CONFIG.TOTAL_COLUNAS).getValues();
  return rows.map((r,i)=>rowToOS_(r, CONFIG.LINHA_INICIO+i)).filter(Boolean);
}

function findOSRow_(osNumber) {
  const sh = getSheet_();
  const last = sh.getLastRow();
  if (last < CONFIG.LINHA_INICIO) return 0;
  const vals = sh.getRange(CONFIG.LINHA_INICIO, C.OS, last-CONFIG.LINHA_INICIO+1, 1).getValues();
  const wanted = String(osNumber).trim();
  for (let i=0;i<vals.length;i++) {
    if (String(vals[i][0]).trim() === wanted) return CONFIG.LINHA_INICIO+i;
  }
  return 0;
}

// Geração centralizada: lê a maior O.S. existente e trava concorrência.
function gerarProximaOS() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sh = getSheet_();
    const last = sh.getLastRow();
    let maior = 0;
    if (last >= CONFIG.LINHA_INICIO) {
      const vals = sh.getRange(CONFIG.LINHA_INICIO, C.OS, last-CONFIG.LINHA_INICIO+1, 1).getValues();
      vals.forEach(r => { const n=num_(r[0]); if(n>maior) maior=n; });
    }
    // Compatibilidade com a numeração atual do sistema.
    if (maior < 3199) maior = 3199;
    return maior + 1;
  } finally {
    lock.releaseLock();
  }
}

function buildRow_(os, existingRow) {
  // Começa pela linha existente para preservar TODAS as colunas, inclusive 46–49.
  const row = existingRow ? existingRow.slice(0, CONFIG.TOTAL_COLUNAS) : new Array(CONFIG.TOTAL_COLUNAS).fill('');
  while (row.length < CONFIG.TOTAL_COLUNAS) row.push('');

  row[C.OS-1] = num_(os.os);
  row[C.CLIENTE-1] = os.cliente || '';
  row[C.DATA_ENTRADA-1] = os.entrada || '';
  row[C.TELEFONE-1] = os.tel || '';
  row[C.SETOR-1] = os.setor || '';
  row[C.ATENDENTE-1] = os.atendente || '';
  row[C.ENTREGUE_EM-1] = os.entrega || '';

  for (let i=0;i<6;i++) {
    const g=ITEM_MAP[i];
    const it=(os.itens||[])[i] || {};
    row[g.item-1] = it.ap || '';
    row[g.garantia-1] = it.gar == null ? '' : it.gar;
    row[g.servico-1] = it.servico || '';
    row[g.historico-1] = it.historico || it.hist || '';
    row[g.valor-1] = num_(it.val);
  }

  row[C.ENTRADA_TAXA-1] = num_(os.entradaTaxa);
  row[C.STATUS-1] = normStatus_(os.status);
  row[C.RESPONSAVEL_TECNICO-1] = os.respTecnico || '';
  row[C.DATA_APROVACAO-1] = os.dataAprovacao || '';

  const total = os.valorTotal != null && os.valorTotal !== ''
    ? num_(os.valorTotal)
    : (os.itens||[]).reduce((s,i)=>s+num_(i.val),0);
  row[C.VALOR_TOTAL-1] = total;
  row[C.GARANTIAS_ORDEM-1] = os.garantiasOrdem || '';
  row[C.PREVISAO_ORCAMENTO-1] = os.prevOrc || '';
  row[C.PREVISAO_MENOR_ORCAMENTO-1] = num_(os.prevOrcMin);

  // 46–49 permanecem exatamente como estavam em edição.
  return row;
}

function salvarOSNaPlanilha_(os, modo) {
  if (!os || !os.os) throw new Error('O.S. inválida.');
  const sh = getSheet_();
  const rowNumber = findOSRow_(os.os);
  const existing = rowNumber ? sh.getRange(rowNumber,1,1,CONFIG.TOTAL_COLUNAS).getValues()[0] : null;
  const row = buildRow_(os, existing);

  if (rowNumber) {
    sh.getRange(rowNumber,1,1,CONFIG.TOTAL_COLUNAS).setValues([row]);
    return {os:Number(os.os), linha:rowNumber, acao:'ATUALIZADA'};
  }

  // Se não veio número, não inventamos silenciosamente. O frontend deve pedir próximo número.
  sh.appendRow(row);
  return {os:Number(os.os), linha:sh.getLastRow(), acao:'CRIADA'};
}

function atualizarStatusPlanilha_(osNumber, status) {
  const sh=getSheet_();
  const row=findOSRow_(osNumber);
  if (!row) throw new Error(`O.S. #${osNumber} não encontrada na planilha.`);
  sh.getRange(row,C.STATUS).setValue(normStatus_(status));
  return {os:Number(osNumber),linha:row,status:normStatus_(status)};
}

function sincronizarClientesCadastro_(os) {
  if (!os || !os.cliente || !os.tel) return;
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  const sh=ss.getSheetByName(CONFIG.ABA_CLIENTES);
  if(!sh) return;
  const last=sh.getLastRow();
  if(last<2){ sh.getRange(2,1,1,4).setValues([[os.cliente,os.tel,os.setor,`OS #${os.os}`]]); return; }
  const vals=sh.getRange(2,1,last-1,2).getValues();
  const tel=cleanPhone_(os.tel);
  const exists=vals.some(r=>cleanPhone_(r[1])===tel);
  if(!exists) sh.getRange(last+1,1,1,4).setValues([[os.cliente,os.tel,os.setor,`OS #${os.os}`]]);
}

function doPost(e) {
  try {
    if(!e || !e.postData || !e.postData.contents) return err_('POST sem conteúdo.');
    const d=JSON.parse(e.postData.contents);

    if(d.acao==='proximoOS') return ok_({os:gerarProximaOS()});

    if(d.acao==='novaOS') {
      const os=Object.assign({}, d.os || {});
      if(!os.os) os.os=gerarProximaOS();
      const result=salvarOSNaPlanilha_(os,'CRIAR');
      try { sincronizarClientesCadastro_(os); } catch(e2) {}
      return ok_(result);
    }

    if(d.acao==='atualizarOS') {
      const result=salvarOSNaPlanilha_(d.os || {},'EDITAR');
      return ok_(result);
    }

    if(d.acao==='atualizarStatus') {
      return ok_(atualizarStatusPlanilha_(d.os,d.status));
    }

    return err_(`Ação desconhecida: ${d.acao}`);
  } catch(e) {
    console.error(e);
    return err_(e.message);
  }
}

function doGet(e) {
  try {
    const p=(e && e.parameter) || {};
    if(p.acao==='lista') return ok_({dados:readAllOS_(),total:readAllOS_().length,versao:'49COL-1.0'});
    if(p.acao==='proximoOS') return ok_({os:gerarProximaOS()});
    return ok_({status:'online',projeto:'Ponto dos Fogões',versao:'49COL-1.0',colunas:49,hora:new Date().toISOString()});
  } catch(e) { return err_(e.message); }
}

function sincronizarParaFirebase() {
  // Mantido como ponto de compatibilidade. A base oficial agora é a planilha.
  console.log(`Base oficial lida: ${readAllOS_().length} O.S.`);
}

function testarBase49() {
  const sh=getSheet_();
  const max=sh.getMaxColumns();
  if(max<49) throw new Error(`A aba possui apenas ${max} colunas. A base oficial exige 49.`);
  SpreadsheetApp.getUi().alert(`✅ Base encontrada.\nAba: ${CONFIG.ABA_OS}\nColunas disponíveis: ${max}\nMapa oficial: 49 colunas.`);
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('🔥 Ponto dos Fogões')
    .addItem('🧪 Testar base 49 colunas','testarBase49')
    .addItem('🔢 Testar próximo número O.S.','testarProximaOS')
    .addToUi();
}

function testarProximaOS(){ SpreadsheetApp.getUi().alert(`Próxima O.S.: #${gerarProximaOS()}`); }
