const menu = document.querySelector('.menu');
const nav = document.querySelector('#nav');
menu.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
}));

const form = document.querySelector('#registrationForm');
const msg = document.querySelector('#formMessage');
const submit = document.querySelector('#submitBtn');
const warning = document.querySelector('#setupWarning');
const config = window.UVG_CONFIG || {};
const closed = Date.now() >= new Date('2026-11-11T00:00:00-06:00').getTime();
const configured = Boolean(config.WORKER_URL && config.TURNSTILE_SITE_KEY && !config.TURNSTILE_SITE_KEY.startsWith('REEMPLAZAR_'));
let sending = false;
let turnstileWidgetId = null;

function message(text, type = '') {
  msg.textContent = text;
  msg.className = `formmsg ${type}`.trim();
}
function updateAvailability() {
  submit.disabled = sending || closed || !configured || turnstileWidgetId === null;
}
if (!configured) {
  warning.hidden = false;
  warning.textContent = 'El registro todavía no está habilitado: falta configurar la clave pública de Turnstile.';
  message('Inscripciones aún no habilitadas.');
}
if (closed) {
  warning.hidden = false;
  warning.textContent = 'El plazo de inscripción finalizó el 10 de noviembre de 2026.';
  message('Inscripciones cerradas.');
}
updateAvailability();

// La API de Turnstile se carga con ?render=explicit en index.html.
window.onloadTurnstile = function () {
  if (!configured || closed || !window.turnstile) return;
  turnstileWidgetId = window.turnstile.render('#turnstileContainer', {
    sitekey: config.TURNSTILE_SITE_KEY,
    callback: () => message('Verificación completada. Ya puedes enviar tu inscripción.'),
    'expired-callback': () => message('La verificación expiró. Vuelve a verificarte.', 'error'),
    'error-callback': () => message('No se pudo completar la verificación. Inténtalo de nuevo.', 'error')
  });
  updateAvailability();
};

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (sending || closed || !configured || turnstileWidgetId === null) return;
  const token = window.turnstile?.getResponse(turnstileWidgetId);
  if (!token) {
    message('Completa la verificación de seguridad antes de enviar.', 'error');
    return;
  }
  const f = new FormData(form);
  const payload = {
    NombreCompleto: String(f.get('nombre') || '').trim(),
    Correo: String(f.get('correo') || '').trim(),
    Telefono: String(f.get('telefono') || '').trim(),
    Colegio: String(f.get('colegio') || '').trim(),
    Cargo: String(f.get('cargo') || '').trim(),
    FechaPreferida: String(f.get('fecha') || ''),
    Disponibilidad: String(f.get('disponibilidad') || ''),
    ConocimientoDesignThinking: String(f.get('conocimientoDesignThinking') || ''),
    ConocimientoScrum: String(f.get('conocimientoScrum') || ''),
    AceptaBases: f.get('aceptacion') !== null,
    turnstileToken: token
  };
  sending = true;
  updateAvailability();
  submit.textContent = 'Enviando solicitud…';
  message('Enviando inscripción…');
  try {
    const response = await fetch(config.WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || result.mensaje || `Error HTTP ${response.status}`);
    form.reset();
    message('✓ Solicitud recibida y registrada. La confirmación de tu jornada llegará por correo.', 'success');
  } catch (error) {
    message(`No fue posible registrar la solicitud: ${error.message}. Consulta con el organizador antes de reintentar para evitar duplicados.`, 'error');
  } finally {
    window.turnstile?.reset(turnstileWidgetId);
    sending = false;
    submit.textContent = 'Enviar solicitud de inscripción →';
    updateAvailability();
  }
});
