/**
 * HRU Quirófanos — Servicio del PORTAL DEL PACIENTE (versión 3.20)
 *
 * Qué hace: recibe los pedidos del portal que abre el QR del pase del paciente.
 *   · enviarPase    { token }                 → (3.20) manda el pase al correo del paciente, solo,
 *                                               apenas el cirujano lo genera (el correo lo lee de la base)
 *   · salud         { }                       → (3.20) responde si el servicio y el correo andan
 *   · pedirCodigo   { token, dniHuella }      → manda un código de un solo uso al correo del pase
 *   · validarCodigo { token, codigo }         → si es correcto, abre una sesión y devuelve el estado
 *   · estado        { token, sesion }         → devuelve el estado actual (el portal pregunta cada 30 s)
 *
 * El paciente NUNCA toca la base de Firebase: este script la lee con la cuenta de
 * Google de quien lo publica (que tiene que ser dueña o editora del proyecto
 * «incidencias-hru») y le devuelve solo la foto mínima de su cirugía.
 *
 * Protección de datos:
 *   · El código: 8 letras/números, vence a los 10 minutos, sirve una sola vez,
 *     5 intentos como máximo, y nunca se repite para el mismo pase.
 *   · Se guarda solo la huella (SHA-256) del código, nunca el código.
 *   · El correo no lleva nombre, DNI, cirugía ni diagnóstico: solo el código.
 *   · Máximo 5 códigos por hora por pase (evita que alguien llene de correos al paciente).
 *   · Si el pase caducó, no se manda nada.
 *
 * Publicación: ver PASO-A-PASO-publicar-3.19.0.md (Parte 3).
 */

var DB_URL = 'https://incidencias-hru-default-rtdb.firebaseio.com';
// La dirección de la app va fija acá: el enlace del correo nunca sale de lo que mande el navegador.
var APP_URL = 'https://claudioravasi-ai.github.io/ru-bloque-quir-rgico-incidencias/';
var VERSION = '3.20';
var MAX_PASES_HORA = 3;       // envíos del pase por hora y por pase
var CODIGO_MIN = 10;          // vigencia del código
var SESION_HORAS = 6;         // lo máximo que guarda CacheService
var MAX_CODIGOS_HORA = 5;
var MAX_INTENTOS = 5;
var ABC = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function doPost(e) {
  var datos = {};
  try { datos = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) { return responder({ error: 'formato' }); }
  if (datos.accion === 'salud') return responder(salud());
  var token = String(datos.token || '').replace(/[^A-Za-z0-9]/g, '');
  if (token.length < 20 || token.length > 40) return responder({ error: 'caducado' });
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (datos.accion === 'pedirCodigo') return responder(pedirCodigo(token, String(datos.dniHuella || '')));
    if (datos.accion === 'validarCodigo') return responder(validarCodigo(token, String(datos.codigo || '').toUpperCase()));
    if (datos.accion === 'estado') return responder(estado(token, String(datos.sesion || '')));
    if (datos.accion === 'enviarPase') return responder(enviarPase(token));
    return responder({ error: 'formato' });
  } catch (err) {
    console.error(err);
    // El detalle corto ayuda a saber qué falló (la base o el correo) sin abrir el registro.
    return responder({ error: 'red', det: String((err && err.message) || err).slice(0, 140) });
  } finally {
    lock.releaseLock();
  }
}
function doGet() {
  return ContentService.createTextOutput('Servicio del portal del paciente — HRU Quirófanos. Solo responde al portal.');
}

function pedirCodigo(token, dniHuella) {
  var foto = leer('portalPaciente/' + token);
  if (!foto || foto.caducado) return { error: 'caducado' };
  var priv = leer('portalPrivado/' + token);
  if (!priv || !priv.email) return { error: 'caducado' };
  if (!dniHuella || dniHuella !== priv.dniHuella) return { error: 'dni' };

  var cache = CacheService.getScriptCache();
  var claveLimite = 'lim_' + token;
  var n = Number(cache.get(claveLimite) || 0);
  if (n >= MAX_CODIGOS_HORA) return { error: 'limite' };
  cache.put(claveLimite, String(n + 1), 3600);

  var usados = usadosDe(token);
  var codigo, huella;
  do { codigo = azar(8); huella = sha256(codigo); } while (usados.indexOf(huella) >= 0);
  cache.put('otp_' + token, JSON.stringify({ h: huella, n: 0 }), CODIGO_MIN * 60);

  MailApp.sendEmail({
    to: priv.email,
    subject: 'Tu código de ingreso — Hospital Regional Ushuaia',
    htmlBody: '<div style="font-family:Arial,sans-serif;max-width:460px;margin:auto;color:#1f2937">'
      + '<div style="background:linear-gradient(120deg,#6d28d9,#ec4899,#f97316);color:#fff;border-radius:14px;padding:18px 20px">'
      + '<b style="font-size:18px">Mi cirugía · Hospital Regional Ushuaia</b></div>'
      + '<p style="font-size:15px">Tu código para ingresar es:</p>'
      + '<p style="font:bold 30px monospace;letter-spacing:6px;text-align:center;background:#f5f3ff;border-radius:12px;padding:14px;color:#4c1d95">' + codigo + '</p>'
      + '<p style="font-size:13px;color:#4b5563">Vence en ' + CODIGO_MIN + ' minutos y sirve para un solo ingreso. Si no lo pediste, ignorá este correo: sin el código nadie puede ver tu información.</p>'
      + '<p style="font-size:11px;color:#9ca3af">Mensaje automático. No respondas a este correo.</p></div>',
    body: 'Tu código para ingresar es ' + codigo + '. Vence en ' + CODIGO_MIN + ' minutos y sirve para un solo ingreso.',
    name: 'HRU Quirófanos',
  });
  return { ok: true, destino: enmascarar(priv.email) };
}

/* El pase, por correo. El correo del paciente sale de la base (portalPrivado), no del
   navegador: quien llama solo manda la llave del pase. El texto no lleva nombre, DNI,
   cirugía ni diagnóstico: solo el enlace y el código del pase. */
function enviarPase(token) {
  var foto = leer('portalPaciente/' + token);
  if (!foto) return { error: 'sinPase' };
  if (foto.caducado) return { error: 'caducado' };
  var priv = leer('portalPrivado/' + token);
  if (!priv || !priv.email) return { error: 'sinPase' };

  var cache = CacheService.getScriptCache();
  var clave = 'envp_' + token;
  var n = Number(cache.get(clave) || 0);
  if (n >= MAX_PASES_HORA) return { error: 'limite' };
  cache.put(clave, String(n + 1), 3600);

  var url = APP_URL + '?pase=' + token;
  // Cómo nombrar el turno: cirugía, estudio (endoscopía) o cesárea.
  var tipo = { endo: { n: 'estudio', s: 'Endoscopía', ok: 'autorizado y confirmado' }, ces: { n: 'cesárea', s: 'Obstetricia', ok: 'autorizada y confirmada' } }[foto.tipo]
    || { n: 'cirugía', s: 'Quirófanos', ok: 'autorizada y confirmada' };
  var ref = String(foto.ref || '').replace(/[^A-Za-z0-9-]/g, '');
  MailApp.sendEmail({
    to: priv.email,
    subject: 'Tu pase de ' + tipo.n + ' — Hospital Regional Ushuaia',
    htmlBody: '<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#1f2937">'
      + '<div style="background:linear-gradient(120deg,#6d28d9,#ec4899,#f97316);color:#fff;border-radius:16px;padding:22px 22px 20px">'
      + '<div style="font-size:12px;letter-spacing:2px;font-weight:bold;opacity:.9">PASE DEL PACIENTE</div>'
      + '<div style="font-size:21px;font-weight:bold;margin-top:4px">Seguí tu ' + tipo.n + ' en tiempo real</div>'
      + '<div style="font-size:13px;opacity:.95;margin-top:6px">Hospital Regional Ushuaia · ' + tipo.s + '</div></div>'
      + '<p style="font-size:15px;line-height:1.5">El hospital te generó un pase para que veas, desde tu teléfono, '
      + 'si tu ' + tipo.n + ' ya fue ' + tipo.ok + ', y para qué día y hora quedó.</p>'
      + '<p style="text-align:center;margin:22px 0"><a href="' + url + '" style="display:inline-block;background:#7c3aed;color:#fff;'
      + 'text-decoration:none;font-weight:bold;font-size:16px;padding:14px 26px;border-radius:12px">Abrir mi pase</a></p>'
      + '<ol style="font-size:14px;line-height:1.6;padding-left:20px;color:#374151">'
      + '<li>Tocá <b>Abrir mi pase</b>.</li><li>Escribí tu <b>DNI</b>.</li>'
      + '<li>Te llega a este correo un <b>código de un solo uso</b>: ingresalo y listo.</li></ol>'
      + (ref ? '<p style="font-size:13px;color:#4b5563">Código de tu pase: <b style="font-family:monospace">' + ref + '</b></p>' : '')
      + '<p style="font-size:12px;color:#6b7280;line-height:1.5">Ves solo tu ' + tipo.n + ', sin diagnóstico. Tus datos se usan únicamente para '
      + 'informarte el estado de tu ' + tipo.n + ' (Ley 25.326). El pase deja de funcionar cuando se cierra el turno.</p>'
      + '<p style="font-size:11px;color:#9ca3af">Si el botón no abre, copiá este enlace en el navegador: ' + url + '<br>'
      + 'Mensaje automático. No respondas a este correo.</p></div>',
    body: 'Tu pase para seguir tu ' + tipo.n + ' en el Hospital Regional Ushuaia: ' + url
      + ' — Abrilo, escribí tu DNI y te llega un código de un solo uso a este correo.',
    name: 'HRU Quirófanos',
  });
  return { ok: true, destino: enmascarar(priv.email) };
}

/* Para saber desde la app si el servicio está publicado y puede mandar correos. */
function salud() {
  try { return { ok: true, version: VERSION, correosHoy: MailApp.getRemainingDailyQuota() }; }
  catch (err) { return { error: 'correo', version: VERSION, det: String((err && err.message) || err).slice(0, 140) }; }
}

function validarCodigo(token, codigo) {
  var cache = CacheService.getScriptCache();
  var raw = cache.get('otp_' + token);
  if (!raw) return { error: 'codigo' };
  var otp = JSON.parse(raw);
  if (otp.n >= MAX_INTENTOS) { cache.remove('otp_' + token); return { error: 'intentos' }; }
  if (sha256(codigo) !== otp.h) {
    otp.n++;
    cache.put('otp_' + token, JSON.stringify(otp), CODIGO_MIN * 60);
    return { error: 'codigo' };
  }
  // Un solo uso: se borra y queda anotado como usado para que no se repita.
  cache.remove('otp_' + token);
  var usados = usadosDe(token);
  usados.push(otp.h);
  PropertiesService.getScriptProperties().setProperty('usados_' + token, JSON.stringify(usados.slice(-200)));

  var foto = leer('portalPaciente/' + token);
  if (!foto || foto.caducado) return { error: 'caducado' };
  var sesion = azar(32);
  cache.put('ses_' + sesion, token, SESION_HORAS * 3600);
  return { ok: true, sesion: sesion, foto: foto };
}

function estado(token, sesion) {
  var cache = CacheService.getScriptCache();
  if (!sesion || cache.get('ses_' + sesion) !== token) return { error: 'sesion' };
  var foto = leer('portalPaciente/' + token);
  if (!foto || foto.caducado) {
    cache.remove('ses_' + sesion);
    PropertiesService.getScriptProperties().deleteProperty('usados_' + token);
    return { error: 'caducado' };
  }
  return { ok: true, foto: foto };
}

/* ---- utilidades ---- */
function leer(ruta) {
  var r = UrlFetchApp.fetch(DB_URL + '/' + ruta + '.json', {
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true,
  });
  if (r.getResponseCode() !== 200) throw new Error('Base: ' + r.getResponseCode() + ' ' + r.getContentText());
  return JSON.parse(r.getContentText());
}
function usadosDe(token) {
  try { return JSON.parse(PropertiesService.getScriptProperties().getProperty('usados_' + token) || '[]'); } catch (e) { return []; }
}
/* Azar criptográfico: los UUID v4 de Apps Script salen de un generador seguro. */
function azar(n) {
  var hex = '';
  while (hex.length < n * 2) {
    // Se descartan los dos dígitos fijos del UUID v4 (versión y variante).
    var u = Utilities.getUuid().replace(/-/g, '');
    hex += u.slice(0, 12) + u.slice(13, 16) + u.slice(17);
  }
  var s = '';
  for (var i = 0; i < n; i++) s += ABC.charAt(parseInt(hex.substr(i * 2, 2), 16) % ABC.length);
  return s;
}
function sha256(t) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(t), Utilities.Charset.UTF_8)
    .map(function (b) { return ((b + 256) % 256).toString(16); })
    .map(function (x) { return x.length < 2 ? '0' + x : x; }).join('');
}
function enmascarar(m) {
  var p = String(m).split('@');
  if (p.length !== 2) return 'tu correo';
  var r = Math.max(2, Math.min(6, p[0].length - 2));
  return p[0].slice(0, 2) + new Array(r + 1).join('•') + '@' + p[1];
}
function responder(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* Para probar desde el editor que el script puede mandar correos: ▶ Ejecutar «probarCorreo».
   Se manda un correo de prueba a la propia cuenta dueña del script. */
function probarCorreo() {
  MailApp.sendEmail(Session.getEffectiveUser().getEmail(), 'Prueba — servicio del portal HRU', 'El servicio puede mandar correos. Quedan '
    + MailApp.getRemainingDailyQuota() + ' envíos por hoy.');
  Logger.log('Correo de prueba enviado. Quedan ' + MailApp.getRemainingDailyQuota() + ' envíos por hoy.');
}

/* Para probar desde el editor que el script puede leer la base: ▶ Ejecutar «probarLectura». */
function probarLectura() {
  var r = UrlFetchApp.fetch(DB_URL + '/portalPaciente.json?shallow=true', {
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true,
  });
  Logger.log(r.getResponseCode() + ' ' + r.getContentText().slice(0, 200));
}
