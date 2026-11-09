'use strict';
// Este archivo es público en GitHub Pages. NUNCA guardar secretos aquí.
// El backend de Cloudflare DEBE verificar identidad y permisos antes de responder.
const cfg = window.UVG_CONFIG || {};
const workerUrl = typeof cfg.WORKER_URL === 'string' ? cfg.WORKER_URL : '';
const adminApi = workerUrl.endsWith('/registro') ? workerUrl.slice(0, -'/registro'.length) + '/admin/inscripciones' : '';
const el = id => document.getElementById(id);
const state = { rows: [], ready: false };
const fields = ['ID','NombreCompleto','Correo','Telefono','Colegio','Cargo','FechaPreferida','Disponibilidad','Estado','FechaRegistro'];
const statusEl = el('status');
function notify(message, kind = '') { statusEl.textContent = message; statusEl.className = `admin-status ${kind}`.trim(); }
function str(v) { return v === null || v === undefined ? '' : String(v); }
function safeCell(v) { return str(v); }
function formatDate(v) { const d = str(v); return ({'2026-11-16':'16 nov.','2026-11-17':'17 nov.','2026-11-18':'18 nov.'})[d] || d; }
function enableControls(enabled) { ['refreshBtn','exportBtn','searchInput','dateFilter','statusFilter'].forEach(id => el(id).disabled = !enabled); }
function clearData() { state.rows = []; state.ready = false; enableControls(false); ['totalCount','count16','count17','count18'].forEach(id => el(id).textContent = '—'); el('tableBody').replaceChildren(); const tr=document.createElement('tr'); const td=document.createElement('td'); td.colSpan=10;td.className='empty';td.textContent='No hay datos disponibles.';tr.append(td);el('tableBody').append(tr);el('resultsCount').textContent='Sin datos cargados'; }
function filtered() { const q=el('searchInput').value.trim().toLocaleLowerCase('es'); const date=el('dateFilter').value; const status=el('statusFilter').value; return state.rows.filter(r => (!date || str(r.FechaPreferida)===date) && (!status || str(r.Estado)===status) && (!q || [r.NombreCompleto,r.Correo,r.Colegio].some(v=>str(v).toLocaleLowerCase('es').includes(q)))); }
function render() {
  if (!state.ready) return;
  const data=filtered(); const body=el('tableBody');body.replaceChildren();
  if (!data.length) { const tr=document.createElement('tr');const td=document.createElement('td');td.colSpan=10;td.className='empty';td.textContent='No hay registros que coincidan con los filtros.';tr.append(td);body.append(tr); }
  for (const row of data) { const tr=document.createElement('tr'); for (const key of fields) { const td=document.createElement('td');td.textContent=safeCell(key==='FechaPreferida'?formatDate(row[key]):row[key]);tr.append(td); }body.append(tr); }
  el('resultsCount').textContent=`Mostrando ${data.length} de ${state.rows.length} inscripciones`;
}
function metrics() {
  el('totalCount').textContent=state.rows.length.toLocaleString('es-GT');
  for (const [id,date] of [['count16','2026-11-16'],['count17','2026-11-17'],['count18','2026-11-18']]) el(id).textContent=state.rows.filter(r=>str(r.FechaPreferida)===date).length.toLocaleString('es-GT');
  const current=el('statusFilter').value;const options=[...new Set(state.rows.map(r=>str(r.Estado)).filter(Boolean))].sort();const select=el('statusFilter');select.replaceChildren(new Option('Todos los estados',''));for (const s of options)select.add(new Option(s,s));select.value=options.includes(current)?current:'';
}
async function load() {
  if (!adminApi) {clearData();notify('No se pudo determinar la URL del Worker. Verifica config.js del sitio público.','error');return;}
  el('connectBtn').disabled=true;el('refreshBtn').disabled=true;notify('Consultando el servicio administrativo protegido…');
  try {
    const response=await fetch(adminApi,{method:'GET',credentials:'include',headers:{Accept:'application/json'},cache:'no-store'});
    if (response.status===401 || response.status===403) throw new Error('Acceso no autorizado. Primero debe configurarse la autenticación en Cloudflare.');
    if (!response.ok) throw new Error(`El servicio respondió HTTP ${response.status}.`);
    const payload=await response.json();
    // Contrato previsto: {ok:true, inscripciones:[...]}; nunca se aceptan datos no autenticados.
    if (payload.ok !== true || !Array.isArray(payload.inscripciones)) throw new Error('El servicio devolvió un formato inesperado.');
    state.rows=payload.inscripciones;state.ready=true;enableControls(true);metrics();render();notify(`Consulta completada. ${state.rows.length} inscripciones cargadas.`,'success');
  } catch (error) {
    clearData();
    notify(`Todavía no se puede consultar D1: ${error.message} Si Cloudflare Access está configurado, abre primero el enlace de autenticación.`, 'error');
  } finally {el('connectBtn').disabled=false;}
}
// El acceso abre la URL protegida para iniciar sesión cuando configuremos Cloudflare Access.
// No introduce contraseñas ni claves en el navegador.
el('connectBtn').addEventListener('click',()=>{if (!adminApi) {notify('Falta configurar la URL del Worker en config.js.','error');return;}window.open(adminApi,'_blank','noopener,noreferrer');notify('Se abrió la dirección protegida del Worker. Cuando completes la autenticación, pulsa «Actualizar datos».');el('refreshBtn').disabled=false;});
el('refreshBtn').addEventListener('click',load);
for(const id of ['searchInput','dateFilter','statusFilter']) el(id).addEventListener(id==='searchInput'?'input':'change',render);
// Prevención de interpretación de fórmulas al abrir CSV en Excel/LibreOffice.
function csvCell(v){let value=str(v);if (/^[\s\u0000-\u001f]*[=+@\-]/.test(value))value="'"+value;return '"'+value.replace(/"/g,'""')+'"';}
el('exportBtn').addEventListener('click',()=>{if(!state.ready)return;const lines=[fields.join(';'),...filtered().map(r=>fields.map(k=>csvCell(r[k])).join(';'))];const blob=new Blob(['\uFEFF'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='inscripciones_uvg.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);});
clearData();
