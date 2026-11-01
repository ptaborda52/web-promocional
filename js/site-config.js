/* ==========================================================================
   CuantiLogic — configuración de contacto
   --------------------------------------------------------------------------
   Este archivo es el ÚNICO lugar donde se cargan los datos de contacto.
   Mientras un valor esté vacío, el elemento correspondiente NO se muestra:
   no se generan enlaces rotos ni datos de ejemplo.

   1) email
      Dirección real de contacto comercial. Ejemplo de formato: "hola@midominio.com"
      Se usa para el enlace mailto del pie.

   2) whatsapp
      SOLO dígitos, con código de país y sin "+", espacios ni guiones.
      Ejemplo de formato: "5493511234567"
      Se usa para construir https://wa.me/<número>

   3) formEndpoint
      URL del servicio que recibe el formulario. Debe aceptar POST con
      FormData y devolver un estado 2xx. Mientras esté vacío, el formulario
      NO envía nada y lo informa en pantalla.

   ---------------------------------------------------------------------------
   PARA INTEGRAR UN PROVEEDOR DE FORMULARIOS HACE FALTA:

   a) Una cuenta en el proveedor (Formspree, Netlify Forms, Basin, o un
      endpoint propio). Es un servicio externo: implica aceptar sus términos
      y, si aloja datos fuera del país, una transferencia internacional que
      debe figurar en la política de privacidad.

   b) La URL del endpoint, con estas características:
      - acepta POST con multipart/form-data
      - responde 2xx en el éxito (el código considera éxito cualquier 2xx)
      - devuelve CORS habilitado para el origen del sitio, o acepta el envío
        sin preflight (FormData simple no dispara preflight)

   c) Protección contra spam del lado del proveedor (honeypot o captcha
      invisible). No hay protección en el cliente y no corresponde agregarla
      acá: un honeypot en JS no frena un bot que no ejecuta JS.

   d) Completar el campo formEndpoint de este archivo.

   ---------------------------------------------------------------------------
   PRUEBA OBLIGATORIA ANTES DE PUBLICAR (no se puede simular):

   1. Cargar formEndpoint con la URL real.
   2. Enviar el formulario desde el sitio con datos de prueba propios.
   3. Confirmar tres cosas:
      - el mensaje en pantalla pasa a "Mensaje enviado"
      - el envío aparece en el panel del proveedor
      - el correo de notificación llega a la casilla configurada
   4. Repetir con un email inválido y con campos vacíos para verificar que
      el cliente bloquea antes de enviar (no debe llegar nada al proveedor).
   5. Verificar el caso de error: desactivar el endpoint o usar una URL
      inexistente y confirmar que se muestra "No pudimos enviar el mensaje"
      y que NO se muestra un éxito falso.
   ========================================================================== */
window.CUANTILOGIC = {
  email: '',
  whatsapp: '',
  formEndpoint: ''
};
