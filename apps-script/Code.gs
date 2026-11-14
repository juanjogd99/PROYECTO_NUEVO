/**
 * TEXTILES MYRIAM — Conexión entre la página web (Caja) y Google Sheets.
 *
 * Dos claves:
 *   - PIN_EQUIPO: la usan las personas de la caja. Solo ven y registran los movimientos de HOY
 *                 y consultan la lista de precios. No ven el balance ni las cuentas privadas.
 *   - PIN_DUENA:  solo la dueña. Ve todo, edita cualquier movimiento, cambia los precios
 *                 y lleva sus cuentas privadas (pestaña PRIVADO).
 *
 * Instalación (ver README.md):
 *   1. En tu Google Sheet: Extensiones → Apps Script. Pega este archivo completo.
 *   2. Cambia los dos PIN de abajo. Guarda.
 *   3. Ejecuta la función `instalar` una vez (acepta los permisos).
 *   4. Implementar → Nueva implementación → Aplicación web
 *        Ejecutar como: Yo   ·   Quién tiene acceso: Cualquier persona
 *   5. Copia la URL que termina en /exec y pégala en la página (Caja → Ajustes).
 *
 * Importante: comparte el Google Sheet SOLO con la dueña. El equipo entra por la página.
 */

const PIN_EQUIPO = '1234'; // ← CÁMBIALO. Clave de la caja (equipo).
const PIN_DUENA = '2026';  // ← CÁMBIALO. Clave privada de la dueña. Debe ser distinta.

const HOJA = 'MOVIMIENTOS';
const HOJA_PRIVADO = 'PRIVADO';
const HOJA_PRECIOS = 'PRECIOS';
const HOJA_BALANCE = 'BALANCE';
const COLUMNAS = ['ID', 'FECHA', 'TIPO', 'CATEGORIA', 'CONCEPTO', 'CANTIDAD', 'VALOR_UNITARIO', 'TOTAL', 'FORMA_PAGO', 'ASESOR', 'NOTA', 'ORIGEN', 'ACTUALIZADO'];
const CAMPOS = ['id', 'fecha', 'tipo', 'categoria', 'concepto', 'cantidad', 'valor', 'total', 'forma', 'asesor', 'nota', 'origen', 'actualizado'];
const COLUMNAS_PRECIOS = ['PRODUCTO', 'UNIDAD', 'PRECIO_DETAL', 'MAYOR_DESDE', 'PRECIO_MAYOR'];
const CAMPOS_PRECIOS = ['producto', 'unidad', 'precio', 'mayorDesde', 'precioMayor'];

/* ───────────────────────── Instalación ───────────────────────── */

function instalar() {
  const ss = SpreadsheetApp.getActive();
  [HOJA, HOJA_PRIVADO].forEach(function (nombre, i) {
    let sh = ss.getSheetByName(nombre);
    if (!sh) sh = ss.insertSheet(nombre, i);
    encabezado_(sh, COLUMNAS);
    sh.getRange('B:B').setNumberFormat('yyyy-mm-dd');
    sh.getRange('F:F').setNumberFormat('0.##');
    sh.getRange('G:H').setNumberFormat('$#,##0');
    sh.getRange('M:M').setNumberFormat('yyyy-mm-dd hh:mm');
    sh.setColumnWidth(5, 220);
    const tipo = SpreadsheetApp.newDataValidation().requireValueInList(['Ingreso', 'Egreso'], true).build();
    sh.getRange('C2:C').setDataValidation(tipo);
  });
  let pr = ss.getSheetByName(HOJA_PRECIOS);
  if (!pr) {
    pr = ss.insertSheet(HOJA_PRECIOS);
    encabezado_(pr, COLUMNAS_PRECIOS);
    pr.getRange('C:C').setNumberFormat('$#,##0');
    pr.getRange('E:E').setNumberFormat('$#,##0');
    pr.setColumnWidth(1, 220);
  }
  crearBalance_(ss);
  ss.toast('Listo. Ahora: Implementar → Nueva implementación → Aplicación web.', 'Textiles Myriam', 8);
}

function encabezado_(sh, cols) {
  sh.getRange(1, 1, 1, cols.length).setValues([cols])
    .setFontWeight('bold').setBackground('#1d1a16').setFontColor('#f4eee4');
  sh.setFrozenRows(1);
}

/** Pestaña BALANCE con fórmulas. Si ya existe (por ejemplo, la de la plantilla), se respeta tal cual. */
function crearBalance_(ss) {
  if (ss.getSheetByName(HOJA_BALANCE)) return;
  const b = ss.insertSheet(HOJA_BALANCE, 1);
  const M = HOJA + '!';
  const rows = [
    ['TEXTILES MYRIAM — BALANCE DE CAJA', ''],
    ['Ingresos', '=SUMIF(' + M + 'C:C,"Ingreso",' + M + 'H:H)'],
    ['Egresos', '=SUMIF(' + M + 'C:C,"Egreso",' + M + 'H:H)'],
    ['Saldo neto de caja', '=B2-B3'],
  ];
  b.getRange(1, 1, rows.length, 2).setValues(rows);
  b.getRange('B2:B4').setNumberFormat('$#,##0');
  b.getRange('A1').setFontWeight('bold');
}

/* ───────────────────────── Web App ───────────────────────── */

function doGet(e) {
  return responder_(function () {
    const p = (e && e.parameter) || {};
    const rol = rol_(p.pin);
    if (p.action && p.action !== 'list') throw new Error('Acción desconocida');
    const hoy = hoy_();
    const rows = leer_(HOJA);
    const out = {
      rol: rol,
      rows: rol === 'duena' ? rows : rows.filter(function (r) { return r.fecha === hoy; }),
      precios: leerPrecios_(),
    };
    if (rol === 'duena') out.privados = leer_(HOJA_PRIVADO);
    return out;
  });
}

function doPost(e) {
  return responder_(function () {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const rol = rol_(body.pin);
    if (body.action === 'ping') return { rol: rol };
    const hoja = body.hoja === 'privado' ? HOJA_PRIVADO : HOJA;
    if ((hoja === HOJA_PRIVADO || body.action === 'precios') && rol !== 'duena') throw new Error('SIN_PERMISO');
    const lock = LockService.getDocumentLock();
    lock.waitLock(20000); // dos cajas guardando a la vez no se pisan
    try {
      if (body.action === 'upsert') return { saved: upsert_(hoja, body.rows || [], rol) };
      if (body.action === 'delete') return { deleted: borrar_(hoja, body.ids || [], rol) };
      if (body.action === 'precios') return { saved: guardarPrecios_(body.precios || []) };
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

function rol_(pin) {
  const p = String(pin || '');
  if (p && p === String(PIN_DUENA)) return 'duena';
  if (p && p === String(PIN_EQUIPO)) return 'equipo';
  throw new Error('PIN_INVALIDO');
}

function hoy_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function hoja_(nombre) {
  const sh = SpreadsheetApp.getActive().getSheetByName(nombre);
  if (!sh) throw new Error('Falta la pestaña ' + nombre + ': ejecuta la función instalar()');
  return sh;
}

function aTexto_(f, tz) {
  return f instanceof Date ? Utilities.formatDate(f, tz, 'yyyy-MM-dd') : String(f || '').slice(0, 10);
}

function leer_(nombre) {
  const sh = hoja_(nombre);
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
    r.fecha = aTexto_(r.fecha, tz);
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

function leerPrecios_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(HOJA_PRECIOS);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, CAMPOS_PRECIOS.length).getValues()
    .filter(function (v) { return String(v[0]).trim(); })
    .map(function (v) {
      const r = {};
      CAMPOS_PRECIOS.forEach(function (c, j) { r[c] = v[j]; });
      return r;
    });
}

function guardarPrecios_(lista) {
  const sh = hoja_(HOJA_PRECIOS);
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, CAMPOS_PRECIOS.length).clearContent();
  const filas = lista
    .filter(function (p) { return String(p.producto || '').trim(); })
    .map(function (p) {
      return [String(p.producto).trim(), p.unidad === 'unidad' ? 'unidad' : 'metro', Number(p.precio) || 0, Number(p.mayorDesde) || '', Number(p.precioMayor) || ''];
    });
  if (filas.length) sh.getRange(2, 1, filas.length, CAMPOS_PRECIOS.length).setValues(filas);
  return filas.length;
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

/** ID → { fila, fecha } de lo que ya está en la hoja. */
function indice_(sh) {
  const last = sh.getLastRow();
  const index = {};
  if (last < 2) return index;
  const tz = Session.getScriptTimeZone();
  sh.getRange(2, 1, last - 1, 2).getValues().forEach(function (v, i) {
    if (v[0]) index[String(v[0])] = { fila: i + 2, fecha: aTexto_(v[1], tz) };
  });
  return index;
}

function upsert_(nombre, rows, rol) {
  if (!rows.length) return 0;
  const sh = hoja_(nombre);
  const index = indice_(sh);
  const hoy = hoy_();
  // El equipo solo puede registrar o corregir movimientos de hoy
  if (rol !== 'duena') {
    rows.forEach(function (r) {
      const prev = index[String(r.id)];
      if (String(r.fecha).slice(0, 10) !== hoy || (prev && prev.fecha !== hoy)) throw new Error('SOLO_HOY');
    });
  }
  const ahora = new Date();
  const nuevas = [];
  rows.forEach(function (r) {
    const fila = aFila_(r, ahora);
    const prev = index[String(r.id)];
    if (prev) sh.getRange(prev.fila, 1, 1, fila.length).setValues([fila]);
    else nuevas.push(fila);
  });
  if (nuevas.length) sh.getRange(sh.getLastRow() + 1, 1, nuevas.length, COLUMNAS.length).setValues(nuevas);
  return rows.length;
}

function borrar_(nombre, ids, rol) {
  const sh = hoja_(nombre);
  const index = indice_(sh);
  const hoy = hoy_();
  const filas = [];
  ids.forEach(function (id) {
    const prev = index[String(id)];
    if (!prev) return;
    if (rol !== 'duena' && prev.fecha !== hoy) throw new Error('SOLO_HOY');
    filas.push(prev.fila);
  });
  filas.sort(function (a, b) { return b - a; }).forEach(function (f) { sh.deleteRow(f); }); // de abajo hacia arriba
  return filas.length;
}
