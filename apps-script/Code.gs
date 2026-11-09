/**
 * TEXTILES MYRIAM — Conexión entre la página web (Caja) y Google Sheets.
 *
 * Instalación (5 minutos, ver README.md):
 *   1. En tu Google Sheet: Extensiones → Apps Script. Pega este archivo completo.
 *   2. Cambia el PIN de abajo. Guarda.
 *   3. Ejecuta la función `instalar` una vez (acepta los permisos).
 *   4. Implementar → Nueva implementación → Aplicación web
 *        Ejecutar como: Yo   ·   Quién tiene acceso: Cualquier persona
 *   5. Copia la URL que termina en /exec y pégala en la página (Caja → Ajustes).
 *
 * Tus pestañas originales (Semana 1…4) no se tocan.
 */

const PIN = '1234'; // ← CÁMBIALO. Es la clave para entrar a la Caja.
const HOJA = 'MOVIMIENTOS';
const HOJA_BALANCE = 'BALANCE';
const COLUMNAS = ['ID', 'FECHA', 'TIPO', 'CATEGORIA', 'CONCEPTO', 'CANTIDAD', 'VALOR_UNITARIO', 'TOTAL', 'FORMA_PAGO', 'ASESOR', 'NOTA', 'ORIGEN', 'ACTUALIZADO'];
const CAMPOS = ['id', 'fecha', 'tipo', 'categoria', 'concepto', 'cantidad', 'valor', 'total', 'forma', 'asesor', 'nota', 'origen', 'actualizado'];

/* ───────────────────────── Instalación ───────────────────────── */

function instalar() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(HOJA);
  if (!sh) sh = ss.insertSheet(HOJA, 0);
  sh.getRange(1, 1, 1, COLUMNAS.length).setValues([COLUMNAS])
    .setFontWeight('bold').setBackground('#1d1a16').setFontColor('#f4eee4');
  sh.setFrozenRows(1);
  sh.getRange('B:B').setNumberFormat('yyyy-mm-dd');
  sh.getRange('F:F').setNumberFormat('0.##');
  sh.getRange('G:H').setNumberFormat('$#,##0');
  sh.getRange('M:M').setNumberFormat('yyyy-mm-dd hh:mm');
  sh.setColumnWidth(5, 220);

  // Validaciones para quien escriba directo en el Sheet
  const tipo = SpreadsheetApp.newDataValidation().requireValueInList(['Ingreso', 'Egreso'], true).build();
  sh.getRange('C2:C').setDataValidation(tipo);
  const forma = SpreadsheetApp.newDataValidation().requireValueInList(['Efectivo', 'Transferencia', 'Tarjeta', 'Nequi', 'QR'], true).setAllowInvalid(true).build();
  sh.getRange('I2:I').setDataValidation(forma);

  crearBalance_(ss);
  ss.toast('Listo. Ahora: Implementar → Nueva implementación → Aplicación web.', 'Textiles Myriam', 8);
}

/** Pestaña BALANCE con fórmulas: se actualiza sola con cada movimiento. */
function crearBalance_(ss) {
  // Si ya existe (por ejemplo, la plantilla de Excel), se respeta tal cual.
  if (ss.getSheetByName(HOJA_BALANCE)) return;
  const b = ss.insertSheet(HOJA_BALANCE, 1);
  const M = HOJA + '!';
  const rows = [
    ['TEXTILES MYRIAM — BALANCE DE CAJA', ''],
    ['Desde', '=IFERROR(MIN(' + M + 'B2:B),"")'],
    ['Hasta', '=IFERROR(MAX(' + M + 'B2:B),"")'],
    ['', ''],
    ['Ingresos', '=SUMIF(' + M + 'C2:C,"Ingreso",' + M + 'H2:H)'],
    ['Egresos', '=SUMIF(' + M + 'C2:C,"Egreso",' + M + 'H2:H)'],
    ['Saldo neto de caja', '=B5-B6'],
    ['Nº de ventas', '=COUNTIF(' + M + 'C2:C,"Ingreso")'],
    ['Ticket promedio', '=IFERROR(B5/B8,0)'],
    ['', ''],
    ['INGRESOS POR FORMA DE PAGO', ''],
    ['Efectivo', '=SUMIFS(' + M + 'H2:H,' + M + 'C2:C,"Ingreso",' + M + 'I2:I,"Efectivo")'],
    ['Transferencia', '=SUMIFS(' + M + 'H2:H,' + M + 'C2:C,"Ingreso",' + M + 'I2:I,"Transferencia")'],
    ['Tarjeta', '=SUMIFS(' + M + 'H2:H,' + M + 'C2:C,"Ingreso",' + M + 'I2:I,"Tarjeta")'],
    ['Nequi', '=SUMIFS(' + M + 'H2:H,' + M + 'C2:C,"Ingreso",' + M + 'I2:I,"Nequi")'],
    ['QR', '=SUMIFS(' + M + 'H2:H,' + M + 'C2:C,"Ingreso",' + M + 'I2:I,"QR")'],
    ['', ''],
    ['EGRESOS POR CATEGORÍA', ''],
    ['Compra de mercancía', '=SUMIFS(' + M + 'H2:H,' + M + 'C2:C,"Egreso",' + M + 'D2:D,"Compra de mercancía")'],
    ['Gasto operativo', '=SUMIFS(' + M + 'H2:H,' + M + 'C2:C,"Egreso",' + M + 'D2:D,"Gasto operativo")'],
    ['Nómina', '=SUMIFS(' + M + 'H2:H,' + M + 'C2:C,"Egreso",' + M + 'D2:D,"Nómina")'],
    ['Arriendo y servicios', '=SUMIFS(' + M + 'H2:H,' + M + 'C2:C,"Egreso",' + M + 'D2:D,"Arriendo y servicios")'],
    ['Retiro del dueño', '=SUMIFS(' + M + 'H2:H,' + M + 'C2:C,"Egreso",' + M + 'D2:D,"Retiro del dueño")'],
    ['Otro egreso', '=SUMIFS(' + M + 'H2:H,' + M + 'C2:C,"Egreso",' + M + 'D2:D,"Otro egreso")'],
  ];
  b.getRange(1, 1, rows.length, 2).setValues(rows);
  b.getRange('A1').setFontWeight('bold').setFontSize(14);
  b.getRange('A11').setFontWeight('bold');
  b.getRange('A18').setFontWeight('bold');
  b.getRange('A7:B7').setFontWeight('bold');
  b.getRange('B2:B3').setNumberFormat('yyyy-mm-dd');
  b.getRange('B5:B7').setNumberFormat('$#,##0');
  b.getRange('B9').setNumberFormat('$#,##0');
  b.getRange('B12:B24').setNumberFormat('$#,##0');
  b.setColumnWidth(1, 240);
  b.setColumnWidth(2, 160);
}

/* ───────────────────────── Web App ───────────────────────── */

function doGet(e) {
  return responder_(function () {
    const p = (e && e.parameter) || {};
    verificarPin_(p.pin);
    if (p.action === 'list' || !p.action) return { rows: leer_() };
    throw new Error('Acción desconocida');
  });
}

function doPost(e) {
  return responder_(function () {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    verificarPin_(body.pin);
    if (body.action === 'ping') return {};
    const lock = LockService.getDocumentLock();
    lock.waitLock(20000); // dos cajas guardando a la vez no se pisan
    try {
      if (body.action === 'upsert') return { saved: upsert_(body.rows || []) };
      if (body.action === 'delete') return { deleted: borrar_(body.ids || []) };
    } finally {
      lock.releaseLock();
    }
    throw new Error('Acción desconocida');
  });
}

function responder_(fn) {
  let out;
  try {
    out = Object.assign({ ok: true }, fn());
  } catch (err) {
    out = { ok: false, error: String(err && err.message ? err.message : err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function verificarPin_(pin) {
  if (String(pin || '') !== String(PIN)) throw new Error('PIN_INVALIDO');
}

function hoja_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(HOJA);
  if (!sh) throw new Error('Falta la pestaña MOVIMIENTOS: ejecuta la función instalar()');
  return sh;
}

function leer_() {
  const sh = hoja_();
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  const tz = Session.getScriptTimeZone();
  const values = sh.getRange(2, 1, n, CAMPOS.length).getValues();
  const out = [];
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (!v[1] && !v[7]) continue; // fila vacía
    const r = {};
    CAMPOS.forEach(function (c, j) { r[c] = v[j]; });
    if (r.fecha instanceof Date) r.fecha = Utilities.formatDate(r.fecha, tz, 'yyyy-MM-dd');
    if (!r.id) { // fila escrita a mano en el Sheet: le damos ID para poder editarla
      r.id = 'S-' + (i + 2) + '-' + Utilities.getUuid().slice(0, 6);
      sh.getRange(i + 2, 1).setValue(r.id);
      r.origen = r.origen || 'sheet';
    }
    delete r.actualizado;
    out.push(r);
  }
  return out;
}

function aFila_(r, ahora) {
  const f = String(r.fecha || '').split('-');
  const fecha = f.length === 3 ? new Date(Number(f[0]), Number(f[1]) - 1, Number(f[2])) : '';
  const cantidad = Number(r.cantidad) || 1;
  const valor = Number(r.valor) || 0;
  return [
    String(r.id), fecha, r.tipo === 'Egreso' ? 'Egreso' : 'Ingreso', r.categoria || '', r.concepto || '',
    cantidad, valor, Number(r.total) || Math.round(cantidad * valor), r.forma || 'Efectivo',
    r.asesor || '', r.nota || '', r.origen || 'app', ahora,
  ];
}

function upsert_(rows) {
  if (!rows.length) return 0;
  const sh = hoja_();
  const last = sh.getLastRow();
  const ids = last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues().map(function (x) { return String(x[0]); }) : [];
  const index = {};
  ids.forEach(function (id, i) { if (id) index[id] = i + 2; });
  const ahora = new Date();
  const nuevas = [];
  rows.forEach(function (r) {
    const fila = aFila_(r, ahora);
    const at = index[String(r.id)];
    if (at) sh.getRange(at, 1, 1, fila.length).setValues([fila]);
    else nuevas.push(fila);
  });
  if (nuevas.length) sh.getRange(sh.getLastRow() + 1, 1, nuevas.length, COLUMNAS.length).setValues(nuevas);
  return rows.length;
}

function borrar_(ids) {
  const sh = hoja_();
  const last = sh.getLastRow();
  if (last < 2) return 0;
  const set = {};
  ids.forEach(function (id) { set[String(id)] = true; });
  const col = sh.getRange(2, 1, last - 1, 1).getValues();
  let n = 0;
  for (let i = col.length - 1; i >= 0; i--) { // de abajo hacia arriba para no correr filas
    if (set[String(col[i][0])]) { sh.deleteRow(i + 2); n++; }
  }
  return n;
}
