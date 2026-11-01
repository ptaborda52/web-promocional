/* ==========================================================================
   CuantiLogic — main.js
   Sin dependencias. Sin efectos invasivos.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- 1. Navegación móvil ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');

  if (toggle && links) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      links.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };

    toggle.addEventListener('click', function () {
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
    var endpoint = (form.getAttribute('data-endpoint') || '').trim();

    var MSG = {
      pending:
        'El envío del formulario todavía no está habilitado: falta configurar su destino. No se envió ningún dato.',
      error: 'Revisá los campos marcados y volvé a intentar.',
      network: 'No pudimos enviar el mensaje. Probá de nuevo en unos minutos.',
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

    fields.forEach(function (field) {
      field.addEventListener('input', function () {
        clearError(field);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var firstInvalid = null;

      fields.forEach(function (field) {
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
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
      }

      fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          form.reset();
          setStatus('ok', MSG.ok);
        })
        .catch(function () {
          setStatus('network', MSG.network);
        })
        .then(function () {
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
