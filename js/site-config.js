/* ==========================================================================
   CuantiLogic — configuración de contacto
   --------------------------------------------------------------------------
   Este archivo es el ÚNICO lugar donde se cargan los datos de contacto.
   Mientras un valor esté vacío, el elemento correspondiente NO se muestra:
   no se generan enlaces rotos ni datos de ejemplo.

   Completar cuando el propietario los confirme:

   1) email
      Dirección real de contacto comercial. Ejemplo de formato: "hola@midominio.com"
      Se usa para el enlace mailto del pie.

   2) whatsapp
      SOLO dígitos, con código de país y sin "+", espacios ni guiones.
      Ejemplo de formato: "5493511234567"
      Se usa para construir https://wa.me/<número>

   3) formEndpoint
      URL del servicio que recibe el formulario (Formspree, Netlify Forms,
      endpoint propio, etc.). Debe aceptar POST y devolver 2xx.
      Mientras esté vacío, el formulario NO envía nada y lo informa en pantalla.

   Al completar los tres valores, ejecutar la prueba de envío real antes de publicar.
   ========================================================================== */
window.CUANTILOGIC = {
  email: '',
  whatsapp: '',
  formEndpoint: ''
};
