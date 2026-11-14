/* ===================== ORDEN DE AUTORIZACIÓN (R/P) — 3.49.0 =====================
   Módulo aparte que se engancha a la app (se carga al final de index.html).
   El médico arma y firma la orden desde la ficha del turno; Admisión la ve en
   Ingresos, la manda a la obra social y carga el N.º de autorización; el paciente
   la ve en su pase (Ver · PDF · Compartir). Si cambia la fecha, la hora, la sala o
   el procedimiento después de firmada, la orden se anula sola y sale otra versión. */

const OA_ANEST = ['General', 'Raquídea', 'Peridural', 'Local', 'Sedación', 'Combinada', 'Sin anestesia'];
const OA_GEST = {
  adm: ['Admisión y Egresos', 'Admisión y Egresos le manda la orden a la obra social. El paciente no tiene que hacer nada: igual la ve en su pase.'],
  pac: ['El paciente', 'La obra social exige que la presente el afiliado (en su delegación o su app). Admisión controla que vuelva autorizada antes del turno.'],
  amb: ['Los dos', 'Admisión la manda a la obra social y el paciente también la tiene lista, por si su obra social se la pide a él.'],
};
const OA_JS = ['https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js'];

/* ---------- estilos ---------- */
(function oaEstilos() {
  const s = document.createElement('style');
  s.id = 'oa-css';
  s.textContent = `
.oa-hoja{width:794px;background:#fff;position:relative;padding:0 0 16px;color:#0f2a3a;font:13px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;box-shadow:0 10px 40px rgba(15,42,58,.15);border-radius:4px;overflow:hidden;text-align:left}
.oa-hoja *{box-sizing:border-box}
.oa-top{display:grid;grid-template-columns:1fr auto;gap:16px;padding:22px 34px 16px;background:linear-gradient(120deg,#0e7c66 0%,#0f2a3a 100%);color:#fff;position:relative}
.oa-top::after{content:"";position:absolute;inset:auto 0 0 0;height:6px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.35) 0 18px,transparent 18px 26px)}
.oa-inst{display:flex;gap:14px;align-items:center}
.oa-logo{width:52px;height:52px;border-radius:14px;background:rgba(255,255,255,.15);display:grid;place-items:center;font:800 18px Georgia,serif;border:1.5px solid rgba(255,255,255,.4)}
.oa-inst b{display:block;font:700 18px Georgia,serif}.oa-inst small{opacity:.85;font-size:12px}
.oa-tipo{text-align:right}.oa-tipo .t{font-weight:600;font-size:11px;letter-spacing:2px;text-transform:uppercase;opacity:.85}
.oa-tipo .n{font:700 22px Georgia,serif;margin-top:2px}.oa-tipo .c{font-size:11px;opacity:.85;margin-top:4px}
.oa-cuerpo{padding:16px 34px 0}
.oa-sec{display:grid;grid-template-columns:34px 1fr;gap:12px;margin-bottom:9px}
.oa-num{width:30px;height:30px;border-radius:50%;background:#e3f4ef;color:#0e7c66;font-weight:700;display:grid;place-items:center;margin-top:2px}
.oa-sec h3{margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#0e7c66}
.oa-caja{border:1px solid #d9e3e8;border-radius:12px;padding:8px 14px}
.oa-grilla{display:grid;grid-template-columns:repeat(4,1fr);gap:8px 16px}
.oa-grilla small{display:block;color:#6b8494;font-size:10.5px;text-transform:uppercase;letter-spacing:.6px}
.oa-grilla b{font-weight:600;font-size:13.5px}.oa-s2{grid-column:span 2}
.oa-falta{color:#b42318}
.oa-dest{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.oa-dest>div{border-left:4px solid #0e7c66;background:#f7faf9;border-radius:8px;padding:8px 12px;font-size:12.5px}.oa-dest b{display:block;font-size:13px}
.oa-dx{display:flex;gap:12px;align-items:center}.oa-dx .cie{font-weight:700;background:#0f2a3a;color:#fff;border-radius:8px;padding:6px 10px;white-space:nowrap}.oa-dx b{font-size:15px}
.oa-rp{display:grid;grid-template-columns:auto 1fr;gap:18px;align-items:start;background:linear-gradient(180deg,#fbfdfc,#f3f8f6);border:1.5px solid #0e7c66;border-radius:16px;padding:12px 18px}
.oa-glifo{font:700 54px/.9 Georgia,serif;color:#0e7c66;letter-spacing:-2px}.oa-glifo small{display:block;font:600 10px system-ui;letter-spacing:1.5px;color:#6b8494;margin-top:6px;text-align:center}
.oa-ped{font-size:14px;line-height:1.55}.oa-ped .p{font:700 19px Georgia,serif;display:block;margin:4px 0 6px}.oa-ped .a{color:#3b5566}
.oa-an{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.oa-an span{border:1px solid #d9e3e8;border-radius:999px;padding:4px 10px;font-size:11.5px;color:#9aa9b2;display:inline-flex;gap:6px;align-items:center}
.oa-an span i{width:11px;height:11px;border-radius:3px;border:1.5px solid #b9c7cf;display:inline-block}
.oa-an span.si{border-color:#0e7c66;color:#0e7c66;background:#e3f4ef;font-weight:600}.oa-an span.si i{background:#0e7c66;border-color:#0e7c66;box-shadow:inset 0 0 0 2px #fff}
.oa-fe{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
.oa-fe>div{border:1px solid #d9e3e8;border-radius:12px;padding:10px 12px}.oa-fe small{display:block;color:#6b8494;font-size:10.5px;text-transform:uppercase;letter-spacing:.6px}
.oa-fe b{font:700 16px Georgia,serif}.oa-fe .prog{border-color:#0e7c66;background:#e3f4ef}
.oa-obs{font-size:12.5px;color:#3b5566;white-space:pre-line}
.oa-firma{display:grid;grid-template-columns:1fr 132px;gap:18px;align-items:end;margin:4px 34px 0 80px;padding:12px 18px;border:1px solid #d9e3e8;border-radius:16px}
.oa-rub{font:italic 500 30px/1 Georgia,serif;color:#1d3a8a;transform:rotate(-4deg);display:inline-block;margin:2px 0 8px}
.oa-rubimg{height:64px;max-width:260px;object-fit:contain;display:block;margin:0 0 4px}
.oa-lin{border-top:1px solid #0f2a3a;padding-top:6px;font-size:12.5px}.oa-lin b{font-size:13.5px}
.oa-ver{margin-top:10px;font-size:10.5px;color:#3b5566;background:#f4f8fb;border-radius:8px;padding:8px 10px;line-height:1.45}.oa-ver b{color:#0e7c66}
.oa-qr{text-align:center;font-size:9.5px;color:#6b8494}.oa-qr svg{width:118px;height:118px}
.oa-pie{margin:12px 34px 0;display:flex;justify-content:space-between;gap:12px;font-size:9.5px;color:#6b8494;border-top:1px solid #d9e3e8;padding-top:6px}
.oa-cinta{position:absolute;top:400px;left:-60px;right:-60px;transform:rotate(-24deg);text-align:center;font:800 64px system-ui;letter-spacing:10px;color:rgba(180,35,24,.18);border-top:4px solid rgba(180,35,24,.18);border-bottom:4px solid rgba(180,35,24,.18);pointer-events:none;z-index:5}
.oa-cinta small{display:block;font:700 15px system-ui;letter-spacing:3px}.oa-cinta.borr{color:rgba(183,121,31,.22);border-color:rgba(183,121,31,.22)}
.oa-esc{overflow:hidden}.oa-esc>.oa-hoja{transform-origin:top left}
/* ventana de la orden */
#oa-ov .modal{max-width:1180px;width:100%;padding:22px 22px 18px}
.oa-ed{display:grid;grid-template-columns:minmax(0,420px) minmax(0,1fr);gap:18px;align-items:start}
.oa-ed .field{margin-bottom:10px}
.oa-ed textarea,.oa-ed input{width:100%;font-size:16px}
.oa-dos{display:grid;grid-template-columns:1fr 110px;gap:8px}.oa-par{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.oa-ops{display:flex;flex-wrap:wrap;gap:6px}
.oa-ops button{border:1.5px solid var(--line,#d9e3e8);background:#fff;border-radius:999px;padding:9px 13px;font:inherit;font-size:.9rem;min-height:42px;color:#334155;cursor:pointer}
.oa-ops button.on{border-color:#0e7c66;background:#e3f4ef;color:#0e7c66;font-weight:700}
.oa-ops button:disabled{opacity:.55;cursor:not-allowed}
.oa-ayuda{font-size:.82rem;color:#475569;background:#f6f9fa;border-radius:10px;padding:8px 10px;margin-top:6px}
.oa-blq{border-top:1px solid var(--line,#e2e8f0);margin-top:14px;padding-top:10px}
.oa-blq h5{margin:0 0 4px;font-size:.98rem}
.oa-pad{position:relative;border:1.5px dashed #9fb6c2;border-radius:12px;background:#fbfdfe;overflow:hidden;margin-top:6px}
.oa-pad canvas{width:100%;height:120px;display:block;touch-action:none;cursor:crosshair}
.oa-pad span{position:absolute;inset:0;display:grid;place-items:center;color:#9fb0ba;font-size:.9rem;pointer-events:none}
.oa-mif{display:flex;gap:10px;align-items:center;background:#f6f9fa;border-radius:12px;padding:8px 10px;margin-top:6px;font-size:.84rem;color:#475569}
.oa-mif img{height:42px;max-width:170px;object-fit:contain;background:#fff;border-radius:6px}
.oa-est{border-radius:12px;padding:10px 12px;font-weight:700;margin-top:10px;font-size:.9rem}
.oa-est.ok{background:#dcfce7;color:#166534}.oa-est.am{background:#fef3c7;color:#92400e}.oa-est.az{background:#dbeafe;color:#1e40af}.oa-est.ro{background:#fee2e2;color:#991b1b}
.oa-vers{margin-top:8px}.oa-vers div{display:flex;justify-content:space-between;gap:8px;align-items:center;border:1px solid var(--line,#e2e8f0);border-radius:10px;padding:8px 10px;margin-top:6px;font-size:.84rem}
.oa-vers small{display:block;color:#64748b}
.oa-pasos{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 4px}
.oa-pasos span{flex:1 1 110px;text-align:center;font-size:.76rem;font-weight:700;border-radius:10px;padding:7px 6px;background:#f1f5f9;color:#94a3b8}
.oa-pasos span.h{background:#dcfce7;color:#166534}.oa-pasos span.ya{background:#dbeafe;color:#1e40af;box-shadow:inset 0 0 0 2px #93c5fd}
.oa-adm{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center}
.oa-adm input{flex:1 1 180px;font-size:16px;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line,#cbd5e1)}
.oa-sticky{position:sticky;top:0}
.oa-ing-acc{display:flex;flex-wrap:wrap;gap:6px;width:100%;max-width:320px}
.oa-ing-acc .btn{flex:1 1 auto;justify-content:center}
.oa-qr img{width:118px;height:118px;image-rendering:pixelated;display:block;margin:0 auto}
#oa-ficha h4{padding-right:46px;flex-wrap:wrap}
#oa-modal>h3{padding-right:48px}
@media (max-width:980px){.oa-ed{grid-template-columns:1fr}.oa-sticky{position:static}}
/* en el pase del paciente (mismo idioma visual del pase) */
.pp-oa{border:2px solid #99f6e4;display:grid;gap:6px}
.pp-oa>small{font-size:.68rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#0d9488}
.pp-oa>b{font-size:1.08rem;color:#111827}.pp-oa>span{font-size:.88rem;color:#4b5563;line-height:1.45}
.pp-oa.nuevo{border-color:#f59e0b;background:linear-gradient(135deg,#fffbeb,#fff)}.pp-oa.nuevo>b{color:#b45309}
.pp-oa.ok{border-color:#86efac;background:linear-gradient(135deg,#f0fdf4,#fff)}
.pp-oa-acc{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:4px}
.pp-oa-acc .pp-btn{margin-top:0;padding:12px 6px;font-size:.92rem}
.pp-oa-acc .pp-btn.sec{background:#fff!important;color:#7c3aed;border:2px solid #c4b5fd;box-shadow:none}
.pp-oa-mini{width:100%;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;background:#fff;cursor:pointer}
.pp-oa .pp-linea{margin-top:6px}
#oa-pp-ov{position:fixed;inset:0;z-index:400;background:rgba(17,24,39,.75);overflow:auto;padding:14px 8px;display:none}
#oa-pp-ov.on,body.portal-pac>#oa-pp-ov.on{display:block!important}
body.portal-pac>.oa-toast{display:block!important}
#oa-pp-ov .marco{background:#fff;border-radius:18px;padding:10px;margin:0 auto;width:max-content;max-width:100%}
#oa-pp-ov .cab{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:2px 2px 10px}
#oa-pp-ov .cab button{min-width:44px;min-height:44px;border-radius:50%;border:0;background:#f1f5f9;font-size:1.2rem;cursor:pointer}
.oa-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#0f2a3a;color:#fff;padding:12px 16px;border-radius:12px;font-size:.9rem;z-index:500;max-width:90vw}
`;
  document.head.appendChild(s);
})();

/* ---------- ayudantes ---------- */
setTimeout(() => { try { pintarEstiloPase(); } catch (e) {} oaCargarJS(); }, 0);
function oaAviso(t) { const e = document.createElement('div'); e.className = 'oa-toast'; e.textContent = t; document.body.appendChild(e); setTimeout(() => e.remove(), 3400); }
function oaCir(id) { return DB.cirugias.find((x) => String(x.id) === String(id)); }
function oaT(c) { return ppTipo(portalTipo(c)); }
function oaMedico(c) { return (DB.usuarios || []).find((u) => u.email === c.cirujanoEmail) || null; }
function oaEsDueno(c) { const u = usuarioActual(); return !!(u && c.cirujanoEmail && u.email === c.cirujanoEmail); }
function oaAnestDe(c) {
  const a = String(c.anestesia || '');
  if (/mixta/i.test(a)) return ['Combinada'];
  if (/raqu|regional/i.test(a)) return ['Raquídea'];
  if (/peri|epidural/i.test(a)) return ['Peridural'];
  if (/sedaci/i.test(a)) return ['Sedación'];
  if (/local/i.test(a)) return ['Local'];
  if (/sin anest/i.test(a)) return ['Sin anestesia'];
  if (/general/i.test(a)) return ['General'];
  return esEndo(c) ? ['Sedación'] : [];
}
function oaObsDe(c) {
  if (!esEndo(c)) return '';
  const k = prepClaves(c);
  const prep = k.includes('veda') && k.includes('colono') ? 'Ayuno y preparación colónica según indicaciones entregadas.'
    : k.includes('colono') ? 'Preparación colónica según indicaciones entregadas.'
    : k.includes('veda') ? 'Ayuno según indicaciones entregadas.' : 'Preparación según indicaciones entregadas.';
  return 'Ambulatorio. Sin internación.\n' + prep;
}
function oaBorradorNuevo(c) {
  return { dx: c.diagnostico || '', cie: c.cie10 || '', proc: c.procedimiento || '', anest: oaAnestDe(c), obs: oaObsDe(c), obsAuto: true,
    afil: (c.paciente && c.paciente.afiliado) || '', plan: (c.paciente && c.paciente.plan) || '', gest: 'adm' };
}
function oaDe(c, crear) {
  if (!c.orden && crear) c.orden = { ver: 1, b: oaBorradorNuevo(c), firma: null, env: null, autN: '', anuladas: [] };
  return c.orden || null;
}
function oaCodigo(c, ver) {
  let h = 7; const s = ['OA', c.id, (c.paciente && c.paciente.dni) || '', ver].join('|');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0; h = (h ^ (h >>> 16)) >>> 0;
  const x = h.toString(16).toUpperCase().padStart(8, '0');
  return 'OA-' + x.slice(0, 4) + '-' + x.slice(4);
}
function oaFaltan(c, b) {
  const f = [];
  if (!String(b.dx).trim()) f.push('diagnóstico'); if (!String(b.cie).trim()) f.push('CIE-10');
  if (!String(b.proc).trim()) f.push('procedimiento'); if (!b.anest.length) f.push('anestesia');
  if (c.obraSocial && !/sin obra/i.test(c.obraSocial)) {
    if (!String(b.afil).trim()) f.push('N.º de afiliado');
    if (!String(b.plan).trim() && !/pami/i.test(c.obraSocial)) f.push('plan');
  }
  return f;
}
function oaAut(c) {
  // La versión vigente de la orden cuenta como autorizada si se mandó, tiene su N.º y el dictamen es AUTORIZADO.
  if (!c.orden || !c.orden.firma || !c.orden.env || !c.orden.autN || c.auth !== 'AUTORIZADO') return null;
  return { n: c.orden.autN || 's/n', t: c.authFecha || '', por: c.authAgente || 'Admisión y Egresos' };
}
function oaEstado(c) {
  const o = c.orden, os = c.obraSocial || 'la obra social';
  if (!o) return { k: 'sin', t: 'Sin orden', tono: 'gr', pac: '' };
  const pac = o.b.gest === 'pac';
  if (!o.firma) return o.anuladas.length ? { k: 'anulada', t: 'Anulada · falta firmar la nueva', tono: 'ro', pac: 'Tu médico/a está actualizando la orden' } : { k: 'borrador', t: 'Falta la firma del médico', tono: 'am', pac: 'Tu médico/a la está preparando' };
  const A = oaAut(c);
  if (o.firma && c.auth === 'NO AUTORIZADO') return { k: 'noaut', t: 'No autorizada · ' + (c.authMotivo || ''), tono: 'ro', pac: 'Admisión y Egresos no la autorizó por ahora' };
  if (A) return { k: 'autorizada', t: 'Autorizada · N.º ' + A.n, tono: 'ok', pac: 'Autorizada por ' + os + ' · N.º ' + A.n };
  if (o.env) return { k: 'enviada', t: pac ? 'Presentada por el paciente' : 'Enviada a ' + os, tono: 'az', pac: 'En trámite en ' + os };
  return { k: 'firmada', t: pac ? 'Firmada · falta que el paciente la presente' : 'Firmada · falta enviarla a ' + os, tono: 'am', pac: pac ? 'Falta que la presentes en ' + os : 'Admisión la va a mandar a ' + os };
}
function oaFecha(iso) { return iso ? fmtFecha(iso) : '—'; }
function oaQR(txt) {
  try { if (typeof qrcode === 'undefined') return ''; const q = qrcode(0, 'M'); q.addData(txt); q.make(); return `<img src="${q.createDataURL(4, 0)}" alt="Código QR de verificación">`; }
  catch (e) { return ''; }
}
function oaUrlVerificar(cod) { return location.origin + location.pathname + (typeof forceLocal !== 'undefined' && forceLocal ? '?local&' : '?') + 'verificar=' + cod; }

/* ---------- la hoja de la orden ---------- */
function oaHojaHTML(c, opt) {
  opt = opt || {};
  const o = c.orden, T = oaT(c);
  const snap = opt.snap || null;                         // versión anulada: se dibuja con lo que se firmó
  const b = snap ? snap.b : o.b, firma = snap ? snap.firma : o.firma;
  const fecha = snap ? snap.fecha : c.fecha, hora = snap ? snap.hora : c.horaProg, lugar = snap ? snap.sala : c.quirofano;
  const ver = snap ? snap.ver : o.ver, cod = oaCodigo(c, ver);
  const m = oaMedico(c) || {}, p = c.paciente || {};
  const os = c.obraSocial || 'Sin obra social';
  const medNom = (firma && firma.por) || c.cirujano || m.nombre || '';
  const mat = (firma && firma.mat) || (m.matricula && m.matricula.numero) || 'sin matrícula cargada';
  const esp = (firma && firma.esp) || c.servicio || m.servicio || '';
  const emi = fmtFecha(firma ? String(firma.t).slice(0, 10) : hoyISO());
  const falta = (v) => v ? esc(v) : '<span class="oa-falta">falta</span>';
  const dest = b.gest === 'pac'
    ? `<div><b>A: ${esc(os)} · Auditoría médica</b>Presentada por el afiliado. Se solicita autorización para ${T.o === 'o' ? 'el ' : 'la '}${esc(T.n)} indicad${T.o}, en la fecha programada.</div><div><b>Copia: Admisión y Egresos · HRU</b>Controlar la autorización antes del turno.</div>`
    : `<div><b>A: Admisión y Egresos · HRU</b>Gestionar ante la cobertura la autorización del procedimiento indicado.</div><div><b>A: ${esc(os)} · Auditoría médica</b>Se solicita autorización para ${T.o === 'o' ? 'el ' : 'la '}${esc(T.n)} indicad${T.o}, en la fecha programada.</div>`;
  const cinta = snap ? `<div class="oa-cinta">ANULADA<small>${esc(snap.motivo)} · reemplazada por ${esc(snap.nueva || '')}</small></div>`
    : !firma ? '<div class="oa-cinta borr">BORRADOR<small>SIN FIRMA · NO SIRVE PARA TRAMITAR</small></div>' : '';
  return `<div class="oa-hoja">${cinta}
  <div class="oa-top"><div class="oa-inst"><div class="oa-logo">HRU</div><div><b>Hospital Regional Ushuaia</b><small>${esc(c.servicio || T.sector)} · Programación quirúrgica</small></div></div>
    <div class="oa-tipo"><div class="t">Orden médica</div><div class="n">Solicitud de autorización</div><div class="c">N.º ${cod} · versión ${ver} · emitida ${emi}</div></div></div>
  <div class="oa-cuerpo">
    <div class="oa-sec"><div class="oa-num">1</div><div><h3>Paciente</h3><div class="oa-caja oa-grilla">
      <div class="oa-s2"><small>Apellido y nombre</small><b>${esc(p.nombre || 's/d')}</b></div>
      <div><small>DNI</small><b>${esc(p.dni || '—')}</b></div>
      <div><small>Edad</small><b>${p.edad ?? '—'} años</b></div>
      <div><small>Nacimiento</small><b>${esc(p.nacimiento ? fmtFecha(p.nacimiento) : '—')}</b></div>
      <div><small>Teléfono</small><b>${esc(p.telefono || '—')}</b></div>
      <div class="oa-s2"><small>Correo</small><b>${esc(p.email || '—')}</b></div></div></div></div>
    <div class="oa-sec"><div class="oa-num">2</div><div><h3>Cobertura médica</h3><div class="oa-caja oa-grilla">
      <div><small>Obra social / prepaga</small><b>${esc(os)}</b></div>
      <div><small>Plan</small><b>${/pami/i.test(os) && !b.plan ? '—' : falta(b.plan)}</b></div>
      <div><small>N.º de afiliado</small><b>${falta(b.afil)}</b></div>
      <div><small>Condición</small><b>Titular</b></div></div></div></div>
    <div class="oa-sec"><div class="oa-num">3</div><div><h3>Destinatarios</h3><div class="oa-dest">${dest}</div></div></div>
    <div class="oa-sec"><div class="oa-num">4</div><div><h3>Diagnóstico</h3><div class="oa-caja oa-dx"><span class="cie">CIE-10 ${esc(b.cie || '—')}</span><b>${esc(b.dx)}</b></div></div></div>
    <div class="oa-sec"><div class="oa-num">5</div><div><h3>Prescripción</h3><div class="oa-rp"><div class="oa-glifo">R/P<small>SOLICITO</small></div>
      <div class="oa-ped"><span class="a">Autorización para realizar:</span><span class="p">${esc(b.proc)}</span>
        <span class="a">Práctica del Nomenclador: ${esc((c.practica && (c.practica.p || c.practica.n)) || 'la elegida al programar el turno')}.</span>
        <div class="oa-an">${OA_ANEST.map((a) => `<span class="${b.anest.includes(a) ? 'si' : ''}"><i></i>${a === 'Sin anestesia' ? a : 'Anestesia ' + a.toLowerCase()}</span>`).join('')}</div></div></div></div></div>
    <div class="oa-sec"><div class="oa-num">6</div><div><h3>Fechas</h3><div class="oa-fe">
      <div><small>Emisión de la orden</small><b>${emi}</b></div>
      <div class="prog"><small>Fecha de realización</small><b>${oaFecha(fecha)}</b></div>
      <div><small>Hora · lugar</small><b>${esc(hora || '—')} h</b><div style="font-size:11.5px;color:#3b5566">${esc(lugar || '')}</div></div></div></div></div>
    ${b.obs ? `<div class="oa-sec"><div class="oa-num">7</div><div><h3>Agregados</h3><div class="oa-caja oa-obs">${esc(b.obs)}</div></div></div>` : ''}
  </div>
  <div class="oa-firma"><div>
    ${!firma ? '<div class="oa-rub" style="color:#c8d3d9">—</div>' : firma.img ? `<img class="oa-rubimg" src="${firma.img}" alt="Firma">` : `<div class="oa-rub">${esc(String(medNom).replace(/^Dra?\.\s*/, ''))}</div>`}
    <div class="oa-lin"><b>${esc(medNom)}</b> · ${esc(mat)}<br>${esc(esp)}</div>
    ${!firma ? '<div class="oa-ver">⏳ <b style="color:#b45309">Pendiente de firma.</b> Este borrador no sirve para tramitar la autorización.</div>'
      : `<div class="oa-ver">🔒 <b>Firmada electrónicamente</b> el ${esc(fmtDT(firma.t))} por ${esc(medNom)} (${esc(mat)}), con su usuario y contraseña de la app HRU Quirófanos.${firma.img ? ' La rúbrica es la imagen que el médico guardó en su perfil; la validez la da esta firma electrónica.' : ''}<br>Verificación: escanee el código o ingrese <b>${cod}</b> en la app. Firma electrónica (Ley 25.506, art. 5).</div>`}
  </div><div class="oa-qr">${oaQR(oaUrlVerificar(cod))}<div>Verificar autenticidad</div></div></div>
  <div class="oa-pie"><span>Documento con datos de salud: compartir solo con la cobertura médica o Admisión.</span><span>Hoja 1 de 1 · ${cod}</span></div>
</div>`;
}
function oaMontar(el, ancho, html) {
  if (!el) return;
  el.innerHTML = html; el.classList.add('oa-esc');
  const h = el.querySelector('.oa-hoja'), k = ancho / 794;
  h.style.transform = `scale(${k})`; el.style.width = ancho + 'px';
  el.style.height = (h.offsetHeight * k) + 'px';
}

/* ---------- verificación por QR: lo mínimo, sin datos de salud ---------- */
function oaVerDato(c, cod, e, firma, extra) {
  const p = c.paciente || {};
  return Object.assign({ e, t: (firma && firma.t) || '', por: (firma && firma.por) || c.cirujano || '', mat: (firma && firma.mat) || '',
    ini: String(p.nombre || '').split(' ').filter(Boolean).map((x) => x[0] + '.').join(' '), dni3: String(p.dni || '').replace(/\D/g, '').slice(-3), os: c.obraSocial || '' }, extra || {});
}
function oaVerPublicar(c) {
  if (!cloudOn || !c.orden) return;
  const o = c.orden, w = {};
  w[oaCodigo(c, o.ver)] = oaVerDato(c, oaCodigo(c, o.ver), o.firma ? 'valida' : 'borrador', o.firma);
  (o.anuladas || []).forEach((a) => { w[a.cod] = oaVerDato(c, a.cod, 'anulada', a.firma, { motivo: a.motivo, ta: a.t, nueva: a.nueva || '' }); });
  try { Object.keys(w).forEach((k) => firebase.database().ref('ordenesVer/' + k).set(w[k]).catch(() => {})); } catch (e) {}
}

/* ---------- guardar, pase y anulación ---------- */
function oaParaPase(c) {
  const o = c.orden; if (!o) return null;
  const e = oaEstado(c), ult = o.anuladas[o.anuladas.length - 1];
  return { cod: oaCodigo(c, o.ver), ver: o.ver, e: e.k, pac: e.pac, gest: o.b.gest, os: c.obraSocial || '',
    html: o.firma ? oaHojaHTML(c) : '', anul: ult ? { cod: ult.cod, motivo: ult.motivo } : null,
    nombre: 'Orden-' + String((c.paciente && c.paciente.nombre) || 'paciente').split(' ').pop() + '-' + oaCodigo(c, o.ver) + '.pdf' };
}
function oaPase(c) {
  if (!c || !c.orden) return;
  oaVerPublicar(c);
  if (!c.pase || !c.pase.token || c.pase.caducado) return;
  // En la nube va a portalPrivado/<llave>/orden: lo lee solo el Apps Script, después del DNI y el código del paciente.
  if (cloudOn) { try { firebase.database().ref('portalPrivado/' + c.pase.token + '/orden').set(oaParaPase(c)).catch(() => {}); } catch (e) {} return; }
  const m = portalDemoLeer(), t = c.pase.token;
  m[t] = Object.assign(m[t] || {}, {}); m[t].priv = Object.assign(m[t].priv || {}, { orden: oaParaPase(c) });
  portalDemoGuardar(m);
}
function oaGuardar(c, hist) {
  if (hist) pushHist(c, hist);
  upsert('cirugias', c);
  oaPase(c);
}
function oaAnular(c, motivo) {
  const o = c.orden;
  const snap = { ver: o.ver, cod: oaCodigo(c, o.ver), motivo, t: nowDT(), b: JSON.parse(JSON.stringify(o.b)), firma: o.firma,
    fecha: o.firma.datos.fecha, hora: o.firma.datos.hora, sala: o.firma.datos.sala };
  o.ver++; snap.nueva = oaCodigo(c, o.ver);
  o.anuladas = (o.anuladas || []).concat(snap);
  o.firma = null; o.env = null; o.autN = '';
  pushHist(c, `Orden de autorización ${snap.cod} anulada sola: ${motivo.toLowerCase()}. Se armó la versión ${o.ver}, falta firmarla`);
}
function oaRevisarCambios(c) {
  const o = c && c.orden; if (!o || !o.firma || !o.firma.datos) return;
  const d = o.firma.datos;
  let motivo = '';
  if (d.fecha !== c.fecha) motivo = 'Cambió la fecha del turno';
  else if ((d.hora || '') !== (c.horaProg || '')) motivo = 'Cambió la hora del turno';
  else if ((d.sala || '') !== (c.quirofano || '')) motivo = 'Cambió la sala del turno';
  else if ((d.procBase || '') !== (c.procedimiento || '')) motivo = 'Cambió el procedimiento del turno';
  if (!motivo) return;
  if (d.procBase !== c.procedimiento && o.b.proc === d.procBase) o.b.proc = c.procedimiento || '';
  oaAnular(c, motivo);
  setTimeout(() => oaPase(c), 0);
}

/* ---------- MÉDICO: tarjeta en la ficha y ventana de la orden ---------- */
function oaFichaHTML(c) {
  if (!['borrador', 'pendiente', 'validada', 'confirmada'].includes(c.estado) && !c.orden) return '';
  const o = c.orden, e = oaEstado(c), dueno = oaEsDueno(c);
  const pasos = [['Firmada', !!(o && o.firma)], [o && o.b.gest === 'pac' ? 'Presentada' : 'Enviada a la OS', !!(o && o.env)], ['Autorizada', !!oaAut(c)]];
  const ya = pasos.findIndex((x) => !x[1]);
  return `<section class="fx-card full" id="oa-ficha"><h4>${ico(ICONS.fileText, 15)} <span>Orden de autorización (R/P)</span><em class="fx-n ${e.tono === 'ok' ? 'ok' : e.tono === 'ro' ? 'bad' : 'warn'}">${esc(e.t)}</em></h4>
    ${o ? `<div class="oa-pasos">${pasos.map((p, i) => `<span class="${p[1] ? 'h' : i === ya ? 'ya' : ''}">${p[1] ? '✓ ' : ''}${p[0]}</span>`).join('')}</div>` : ''}
    <p class="fx-txt">${!o ? 'Sale sola, firmada, cuando generás el pase del paciente (con lo que cargaste al programar). Si querés, la podés armar antes desde acá.'
      : o.anuladas.length && !o.firma ? `La orden ${esc(o.anuladas[o.anuladas.length - 1].cod)} quedó anulada (${esc(o.anuladas[o.anuladas.length - 1].motivo.toLowerCase())}). Revisá la versión ${o.ver} y firmala.`
      : !o.firma ? 'Borrador: nadie la ve todavía. Sale al paciente y a Admisión recién cuando la firmás.'
      : `Firmada el ${esc(fmtDT(o.firma.t))}. ${oaAut(c) ? `Autorizada por ${esc(c.obraSocial || 'la obra social')} (N.º ${esc(oaAut(c).n)}).` : o.env ? 'Admisión ya la mandó a la obra social.' : 'Admisión la ve en Ingresos para mandarla.'}`}</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      ${dueno && (!o || !o.firma) ? `<button class="btn btn-sm btn-blue fx-btn" onclick="oaAbrir(${esc(JSON.stringify(c.id))})">✍ ${o ? 'Revisar y firmar la orden' : 'Armar la orden'}</button>` : ''}
      ${o ? `<button class="btn btn-sm btn-outline fx-btn" onclick="oaAbrir(${esc(JSON.stringify(c.id))})">📄 Ver la orden</button>` : ''}
    </div></section>`;
}
let oaId = null;
function oaAbrir(id) {
  const c = oaCir(id); if (!c) return;
  oaId = c.id;
  if (!c.orden && oaEsDueno(c)) oaDe(c, true);
  let ov = $('oa-ov');
  if (!ov) { ov = document.createElement('div'); ov.className = 'overlay'; ov.id = 'oa-ov'; ov.style.zIndex = 140; ov.innerHTML = '<div class="modal modal-white" id="oa-modal"></div>'; document.body.appendChild(ov);
    ov.addEventListener('click', (e) => { if (e.target === ov) oaCerrar(); }); }
  ov.classList.add('open');
  oaPintar();
}
function oaCerrar() { const ov = $('oa-ov'); if (ov) ov.classList.remove('open'); oaId = null; refreshView(); const c = $('cir-overlay'); if (c && c.classList.contains('open') && typeof openCirugia === 'function' && oaUltFicha) openCirugia(oaUltFicha); }
function oaPintar() {
  const c = oaCir(oaId); if (!c) return;
  const o = c.orden, u = usuarioActual(), dueno = oaEsDueno(c), puedeEd = dueno && o && !o.firma;
  const e = oaEstado(c), b = o ? o.b : null;
  const pasa = $('oa-modal');
  if (!o) { pasa.innerHTML = '<button class="modal-close" onclick="oaCerrar()" aria-label="Cerrar">✕</button><h3>Orden de autorización</h3><p class="form-note">El médico todavía no armó la orden de este turno.</p>'; return; }
  const izq = dueno ? `
    <div class="field"><label>Diagnóstico</label><div class="oa-dos"><input id="oa-dx" value="${esc(b.dx)}" ${puedeEd ? '' : 'disabled'}><input id="oa-cie" value="${esc(b.cie)}" placeholder="CIE-10" ${puedeEd ? '' : 'disabled'}></div></div>
    <div class="field"><label>Procedimiento que se solicita</label><textarea id="oa-proc" rows="3" ${puedeEd ? '' : 'disabled'}>${esc(b.proc)}</textarea></div>
    <div class="field"><label>Anestesia</label><div class="oa-ops">${OA_ANEST.map((a) => `<button type="button" class="${b.anest.includes(a) ? 'on' : ''}" ${puedeEd ? '' : 'disabled'} onclick="oaAnest('${a}')">${a}</button>`).join('')}</div></div>
    <div class="field"><label>Agregados a la orden</label><textarea id="oa-obs" rows="3" ${puedeEd ? '' : 'disabled'}>${esc(b.obs)}</textarea>
      <p class="form-note" style="margin:4px 0 0">${esEndo(c) ? (b.obsAuto ? 'La preparación sale del estudio programado (VEDA, colonoscopía o las dos).' : 'Escrito a mano.') : 'Insumos, prótesis, días de internación, estudios.'}</p></div>
    <div class="field"><label>Cobertura · ${esc(c.obraSocial || 'sin obra social')}</label><div class="oa-par"><input id="oa-afil" value="${esc(b.afil)}" placeholder="N.º de afiliado" ${puedeEd ? '' : 'disabled'}><input id="oa-plan" value="${esc(b.plan)}" placeholder="Plan" ${puedeEd ? '' : 'disabled'}></div></div>
    <div class="field"><label>¿Quién le manda la orden a la obra social?</label><div class="oa-ops">${Object.keys(OA_GEST).map((g) => `<button type="button" class="${b.gest === g ? 'on' : ''}" ${puedeEd ? '' : 'disabled'} onclick="oaGest('${g}')">${OA_GEST[g][0]}</button>`).join('')}</div>
      <div class="oa-ayuda"><b>${OA_GEST[b.gest][0]}:</b> ${OA_GEST[b.gest][1]}</div></div>
    <div class="oa-blq"><h5>Mi firma dibujada</h5><p class="form-note" style="margin:0">Se guarda en tu perfil una sola vez y se pega en todas tus órdenes. Guardarla <b>no envía nada</b>.</p>
      ${u && u.firmaImg ? `<div class="oa-mif"><img src="${u.firmaImg}" alt="Mi firma guardada"><span>✔ Esta es tu firma guardada. Si dibujás o subís otra, reemplaza a esta.</span></div>` : ''}
      <div class="oa-pad"><canvas id="oa-pad" width="760" height="240"></canvas><span id="oa-pad-g">Firmá acá con el dedo, el lápiz o el mouse</span></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
        <button type="button" class="btn btn-sm btn-outline" onclick="oaPadBorrar()">Borrar</button>
        <label class="btn btn-sm btn-outline" style="cursor:pointer">📎 Subir imagen<input type="file" accept="image/png,image/jpeg" style="display:none" onchange="oaPadArchivo(this)"></label>
        <button type="button" class="btn btn-sm btn-green" id="oa-pad-ok" disabled onclick="oaPadGuardar()">Dibujá tu firma</button></div></div>
    <div class="oa-blq"><h5>Firmar y enviar</h5>
      ${(() => { const f = oaFaltan(c, b); return o.firma ? `<div class="oa-est ok">✔ Firmada el ${esc(fmtDT(o.firma.t))} y enviada: el paciente la ve en su pase y Admisión en Ingresos.</div>
        <button type="button" class="btn btn-sm btn-outline" style="margin-top:8px" onclick="oaCorregir()">Corregir la orden (anula esta y arma otra)</button>`
        : `<button type="button" class="btn btn-blue" id="oa-firmar" ${f.length ? 'disabled' : ''} onclick="oaFirmar()">${f.length ? '🔒 Falta: ' + esc(f.join(', ')) : '✍ Firmar y enviar'}</button>
        <div class="oa-est am">Borrador: nadie la ve todavía. Sale al paciente y a Admisión recién cuando la firmás con tu contraseña.</div>`; })()}
      ${o.anuladas.length ? `<div class="oa-vers">${o.anuladas.map((a, i) => `<div><span>Versión ${a.ver} · ${esc(a.cod)} <b style="color:#b91c1c">ANULADA</b><small>${esc(a.motivo)} · ${esc(fmtDT(a.t))}</small></span><button type="button" class="btn btn-sm btn-outline" onclick="oaVerAnulada(${i})">Ver</button></div>`).join('')}</div>` : ''}
    </div>` : '';
  const admBloque = admis ? oaAdmHTML(c) : '';
  pasa.innerHTML = `<button class="modal-close" onclick="oaCerrar()" aria-label="Cerrar">✕</button>
    <h3 style="margin:0 0 2px">Orden de autorización (R/P)</h3>
    <p class="form-note" style="margin:0 0 10px">${esc(c.paciente?.nombre || '')} · ${esc(c.obraSocial || 'sin obra social')} · ${fmtFecha(c.fecha)} ${esc(c.horaProg || '')} h · <b>${esc(e.t)}</b></p>
    <div class="oa-ed" style="${dueno ? '' : 'grid-template-columns:1fr'}">
      ${dueno ? `<div>${izq}</div>` : ''}
      <div class="oa-sticky">${admBloque}
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
          ${admis && o.firma && !o.env && o.b.gest !== 'pac' ? '' : `<button type="button" class="btn btn-sm btn-blue" ${o.firma ? '' : 'disabled'} onclick="oaPDF(${esc(JSON.stringify(c.id))})">⬇ Descargar PDF</button>`}
          <button type="button" class="btn btn-sm btn-outline" ${o.firma ? '' : 'disabled'} onclick="window.open(oaUrlVerificar('${oaCodigo(c, o.ver)}'),'_blank')">🔍 Verificar</button>
        </div>
        <div id="oa-prev"></div></div></div>`;
  const be = $('oa-env-os'); if (be) { be.dataset.txt = be.textContent; oaOSBoton(); }
  const prev = $('oa-prev'), w = Math.max(280, Math.min(720, prev.clientWidth || 600));
  oaMontar(prev, w, oaHojaHTML(c));
  if (dueno && puedeEd) {
    [['oa-dx', 'dx'], ['oa-cie', 'cie'], ['oa-proc', 'proc'], ['oa-obs', 'obs'], ['oa-afil', 'afil'], ['oa-plan', 'plan']].forEach(([id, k]) => {
      const el = $(id); el.addEventListener('input', () => { b[k] = k === 'cie' ? el.value.toUpperCase() : el.value; if (k === 'obs') b.obsAuto = false; oaVivo(c); });
    });
  }
  if (dueno) oaPadIniciar();
}
function oaVivo(c) {
  // actualiza la vista previa y el botón sin redibujar los casilleros (no se pierde el foco)
  const prev = $('oa-prev'); if (prev) oaMontar(prev, parseFloat(prev.style.width) || 600, oaHojaHTML(c));
  const bt = $('oa-firmar'); if (bt) { const f = oaFaltan(c, c.orden.b); bt.disabled = f.length > 0; bt.textContent = f.length ? '🔒 Falta: ' + f.join(', ') : '✍ Firmar y enviar'; }
  clearTimeout(oaVivo.t); oaVivo.t = setTimeout(() => upsert('cirugias', c), 600);
}
function oaAnest(a) {
  const c = oaCir(oaId), b = c.orden.b, i = b.anest.indexOf(a);
  if (i >= 0) b.anest.splice(i, 1); else if (a === 'Sin anestesia') b.anest = [a]; else { b.anest = b.anest.filter((x) => x !== 'Sin anestesia'); b.anest.push(a); }
  upsert('cirugias', c); oaPintar();
}
function oaGest(g) { const c = oaCir(oaId); c.orden.b.gest = g; upsert('cirugias', c); oaPintar(); }
function oaFirmar() {
  const c = oaCir(oaId), o = c.orden, u = usuarioActual();
  if (oaFaltan(c, o.b).length) return;
  pedirCredencial({ propia: true, titulo: 'Firmar la orden de autorización',
    desc: `Al confirmar, la orden ${oaCodigo(c, o.ver)} queda firmada a tu nombre y la ven el paciente en su pase y Admisión en Ingresos.`,
    onOk: async () => {
      const m = oaMedico(c) || u || {};
      o.firma = { t: nowDT(), por: c.cirujano || m.nombre, mat: (m.matricula && m.matricula.numero) || '', esp: c.servicio || m.servicio || '', img: (u && u.firmaImg) || '',
        datos: { fecha: c.fecha, hora: c.horaProg || '', sala: c.quirofano || '', procBase: c.procedimiento || '' } };
      o.env = null; o.autN = '';
      oaGuardar(c, `Orden de autorización ${oaCodigo(c, o.ver)} firmada y enviada al pase y a Admisión`);
      oaAviso('Orden firmada: el paciente la ve en su pase y Admisión en Ingresos.');
      oaPintar();
    } });
}
async function oaCorregir() {
  const c = oaCir(oaId);
  if (!await preguntar('La orden firmada se anula (queda guardada como versión anterior) y se arma una nueva para que la corrijas y la vuelvas a firmar. El paciente y Admisión ven el aviso.', { titulo: '¿Corregir la orden?', si: 'Sí, anular y corregir', no: 'No' })) return;
  oaAnular(c, 'La corrigió el médico'); oaGuardar(c); oaPintar();
}
function oaVerAnulada(i) {
  const c = oaCir(oaId), a = c.orden.anuladas[i];
  oaPpVer(oaHojaHTML(c, { snap: a }), 'Versión ' + a.ver + ' · anulada');
}
/* firma dibujada */
let oaTrazo = false;
function oaPadIniciar() {
  const cv = $('oa-pad'); if (!cv) return; const x = cv.getContext('2d');
  x.lineWidth = 4.2; x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = '#1d3a8a';
  const pos = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * (760 / r.width), (e.clientY - r.top) * (240 / r.height)]; };
  cv.addEventListener('pointerdown', (e) => { try { cv.setPointerCapture(e.pointerId); } catch (_) {} oaTrazo = true; const [a, b] = pos(e); x.beginPath(); x.moveTo(a, b); e.preventDefault(); });
  cv.addEventListener('pointermove', (e) => { if (!oaTrazo) return; const [a, b] = pos(e); x.lineTo(a, b); x.stroke(); $('oa-pad-g').style.display = 'none'; const k = $('oa-pad-ok'); k.disabled = false; k.textContent = 'Guardar esta firma'; });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((t) => cv.addEventListener(t, () => oaTrazo = false));
}
function oaPadBorrar() { const cv = $('oa-pad'); cv.getContext('2d').clearRect(0, 0, 760, 240); $('oa-pad-g').style.display = ''; const k = $('oa-pad-ok'); k.disabled = true; k.textContent = 'Dibujá tu firma'; }
function oaRecortar(cv) {
  const x = cv.getContext('2d'), d = x.getImageData(0, 0, cv.width, cv.height).data;
  let x0 = cv.width, y0 = cv.height, x1 = 0, y1 = 0;
  for (let y = 0; y < cv.height; y++) for (let i = 0; i < cv.width; i++) if (d[(y * cv.width + i) * 4 + 3] > 10) { if (i < x0) x0 = i; if (i > x1) x1 = i; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 <= x0) return cv.toDataURL('image/png');
  const o = document.createElement('canvas'); o.width = x1 - x0 + 16; o.height = y1 - y0 + 16;
  o.getContext('2d').drawImage(cv, x0 - 8, y0 - 8, o.width, o.height, 0, 0, o.width, o.height);
  return o.toDataURL('image/png');
}
function oaFirmaGuardar(img) {
  const u = usuarioActual(); if (!u) return;
  u.firmaImg = img; upsert('usuarios', u);
  const c = oaCir(oaId); if (c && c.orden && !c.orden.firma) upsert('cirugias', c);
  oaAviso('Firma guardada en tu perfil. Todavía no se envió nada.'); oaPintar();
  const k = $('oa-pad-ok'); if (k) { k.disabled = true; k.textContent = '✔ Firma guardada'; }
}
function oaPadGuardar() { oaFirmaGuardar(oaRecortar($('oa-pad'))); }
function oaPadArchivo(inp) {
  const f = inp.files && inp.files[0]; if (!f) return;
  if (f.size > 2e6) { oaAviso('La imagen pesa más de 2 MB. Probá con una foto más chica o un recorte.'); return; }
  const r = new FileReader();
  r.onload = () => { const im = new Image(); im.onload = () => {
    const cv = document.createElement('canvas'), k = Math.min(1, 760 / im.width); cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k);
    const x = cv.getContext('2d'); x.drawImage(im, 0, 0, cv.width, cv.height);
    const px = x.getImageData(0, 0, cv.width, cv.height), d = px.data;
    for (let i = 0; i < d.length; i += 4) { if ((d[i] + d[i + 1] + d[i + 2]) / 3 > 185) d[i + 3] = 0; }
    x.putImageData(px, 0, 0); oaFirmaGuardar(oaRecortar(cv)); }; im.src = r.result; };
  r.readAsDataURL(f); inp.value = '';
}

/* ---------- ADMISIÓN: en Ingresos y en la ventana de la orden ---------- */
function oaAdmHTML(c) {
  const o = c.orden, e = oaEstado(c), os = c.obraSocial || 'la obra social', pac = o.b.gest === 'pac';
  const pasos = [[!!o.firma, 'Firmada por el médico', o.firma ? fmtDT(o.firma.t) + ' · ' + (o.firma.por || '') : 'Todavía no la firmó'],
    [!!o.env, pac ? 'Presentada por el paciente' : 'Enviada a ' + os, o.env ? fmtDT(o.env.t) + ' · ' + o.env.por + (o.env.via === 'correo' ? ' · por correo' + (o.env.a ? ' a ' + o.env.a : '') : '') : pac ? 'La presenta el afiliado' : 'La manda Admisión'],
    [!!oaAut(c), 'Autorizada por ' + os, oaAut(c) ? 'N.º ' + oaAut(c).n + ' · dictamen de ' + oaAut(c).por + (oaAut(c).t ? ' · ' + fmtDT(oaAut(c).t) : '') : 'Admisión carga el N.º de la obra social y da el dictamen']];
  const ya = pasos.findIndex((p) => !p[0]);
  const acc = !o.firma ? '<div class="oa-est am">⏳ Esperando al médico: no se puede hacer nada hasta que la firme.</div>'
    : !o.env ? (pac ? `<div class="oa-est az">Próximo paso: cuando el paciente avise que la presentó en ${esc(os)}, marcalo.</div>
      <div class="oa-adm"><button type="button" class="btn btn-sm btn-green" onclick="oaEnviada(${esc(JSON.stringify(c.id))})">📨 El paciente la presentó</button></div>`
      : `<div class="oa-est az">Próximo paso: mandarla a ${esc(os)}. Con un toque la app le manda el correo a su sector de autorizaciones con la orden en PDF adjunta, y queda anotado.</div>
      <div class="field" style="margin-top:10px"><label>Correo de autorizaciones de ${esc(os)}</label>
        <input type="email" id="oa-os-mail" value="${esc(oaOSCorreo(os))}" placeholder="autorizaciones@obrasocial.com" autocomplete="off" oninput="oaOSBoton()">
        <span class="hint">${oaOSCorreo(os) ? 'Guardado de una vez anterior. Si cambió, corregilo acá.' : 'Se carga una sola vez por obra social: la próxima orden de ' + esc(os) + ' ya sale con este correo.'}</span></div>
      <div class="oa-adm"><button type="button" class="btn btn-blue" id="oa-env-os" onclick="oaEnviarOS(${esc(JSON.stringify(c.id))}, this)">📧 Enviar a ${esc(os)} por correo</button></div>
      <p class="form-note" style="margin:8px 0 0">¿La mandaste por otro lado (su web o en mano)? <button type="button" class="btn btn-sm btn-outline" onclick="oaPDF(${esc(JSON.stringify(c.id))})">⬇ Bajar el PDF</button> <button type="button" class="btn btn-sm btn-outline" onclick="oaEnviada(${esc(JSON.stringify(c.id))})">Ya la mandé yo</button></p>`)
    : !oaAut(c) ? `<div class="oa-est az">Próximo paso: cuando ${esc(os)} responda, escribí su número de autorización. Después sigue el dictamen de Admisión de siempre («Autorización de Admisión»).</div>
      <div class="oa-adm"><input id="oa-autn" value="${esc(o.autN || '')}" placeholder="N.º de autorización de ${esc(os)}" oninput="const b=$('oa-aut-ok');b.disabled=!this.value.trim();b.textContent=this.value.trim()?'Guardar el N.º y dar el dictamen':'Escribí el N.º'"><button type="button" class="btn btn-sm btn-green" id="oa-aut-ok" ${o.autN ? '' : 'disabled'} onclick="oaAutorizada(${esc(JSON.stringify(c.id))})">${o.autN ? 'Guardar el N.º y dar el dictamen' : 'Escribí el N.º'}</button></div>`
    : `<div class="oa-est ok">✅ Autorizada (N.º ${esc(oaAut(c).n)}). El paciente ya lo ve en su pase.</div>`;
  return `<div style="border:1px solid var(--line,#e2e8f0);border-radius:14px;padding:12px;margin-bottom:12px">
    <b style="font-size:.95rem">Admisión y Egresos · seguimiento</b>
    <ol class="pp-linea" style="margin-top:10px">${pasos.map((p, i) => `<li class="pp-paso pp-p-${p[0] ? 'ok' : i === ya ? 'pend' : 'espera'}"><span class="pp-p-ico">${p[0] ? '✓' : ''}</span><div><b>${esc(p[1])}${i === ya ? ' ← ahora' : ''}</b><small>${esc(p[2])}</small></div></li>`).join('')}</ol>
    ${acc}</div>`;
}
/* Correos de autorizaciones de cada obra social: los carga Admisión una vez (osCorreos/<clave>). */
const oaOSMem = {};
function oaOSClave(os) { return String(os || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 60) || 'sin_os'; }
function oaOSCorreo(os) { const k = oaOSClave(os); if (k in oaOSMem) return oaOSMem[k];
  if (!cloudOn) { try { oaOSMem[k] = (JSON.parse(localStorage.getItem('oa_os_correos') || '{}'))[k] || ''; } catch (e) { oaOSMem[k] = ''; } return oaOSMem[k]; }
  oaOSMem[k] = ''; try { firebase.database().ref('osCorreos/' + k).once('value').then((sn) => { const v = sn.val(); oaOSMem[k] = (v && v.correo) || ''; if (oaId) oaPintar(); }).catch(() => {}); } catch (e) {}
  return ''; }
function oaOSValido(m) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(m || '').trim()); }
function oaOSBoton() { const i = $('oa-os-mail'), b = $('oa-env-os'); if (!i || !b) return; const ok = oaOSValido(i.value); b.disabled = !ok; b.textContent = ok ? b.dataset.txt : '🔒 Falta: el correo de autorizaciones'; }
async function oaOSGuardar(os, mail) {
  const k = oaOSClave(os); mail = String(mail || '').trim().toLowerCase(); oaOSMem[k] = mail;
  if (!cloudOn) { try { const m = JSON.parse(localStorage.getItem('oa_os_correos') || '{}'); m[k] = mail; localStorage.setItem('oa_os_correos', JSON.stringify(m)); } catch (e) {} return; }
  await firebase.database().ref('osCorreos/' + k).set({ os: String(os || ''), correo: mail, t: nowDT() });
}
async function oaEnviarOS(id, btn) {
  const c = oaCir(id); if (!c || !c.orden || !c.orden.firma || c.orden.env) return;
  const o = c.orden, os = c.obraSocial || 'la obra social';
  const mail = String(($('oa-os-mail') || {}).value || '').trim();
  if (!oaOSValido(mail)) { oaOSBoton(); return; }
  if (btn) { btn.disabled = true; btn.textContent = 'Enviando…'; }
  let res = null;
  try {
    if (mail.toLowerCase() !== oaOSCorreo(os)) await oaOSGuardar(os, mail);
    if (!cloudOn) { await new Promise((ok) => setTimeout(ok, 900)); res = { ok: true, a: mail + ' (prueba: no sale ningún correo)' }; }
    else {
      const blob = await oaPdfBlob(oaHojaHTML(c), 1.5, 0.8);
      const b64 = await new Promise((ok, mal) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1]); r.onerror = mal; r.readAsDataURL(blob); });
      await firebase.database().ref('ordenesPdf/' + c.id).set({ v: o.ver, cod: oaCodigo(c, o.ver), pdf: b64, nombre: oaParaPase(c).nombre, t: nowDT() });
      res = await portalServicio({ accion: 'enviarOrdenOS', id: String(c.id) });
    }
  } catch (e) { res = { error: 'red' }; }
  if (res && res.ok) {
    o.env = { t: nowDT(), por: 'Admisión y Egresos', via: 'correo', a: res.a || '' };
    oaGuardar(c, 'Admisión mandó la orden de autorización ' + oaCodigo(c, o.ver) + ' por correo a ' + os + (res.a ? ' (' + res.a + ')' : ''));
    oaAviso('Orden enviada por correo a ' + os + '. El paciente ve «En trámite».');
  } else {
    const msg = res && res.error === 'sinCorreo' ? 'No se encontró el correo de autorizaciones de ' + os + '. Escribilo de nuevo y volvé a tocar «Enviar».'
      : res && res.error === 'cupo' ? 'Se terminó el cupo diario de correos del hospital. Bajá el PDF y mandalo vos.'
      : 'No se pudo mandar el correo. Revisá la conexión o bajá el PDF y mandalo vos.';
    await avisar(msg);
  }
  oaPintar();
}
function oaEnviada(id) { const c = oaCir(id); c.orden.env = { t: nowDT(), por: 'Admisión y Egresos', via: 'a mano' }; oaGuardar(c, 'Admisión marcó la orden de autorización como enviada a ' + (c.obraSocial || 'la obra social')); oaAviso('Anotado. El paciente ve «En trámite».'); oaPintar(); }
function oaAutorizada(id) {
  const c = oaCir(id), n = ($('oa-autn').value || '').trim(); if (!n) return;
  c.orden.autN = n;
  oaGuardar(c, 'Admisión anotó el N.º de autorización de ' + (c.obraSocial || 'la obra social') + ': ' + n);
  oaCerrar(); pedirAutorizacion(c.id);   // el dictamen de Admisión de siempre
}
function oaIngresosDecorar() {
  document.querySelectorAll('#main .ing-f').forEach((f) => {
    if (f.dataset.oa) return;
    const btn = [...f.querySelectorAll('.ing-a button')].find((x) => /openCirugia\(/.test(x.getAttribute('onclick') || ''));
    const m = btn && (btn.getAttribute('onclick') || '').match(/openCirugia\(([^)]+)\)/); if (!m) return;
    let id; try { id = JSON.parse(m[1]); } catch (e) { id = m[1]; }
    const c = oaCir(id); if (!c) return;
    f.dataset.oa = 1;
    const e = oaEstado(c);
    const col = { ok: 'ie-ok', am: 'ie-no', az: 'ie-no', ro: 'ie-mal', gr: 'ie-no' }[e.tono];
    const dl = f.querySelector('.ing-e dl.ie');
    if (dl) dl.insertAdjacentHTML('beforeend', `<div class="ie-r ${col}"><dt>Orden</dt><dd><i>${e.k === 'autorizada' ? '✓' : e.k === 'sin' ? '—' : e.k === 'anulada' ? '✕' : '📄'}</i><span>${esc(e.t)}</span></dd></div>`);
    const e2 = f.querySelector('.ing-e');
    if (e2 && c.orden) e2.insertAdjacentHTML('beforeend', `<div class="oa-ing-acc">`
      + `<button class="btn btn-sm ${c.orden.firma && !oaAut(c) ? 'btn-blue' : 'btn-outline'}" onclick="oaAbrir(${esc(JSON.stringify(c.id))})">📄 Orden${c.orden.firma && !c.orden.env ? ' · enviar' : c.orden.env && !oaAut(c) ? ' · cargar N.º' : ''}</button>`
      + (c.orden.firma ? `<button class="btn btn-sm btn-outline" onclick="oaPDF(${esc(JSON.stringify(c.id))})">⬇ PDF</button>` : '') + `</div>`);
  });
}

/* ---------- PDF y compartir ---------- */
function oaCargarJS() {
  return Promise.all(OA_JS.map((src) => new Promise((ok) => {
    if ([...document.scripts].some((s) => s.src === src)) return ok();
    const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = ok; document.head.appendChild(s);
  })));
}
async function oaPdfBlob(html, escala, calidad) {
  await oaCargarJS();
  if (typeof html2canvas !== 'function' || !window.jspdf) throw new Error('No se pudieron cargar las herramientas del PDF (¿sin internet?)');
  const box = document.createElement('div'); box.style.cssText = 'position:fixed;left:-10000px;top:0'; box.innerHTML = html; document.body.appendChild(box);
  const h = box.querySelector('.oa-hoja'); h.style.boxShadow = 'none'; h.style.borderRadius = '0';
  const cv = await html2canvas(h, { scale: escala || 2, backgroundColor: '#ffffff', logging: false });
  box.remove();
  const pdf = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, H = 297, r = cv.height / cv.width; let w = W, hh = W * r; if (hh > H) { hh = H; w = H / r; }
  pdf.addImage(cv.toDataURL('image/jpeg', calidad || 0.92), 'JPEG', (W - w) / 2, 0, w, hh);
  pdf.setProperties({ title: 'Orden de autorización', subject: 'Hospital Regional Ushuaia' });
  return pdf.output('blob');
}
function oaBajar(blob, nombre) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
function oaPdfAbrir(html, nombre) {
  // La pestaña se abre en el MISMO toque (si se abre después de armar el PDF, Safari y las apps instaladas la bloquean).
  let w = null; try { w = window.open('', '_blank'); } catch (e) { w = null; }
  const escribir = (h) => { try { w.document.open(); w.document.write(h); w.document.close(); } catch (e) {} };
  if (w) escribir(`<!doctype html><meta charset="utf-8"><title>${esc(nombre)}</title><p style="font:16px system-ui;padding:24px;color:#0f2a3a">Armando el PDF de la orden…</p>`);
  else oaAviso('Armando el PDF…');
  return oaPdfBlob(html).then((b) => {
    const url = URL.createObjectURL(new File([b], nombre, { type: 'application/pdf' }));
    if (w && !w.closed) w.location.href = url; else oaBajar(b, nombre);
    setTimeout(() => URL.revokeObjectURL(url), 300000);
  }).catch((e) => {
    // Respaldo: la hoja tal cual, lista para imprimir o «Guardar como PDF».
    const css = (document.getElementById('oa-css') || {}).textContent || '';
    const hoja = `<!doctype html><meta charset="utf-8"><title>${esc(nombre)}</title><style>${css}@page{size:A4;margin:0}body{margin:0}.oa-hoja{box-shadow:none;border-radius:0;zoom:.92;width:863px}</style>${html}<script>setTimeout(function(){print()},400)<\/script>`;
    if (w && !w.closed) escribir(hoja);
    else avisar('No se pudo armar el PDF en este navegador. Probá desde Chrome o permití las ventanas emergentes de la app.');
    try { console.warn('PDF de la orden:', e); } catch (x) {}
  });
}
function oaPDF(id) {
  const c = oaCir(id); if (!c || !c.orden || !c.orden.firma) return;
  return oaPdfAbrir(oaHojaHTML(c), oaParaPase(c).nombre);
}

/* ---------- PACIENTE: tarjeta en el pase ---------- */
function oaPortalHTML(f) {
  const or = (portal.extra && portal.extra.orden) || null, fo = f && f.ord;
  if (!fo && !or) return '';
  const x = Object.assign({}, or || {}, fo || {});
  if (x.e === 'sin') return '';
  const listo = !!(or && or.html && ['firmada', 'enviada', 'autorizada'].includes(x.e));
  const os = x.os || 'tu obra social';
  const aviso = x.gest === 'pac' ? `📨 <b>Tenés que presentarla vos</b> en ${esc(os)} (por su app, su correo o en la delegación). Tocá «Compartir» para mandarla.`
    : x.gest === 'amb' ? `📨 Admisión la manda a ${esc(os)}. Si tu obra social te la pide a vos, tocá «Compartir» y mandala.`
    : `✅ <b>No tenés que hacer nada:</b> Admisión y Egresos la manda a ${esc(os)}. La tenés acá por si te la piden.`;
  const paso = (est, tit, txt) => `<li class="pp-paso pp-p-${est}"><span class="pp-p-ico">${est === 'ok' ? '✓' : ''}</span><div><b>${tit}</b><small>${txt}</small></div></li>`;
  const k = x.e;
  return `<section class="pp-card pp-oa${x.anul && !listo ? ' nuevo' : listo && k === 'autorizada' ? ' ok' : ''}"><small>Tu orden médica de autorización</small>
    <b>${listo ? (x.ver > 1 ? '📄 Nueva versión de tu orden' : '📄 Tu orden está lista') : x.anul ? '⚠️ Tu orden anterior quedó anulada' : '📝 Tu médico/a la está preparando'}</b>
    <span>${x.anul ? `La orden ${esc(x.anul.cod)} quedó anulada: ${esc(String(x.anul.motivo).toLowerCase())}. ${listo ? 'Usá esta.' : 'Te avisamos acá cuando esté la nueva.'}` : listo ? 'La firmó tu médico/a. Podés verla, bajarla en PDF o mandarla.' : 'Te avisamos acá cuando esté firmada.'}</span>
    ${listo ? `<div class="pp-oa-mini" id="oa-pp-mini" onclick="oaPpAbrir()"></div>
    <div class="pp-oa-acc"><button class="pp-btn" onclick="oaPpAbrir()">Ver</button><button class="pp-btn sec" onclick="oaPpPdf()">⬇ PDF</button><button class="pp-btn sec" onclick="oaPpCompartir()">Compartir</button></div>
    <span style="font-size:.84rem">${aviso}</span>` : ''}
    <ol class="pp-linea">
      ${paso(listo ? 'ok' : 'pend', 'Tu médico/a', listo ? 'Firmó la orden' : 'Está preparando la orden')}
      ${paso(k === 'enviada' || k === 'autorizada' ? 'ok' : listo ? 'pend' : 'espera', x.gest === 'pac' ? 'Vos' : 'Admisión y Egresos', k === 'enviada' || k === 'autorizada' ? (x.gest === 'pac' ? 'La presentaste en ' + esc(os) : 'La mandó a ' + esc(os)) : x.gest === 'pac' ? 'Falta que la presentes' : 'Va a mandarla a ' + esc(os))}
      ${paso(k === 'autorizada' ? 'ok' : k === 'enviada' ? 'pend' : 'espera', esc(os), k === 'autorizada' ? 'Autorizó · N.º ' + esc(x.n || '') : k === 'enviada' ? 'Está revisando la autorización' : 'Espera la orden')}
    </ol></section>`;
}
function oaPpMini() {
  const el = $('oa-pp-mini'), or = portal.extra && portal.extra.orden; if (!el || !or || !or.html) return;
  const w = el.clientWidth || 300; oaMontar(el, w, or.html); el.style.height = Math.min(parseFloat(el.style.height), 210) + 'px';
}
function oaPpVer(html, titulo) {
  let ov = $('oa-pp-ov');
  if (!ov) { ov = document.createElement('div'); ov.id = 'oa-pp-ov'; document.body.appendChild(ov); }
  ov.innerHTML = `<div class="marco"><div class="cab"><b>${esc(titulo || 'Tu orden médica')}</b><button onclick="$('oa-pp-ov').classList.remove('on')" aria-label="Cerrar">✕</button></div><div id="oa-pp-hoja"></div></div>`;
  ov.classList.add('on');
  oaMontar($('oa-pp-hoja'), Math.min(794, document.documentElement.clientWidth - 40), html);
}
function oaPpAbrir() { const or = portal.extra && portal.extra.orden; if (or && or.html) oaPpVer(or.html); }
function oaPpPdf() { const or = portal.extra && portal.extra.orden; if (!or || !or.html) return; return oaPdfAbrir(or.html, or.nombre); }
async function oaPpCompartir() {
  const or = portal.extra && portal.extra.orden; if (!or || !or.html) return;
  try {
    const file = new File([await oaPdfBlob(or.html)], or.nombre, { type: 'application/pdf' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Orden médica' }); return; }
    oaAviso('Este equipo no deja compartir archivos: se descarga el PDF para que lo adjuntes.'); oaBajar(file, or.nombre);
  } catch (e) { if (!(e && e.name === 'AbortError')) oaAviso('No se pudo compartir. Probá con «PDF».'); }
}

/* ---------- verificación por QR (solo dice válida / anulada; sin diagnóstico) ---------- */
async function oaVerificar(cod) {
  let r = null;
  cod = String(cod || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 20);
  if (cloudOn) {
    for (let i = 0; i < 25 && !(firebase.auth && firebase.auth().currentUser); i++) await new Promise((ok) => setTimeout(ok, 200));
    let v = null; try { v = (await firebase.database().ref('ordenesVer/' + cod).once('value')).val(); } catch (e) { v = null; }
    if (v) r = { c: { cirujano: v.por, obraSocial: v.os, paciente: { nombre: '', dni: '' } }, ok: v.e === 'valida', anul: v.e === 'anulada' ? { motivo: v.motivo || 'Anulada', t: v.ta || '', nueva: v.nueva || '' } : null, t: v.t, ini: v.ini, dni3: v.dni3 };
  } else DB.cirugias.forEach((c) => { const o = c.orden; if (!o) return;
    if (oaCodigo(c, o.ver) === cod) r = { c, ok: !!o.firma, t: o.firma && o.firma.t };
    (o.anuladas || []).forEach((a) => { if (a.cod === cod) r = { c, ok: false, anul: a, t: a.firma && a.firma.t }; }); });
  const ini = (n) => String(n || '').split(' ').filter(Boolean).map((p) => p[0] + '.').join(' ');
  const cuerpo = !r ? `<h1 style="color:#b91c1c">✕ No encontrada</h1><p>No hay ninguna orden con el código <b>${esc(cod)}</b>.</p>`
    : `<h1 style="color:${r.ok ? '#047857' : '#b91c1c'}">${r.ok ? '✓ Orden válida' : r.anul ? '✕ Orden anulada' : '✕ Sin firmar'}</h1>
      ${r.anul ? `<p>${esc(r.anul.motivo)} el ${esc(fmtDT(r.anul.t))}. La vigente es <b>${esc(r.anul.nueva)}</b>.</p>` : ''}
      <div class="pp-card pp-datos"><div><small>Código</small><b>${esc(cod)}</b></div><div><small>Firmada por</small><b>${esc(r.c.cirujano || '')}</b></div>
      <div><small>Fecha de firma</small><b>${r.t ? esc(fmtDT(r.t)) : '—'}</b></div><div><small>Paciente</small><b>${esc(r.ini != null ? r.ini : ini(r.c.paciente && r.c.paciente.nombre))} · DNI ***${esc(r.dni3 != null ? r.dni3 : String((r.c.paciente && r.c.paciente.dni) || '').slice(-3))}</b></div>
      <div><small>Cobertura</small><b>${esc(r.c.obraSocial || '—')}</b></div></div>
      <p class="pp-pie">Por protección de datos de salud no se muestran el diagnóstico ni el procedimiento.</p>`;
  pintarEstiloPase();
  document.body.className = 'portal-pac';
  let root = $('portal-root'); if (!root) { root = document.createElement('div'); root.id = 'portal-root'; document.body.appendChild(root); }
  root.innerHTML = `<div class="pp"><header class="pp-cab"><div class="pp-marca"><span class="pp-logo">${ICONS.activity || ''}</span><div><b>Verificación de órdenes</b><small>Hospital Regional Ushuaia</small></div></div></header>${cuerpo}</div>`;
}


/* ---------- LA ORDEN SALE SOLA CON EL PASE (pedido de Claudio) ----------
   En la consulta el médico genera el pase: en ese mismo toque se arma y se firma la orden
   con lo que cargó al programar, y les llega al paciente (junto con el pase) y a Admisión.
   El paciente sale de la consulta y va directo a Admisión a iniciar la autorización. */
function oaFirmaAuto(c) {
  const o = oaDe(c, true), u = usuarioActual() || {}, m = oaMedico(c) || u;
  o.firma = { t: nowDT(), por: c.cirujano || m.nombre || '', mat: (m.matricula && m.matricula.numero) || '', esp: c.servicio || m.servicio || '', img: u.firmaImg || '',
    auto: true, datos: { fecha: c.fecha, hora: c.horaProg || '', sala: c.quirofano || '', procBase: c.procedimiento || '' } };
  o.env = null; o.autN = '';
  pushHist(c, `Orden de autorización ${oaCodigo(c, o.ver)} emitida y firmada por ${o.firma.por} al generar el pase: le llega al paciente y a Admisión y Egresos`);
}
function oaPaseCampos(c) {
  const os = c.obraSocial || '', conOS = os && !/sin obra/i.test(os), u = usuarioActual() || {};
  const b = (c.orden && c.orden.b) || {}, p = c.paciente || {};
  return `<div class="oa-pase-blq">
    <div class="oa-pase-tit">📄 Con el pase sale la <b>orden de autorización (R/P)</b> firmada por usted: le llega al paciente y a Admisión y Egresos en el momento.</div>
    ${conOS ? `<div class="field"><label>N.º de afiliado · ${esc(os)} *</label><input type="text" id="pase-afil" value="${esc(b.afil || p.afiliado || '')}" oninput="paseValidar()" autocomplete="off"></div>
    <div class="field"><label>Plan${/pami/i.test(os) ? '' : ' *'}</label><input type="text" id="pase-plan" value="${esc(b.plan || p.plan || '')}" oninput="paseValidar()" autocomplete="off"></div>` : '<p class="form-note">Sin obra social cargada: la orden sale igual, para Admisión.</p>'}
    <p class="form-note" style="margin:4px 0 0">${u.firmaImg ? '✔ Lleva su firma dibujada guardada.' : 'No tiene firma dibujada guardada: sale con su nombre. Puede dibujarla después desde la orden, en el turno.'} Si después cambia la fecha, la sala o la cirugía, la orden se anula sola y sale otra.</p>
  </div>`;
}
(function oaConElPase() {
  const st = document.createElement('style');
  st.textContent = `.oa-pase-blq{border:1.5px solid #99f6e4;background:#f0fdfa;border-radius:14px;padding:12px;margin:4px 0 10px}
.oa-pase-tit{font-size:.9rem;color:#134e4a;margin-bottom:8px;line-height:1.4}.oa-pase-blq input{font-size:16px}`;
  document.head.appendChild(st);
  const _form = paseFormulario;
  paseFormulario = function (c) {
    const h = _form.apply(this, arguments);
    if (!c || (c.orden && c.orden.firma)) return h;
    return h.replace('<label class="check-row pase-ok">', oaPaseCampos(c) + '<label class="check-row pase-ok">')
      .replace(/, sin diagnóstico,/, ', con su orden de autorización,');
  };
  const _falt = paseFaltan;
  paseFaltan = function (c) {
    const f = _falt.apply(this, arguments);
    if (c && !(c.orden && c.orden.firma) && $('pase-afil')) {
      if (!String($('pase-afil').value).trim()) f.splice(f.length - (f.includes('marcar que el paciente aceptó') ? 1 : 0), 0, 'N.º de afiliado');
      if ($('pase-plan') && !String($('pase-plan').value).trim() && !/pami/i.test(c.obraSocial || '')) f.splice(f.length - (f.includes('marcar que el paciente aceptó') ? 1 : 0), 0, 'plan');
    }
    return f;
  };
  const _gen = generarPase;
  generarPase = async function (c) {
    if (c && !(c.orden && c.orden.firma)) {
      const o = oaDe(c, true);
      if ($('pase-afil')) o.b.afil = String($('pase-afil').value).trim();
      if ($('pase-plan')) o.b.plan = String($('pase-plan').value).trim();
      c.paciente = c.paciente || {}; c.paciente.afiliado = o.b.afil; c.paciente.plan = o.b.plan;
      oaFirmaAuto(c);
    }
    const r = await _gen.apply(this, arguments);
    oaPase(c);
    return r;
  };
})();

/* ---------- enganches con la app ---------- */
let oaUltFicha = null;
(function oaEnganchar() {
  const _open = openCirugia;
  openCirugia = function (id) {
    const r = _open.apply(this, arguments);
    oaUltFicha = id;
    try { const c = oaCir(id), g = document.querySelector('#cir-modal .fx-grid'); if (c && g) g.insertAdjacentHTML('afterbegin', oaFichaHTML(c)); } catch (e) { console.error(e); }
    return r;
  };
  // Ingresos se pinta también desde VIEWS (con la función original): se mira el cambio de pantalla.
  const oaObs = new MutationObserver(() => { if (document.querySelector('#main .ing-f:not([data-oa])')) { try { oaIngresosDecorar(); } catch (e) { console.error(e); } } });
  const oaMain = () => { const m = document.getElementById('main'); if (m) oaObs.observe(m, { childList: true, subtree: true }); else setTimeout(oaMain, 300); };
  oaMain();
  const _ing = renderIngresos;
  renderIngresos = function () { const r = _ing.apply(this, arguments); try { oaIngresosDecorar(); } catch (e) { console.error(e); } return r; };
  const _up = upsert;
  upsert = function (col, obj) { if (col === 'cirugias' && obj && obj.orden) { try { oaRevisarCambios(obj); } catch (e) { console.error(e); } } const r = _up.apply(this, arguments); if (col === 'cirugias' && obj && obj.orden) setTimeout(() => oaPase(obj), 0); return r; };
  const _foto = portalFoto;
  portalFoto = function (c) { const f = _foto.apply(this, arguments); try { if (f && !f.caducado && c && c.orden) { const e = oaEstado(c), o = c.orden, ult = o.anuladas[o.anuladas.length - 1];
    f.ord = { e: e.k, cod: oaCodigo(c, o.ver), ver: o.ver, n: oaAut(c) ? oaAut(c).n : '', os: c.obraSocial || '', gest: o.b.gest, anul: ult ? { cod: ult.cod, motivo: ult.motivo } : null }; } } catch (e) { console.error(e); } return f; };
  const _demo = portalDemoFoto;
  portalDemoFoto = function (conExtra) { const r = _demo.apply(this, arguments); if (r && r.extra) { const p = portalDemoPase(); r.extra.orden = (p && p.priv && p.priv.orden) || null; } return r; };
  const _vista = portalVistaEstado;
  portalVistaEstado = function (f) {
    const h = _vista.apply(this, arguments);
    const card = oaPortalHTML(f); if (!card) return h;
    setTimeout(oaPpMini, 0);
    return h.replace('<div id="pp-dyn2">', card + '<div id="pp-dyn2">');
  };
  const _marco = portalMarco;
  portalMarco = function () { return _marco.apply(this, arguments).replace(/, sin diagnóstico\./, '. Tu orden médica (con el diagnóstico) se ve solo después de ingresar el código.'); };
  const _cons = portalConsultar;
  portalConsultar = async function () {
    await _cons.apply(this, arguments);
    const fo = portal.foto && portal.foto.ord, or = portal.extra && portal.extra.orden;
    if (fo && (!or || or.cod !== fo.cod || or.e !== fo.e)) {
      let r2 = null;
      if (!cloudOn) r2 = portalDemoFoto(true);
      else { try { r2 = await portalServicio({ accion: 'estado', token: PORTAL_TOKEN, sesion: portal.sesion, extra: true }); } catch (e) { r2 = null; } }
      if (r2 && r2.extra) { portal.extra = Object.assign(portal.extra || {}, { orden: r2.extra.orden }); if (portal.paso === 'estado') renderPortal(); }
    }
  };
  // portalEscribirPrivado reescribe todo el nodo privado: la orden se vuelve a poner después.
  const _priv = portalEscribirPrivado;
  portalEscribirPrivado = async function (c) { const r = await _priv.apply(this, arguments); try { if (c && c.orden) oaPase(c); } catch (e) {} return r; };
  const _val = portalDemoValidar;
  portalDemoValidar = async function () { const r = await _val.apply(this, arguments); if (r && r.extra) { const p = portalDemoPase(); r.extra.orden = (p && p.priv && p.priv.orden) || null; } return r; };
  const q = new URLSearchParams(location.search);
  if (q.get('verificar')) setTimeout(() => oaVerificar(q.get('verificar')), 1500);
})();

/* ---------- SOLO PARA LA PRUEBA LOCAL: las pestañas se pasan los cambios ----------
   En la app real cada cambio viaja por la base en vivo (Firebase). En la copia local, sin
   esto, una pestaña con datos viejos pisaba lo que otra había guardado (no pasa en la real). */
window.addEventListener('storage', (e) => {
  if (cloudOn || !e.key || e.newValue == null) return;
  const col = Object.keys(LOCAL_KEYS).find((k) => LOCAL_KEYS[k] === e.key);
  if (!col || !DB[col]) return;
  try { const v = JSON.parse(e.newValue); if (Array.isArray(v)) { DB[col] = v; if (!document.getElementById('oa-ov')?.classList.contains('open')) refreshView(); } } catch (x) {}
});
