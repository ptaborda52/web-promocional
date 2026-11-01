/* ==========================================================================
   CuantiLogic — configuración de contacto
   --------------------------------------------------------------------------
   Este archivo es el ÚNICO lugar donde se cargan los datos de contacto.
   Si un valor queda vacío, el elemento correspondiente NO se muestra.

   1) email       → enlace mailto del pie.
   2) whatsapp    → SOLO dígitos, con código de país, sin "+" ni espacios.
                    Se usa para construir https://wa.me/<número>
   3) formEndpoint → URL que recibe el formulario por POST.

   ---------------------------------------------------------------------------
   ESTADO ACTUAL (2026-11-01)
   - email: contacto@cuantilogic.tech
   - formEndpoint: Formspree, formulario mljjpnao
   - whatsapp: SIN DEFINIR — el enlace permanece oculto a propósito.

   El envío usa fetch con FormData y cabecera Accept: application/json,
   que es el modo AJAX documentado por Formspree. No se agregó SDK.

   ---------------------------------------------------------------------------
   AJUSTES QUE DEPENDEN DEL PANEL DE FORMSPREE (no del código)

   a) Allowed domains: restringir los orígenes autorizados a
      cuantilogic.tech y www.cuantilogic.tech.
      Mientras el sitio se pruebe en GitHub Pages, el origen
      ptaborda52.github.io también debe estar permitido; conviene quitarlo
      después del lanzamiento.

   b) Protección antispam: activar reCAPTCHA en el panel o dejar actuar al
      honeypot _gotcha que ya incluye el formulario.
      No se agregó captcha en el cliente: eso obligaría a cargar un script
      externo y rompería la regla de cero dependencias.

   c) Autoresponder (opcional): si se activa, cada persona recibe una
      confirmación automática. Hoy no está activado.

   ---------------------------------------------------------------------------
   PRUEBA DE ACEPTACIÓN (repetir si se cambia el endpoint)

   1. Campos vacíos → el cliente bloquea, no se envía nada.
   2. Email inválido → el cliente bloquea, no se envía nada.
   3. Datos válidos → POST 200 y mensaje de éxito en pantalla.
   4. El envío aparece en Submissions del panel de Formspree.
   5. Llega la notificación a contacto@cuantilogic.tech.
   6. Endpoint inexistente → mensaje de error, nunca un éxito falso.
   ========================================================================== */
window.CUANTILOGIC = {
  email: 'contacto@cuantilogic.tech',
  whatsapp: '',
  formEndpoint: 'https://formspree.io/f/mljjpnao'
};
