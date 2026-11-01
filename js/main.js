/* ==========================================================================
   CuantiLogic — main.js
   Sin dependencias. Sin efectos invasivos.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- 0. Datos de contacto (js/site-config.js) ---------- */
  var CFG = window.CUANTILOGIC || {};

  (function aplicarContacto() {
    var email = (CFG.email || '').trim();
    var wa = (CFG.whatsapp || '').trim();

    Array.prototype.forEach.call(document.querySelectorAll('[data-contact-email]'), function (el) {
      if (!email) return;
      el.setAttribute('href', 'mailto:' + email);
      el.textContent = email;
      var li = el.closest('li');
      if (li) li.hidden = false;
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-contact-whatsapp]'), function (el) {
      if (!wa) return;
      el.setAttribute('href', 'https://wa.me/' + wa.replace(/\D/g, ''));
      var li = el.closest('li');
      if (li) li.hidden = false;
    });
  })();

  /* ---------- 1. Navegación móvil ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');

  if (toggle && links) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      links.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };

    toggle.addEventListener('click', function (e) {
      /* Con JS el menú lo controla la clase; el href="#nav-links" es el fallback sin JS. */
      e.preventDefault();
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 760 && toggle.getAttribute('aria-expanded') === 'true') setOpen(false);
    });
  }

  /* ---------- 2. Reveal al scroll (con red de seguridad) ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (reveals.length) {
    var show = function (el) {
      el.classList.add('is-in');
    };

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              show(entry.target);
              io.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
      );
      reveals.forEach(function (el) {
        io.observe(el);
      });
    } else {
      reveals.forEach(show);
    }

    /* Si el observer no dispara, nada queda invisible. */
    window.setTimeout(function () {
      reveals.forEach(function (el) {
        if (!el.classList.contains('is-in')) {
          var r = el.getBoundingClientRect();
          if (r.top < window.innerHeight * 1.2) show(el);
        }
      });
    }, 2200);
  }

  /* ---------- 3. Formulario de contacto ---------- */
  var form = document.querySelector('[data-contact-form]');

  if (form) {
    var status = form.querySelector('[data-form-status]');
    var endpoint = (form.getAttribute('data-endpoint') || CFG.formEndpoint || '').trim();

    var MSG = {
      pending:
        'El envío del formulario todavía no está habilitado: falta configurar su destino. No se envió ningún dato.',
      error: 'Revisá los campos marcados y volvé a intentar.',
      network: 'No pudimos enviar el mensaje. Revisá tu conexión y probá de nuevo.',
      rejected: 'El servicio rechazó el envío. Probá de nuevo en unos minutos.',
      rate: 'Recibimos varios envíos seguidos. Esperá unos minutos antes de volver a intentar.',
      server: 'El servicio de envío no está respondiendo. Probá de nuevo más tarde.',
      ok: 'Mensaje enviado. Te vamos a responder por el medio que nos indicaste.'
    };

    var setStatus = function (state, text) {
      if (!status) return;
      status.setAttribute('data-state', state);
      status.textContent = text;
    };

    var clearError = function (field) {
      field.removeAttribute('aria-invalid');
      var err = document.getElementById(field.id + '-error');
      if (err) err.textContent = '';
    };

    var setError = function (field, text) {
      field.setAttribute('aria-invalid', 'true');
      var err = document.getElementById(field.id + '-error');
      if (err) err.textContent = text;
    };

    var fields = Array.prototype.slice.call(form.querySelectorAll('[data-required]'));
    var sending = false;

    fields.forEach(function (field) {
      var onChange = function () {
        clearError(field);
      };
      field.addEventListener('input', onChange);
      field.addEventListener('change', onChange);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* Evita envíos duplicados mientras hay una solicitud en curso. */
      if (sending) return;

      var firstInvalid = null;

      fields.forEach(function (field) {
        /* Casilla de consentimiento: no se valida por valor sino por estado. */
        if (field.type === 'checkbox') {
          if (!field.checked) {
            setError(field, 'Tenés que aceptar la política de privacidad para enviar.');
            if (!firstInvalid) firstInvalid = field;
          } else {
            clearError(field);
          }
          return;
        }

        var value = (field.value || '').trim();
        if (!value) {
          setError(field, 'Este campo es obligatorio.');
          if (!firstInvalid) firstInvalid = field;
        } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
          setError(field, 'Revisá el formato del correo.');
          if (!firstInvalid) firstInvalid = field;
        } else {
          clearError(field);
        }
      });

      if (firstInvalid) {
        setStatus('error', MSG.error);
        firstInvalid.focus();
        return;
      }

      /* Sin destino configurado: NO se simula un envío exitoso. */
      if (!endpoint) {
        setStatus('info', MSG.pending);
        return;
      }

      var submitBtn = form.querySelector('[type="submit"]');
      sending = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
      }
      setStatus('info', 'Enviando…');

      fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      })
        .then(function (res) {
          return res
            .json()
            .catch(function () {
              return {};
            })
            .then(function (data) {
              return { res: res, data: data };
            });
        })
        .then(function (r) {
          var status = r.res.status;
          var data = r.data || {};

          /* Éxito solo si el proveedor confirma: 2xx y sin ok:false explícito. */
          if (r.res.ok && data.ok !== false) {
            form.reset();
            fields.forEach(clearError);
            setStatus('ok', MSG.ok);
            return;
          }

          if (status === 422 && data.errors && data.errors.length) {
            data.errors.forEach(function (err) {
              if (!err || !err.field) return;
              var target = form.querySelector('[name="' + err.field + '"]');
              if (target) setError(target, 'Revisá este dato.');
            });
            setStatus('error', 'El servicio no aceptó algunos datos. Revisá los campos marcados.');
            return;
          }

          if (status === 429) {
            setStatus('error', MSG.rate);
            return;
          }

          if (status >= 500) {
            setStatus('error', MSG.server);
            return;
          }

          setStatus('error', MSG.rejected);
        })
        .catch(function () {
          setStatus('error', MSG.network);
        })
        .then(function () {
          sending = false;
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.removeAttribute('aria-busy');
          }
        });
    });
  }

  /* ---------- 4. Año del pie ---------- */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
