# Portal UVG · Design Thinking y Scrum

## Contenido del ZIP
- `index.html`, `styles.css`, `main.js`, `config.js`: sitio público responsivo y formulario propio.
- `assets/logo-uvg-principal.png`, `assets/logo-uvg-aniversario.png`, `assets/banner-uvg-original.jpg`: **archivos originales extraídos del Word** (sin redibujar ni modificar). Puede mantenerlos o sustituirlos por los originales institucionales autorizados con exactamente esos nombres.
- `assets/taller-ilustrativo.jpg`: imagen ilustrativa generada artificialmente para el sitio; no corresponde a un evento real.
- `documentos/bases-participacion.pdf`: conversión del Word adjunto; reemplácelo cuando se publique la versión con URL definitiva.
- `backend/Code.gs`: receptor de inscripciones para Google Sheets privado.

## Paso 1. Crear la hoja de registros
1. Ingrese con una cuenta de Google autorizada por UVG (si la institución lo permite).
2. Cree una hoja de Google Sheets privada llamada `Inscripciones UVG - Design Thinking Scrum 2026`.
3. Abra **Extensiones → Apps Script**. Pegue todo el contenido de `backend/Code.gs` en `Code.gs` y guarde.
4. Ejecute manualmente la función `inicializar` y autorice los permisos de acceso a la hoja. Verifique que se creó la pestaña `Inscripciones` con sus encabezados.
5. En **Implementar → Nueva implementación → Aplicación web**, seleccione **Ejecutar como: Yo** y **Quién tiene acceso: Cualquier persona** (si la política de UVG permite este acceso). Copie la URL terminada en `/exec`.
6. Pegue esa URL entre comillas en `config.js`, en `SCRIPT_URL`.
7. Mantenga la hoja **privada**. No publique la hoja ni agregue credenciales al repositorio.

**Importante:** Google Apps Script como web app pública requiere autorización institucional; no lo habilite si la política de UVG lo impide. Esta solución guarda los datos en Google Sheets, no automáticamente en Excel de OneDrive. Puede descargar `Archivo → Descargar → Microsoft Excel (.xlsx)` para obtener el Excel. Para escritura directa a Excel institucional se necesita una integración Microsoft 365 aprobada (por ejemplo Power Automate con entrada HTTP, si la licencia lo permite).

## Paso 2. Probar antes de publicar
1. Abra `index.html` desde un servidor local (por ejemplo VS Code Live Server). No basta con abrir `file://` para pruebas fiables.
2. Complete una inscripción de prueba y espere el mensaje **“Solicitud recibida y registrada”**.
3. Confirme que se creó una fila en la hoja `Inscripciones` y que el registro no se duplicó al reenviar el mismo correo.
4. Si aparece un mensaje de falta de confirmación, revise los permisos y el despliegue de Apps Script. No asuma que el registro llegó hasta comprobarlo en la hoja.
5. Haga una prueba desde un teléfono y otra desde el dominio publicado de GitHub Pages. Compruebe que la respuesta del backend llega al formulario.
6. **No anuncie el sitio ni reciba datos reales hasta verificar este flujo de punta a punta y validar el aviso de privacidad con UVG.**

## Paso 3. Publicar en GitHub Pages
1. Cree un repositorio de GitHub, por ejemplo `uvg-design-thinking-scrum` (público para GitHub Pages gratuito).
2. Suba **el contenido interior de esta carpeta** a la raíz del repositorio, no el ZIP ni una carpeta contenedora. El directorio `backend` puede mantenerse fuera del repositorio público porque solo sirve para copiar el script; **recomendado eliminar `backend/` antes de publicar**.
3. En el repositorio vaya a **Settings → Pages → Build and deployment**. Elija **Deploy from a branch**, rama `main`, carpeta `/(root)` y guarde.
4. Espere a que GitHub indique la dirección, normalmente `https://USUARIO.github.io/uvg-design-thinking-scrum/`.
5. Pruebe todos los enlaces, la descarga del PDF y la inscripción real desde esa dirección.
6. Actualice en el Word y en el PDF el texto `[Enlace pendiente de publicación]` por la URL real y reemplace `documentos/bases-participacion.pdf`.
7. Genere un QR **real y verificable** que apunte a la página de inicio, nunca directamente al formulario. Pruébelo con varios teléfonos.

## Personalización
- Colores en `styles.css`: `--green:#008d36` y `--white:#fff`.
- Logos originales en `assets/` (no los redibuje, cambie colores ni los distorsione).
- Imagen ilustrativa en `assets/taller-ilustrativo.jpg`.
- Contacto: `eomarroquin@uvg.edu.gt`.
- La página bloquea envíos después del 10/11/2026 y el backend vuelve a verificar el cierre con horario de Guatemala.

## Límites y seguridad
- La página es pública y **no contiene un panel administrativo público**; la hoja privada es el panel inicial.
- El formulario no pide DPI, visa, pasaporte ni otros documentos sensibles; estos no son necesarios para inscribirse al taller.
- El backend valida campos, evita registros repetidos por correo e ID, usa bloqueo concurrente y previene fórmulas inyectadas en la hoja.
- Un endpoint público de Apps Script no es una plataforma antispam robusta. Para una convocatoria de mayor escala, incorpore controles adicionales y revisión institucional de seguridad, privacidad, retención de datos y acceso.
- La confirmación de **participación** es manual por correo; el mensaje automático solo confirma recepción de solicitud.
- El proyecto es una implementación inicial: revise y pruebe los permisos de despliegue antes de recibir datos reales.
