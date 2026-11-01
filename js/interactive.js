/* ==========================================================================
   CuantiLogic — interactive.js
   Componentes de demostración: flujo, comparador, selector de problemas,
   demos de producto y diagnóstico guiado.
   Sin dependencias. Todo degrada sin JavaScript.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function icon(id) {
    return '<svg aria-hidden="true"><use href="assets/icons.svg#' + id + '"></use></svg>';
  }

  /* ======================================================================
     1. Armá tu flujo
     ====================================================================== */
  var builder = $('[data-builder]');

  if (builder) {
    var SOURCES = {
      whatsapp: { label: 'WhatsApp', icon: 'i-chat', outputs: ['pedido', 'seguimiento'] },
      planillas: { label: 'Planillas', icon: 'i-grid', outputs: ['tablero', 'stock'] },
      tienda: { label: 'Tienda online', icon: 'i-cart', outputs: ['pedido', 'cobro'] },
      inventario: { label: 'Inventario', icon: 'i-box', outputs: ['stock', 'reposicion'] },
      facturacion: { label: 'Facturación', icon: 'i-receipt', outputs: ['comprobante', 'cobro'] },
      crm: { label: 'CRM', icon: 'i-users', outputs: ['seguimiento', 'tablero'] }
    };

    var OUTPUTS = {
      pedido: 'Pedido registrado',
      stock: 'Stock actualizado',
      tablero: 'Tablero al día',
      comprobante: 'Comprobante emitido',
      cobro: 'Cobro conciliado',
      seguimiento: 'Seguimiento del cliente',
      reposicion: 'Alerta de reposición'
    };

    /* Cada herramienta aporta operaciones concretas a cada paso del circuito. */
    var ROLES = {
      capture: {
        tienda: ['Detecta una nueva compra', 'La tienda avisa que hay un pedido nuevo y lo trae con su detalle.'],
        whatsapp: ['Recibe el pedido', 'El mensaje se convierte en un pedido con cliente y fecha.'],
        planillas: ['Reúne los datos', 'Junta lo que vive en distintas planillas y lo ordena en un registro.'],
        crm: ['Identifica al cliente', 'Cruza el contacto con su historial antes de cargar el pedido.'],
        facturacion: ['Toma el comprobante', 'Parte de la factura emitida para no volver a tipear los mismos datos.'],
        inventario: ['Lee el movimiento', 'Registra la entrada o salida de stock cuando ocurre.']
      },
      control: {
        inventario: ['Consulta disponibilidad', 'Verifica stock antes de confirmar y reserva las unidades.'],
        facturacion: ['Valida importes y comprobantes', 'Comprueba que la factura coincida con el pedido.'],
        planillas: ['Controla inconsistencias', 'Detecta diferencias entre lo cargado y el sistema.'],
        crm: ['Revisa el historial', 'Muestra compras anteriores y saldo del cliente.'],
        tienda: ['Valida el pago', 'Confirma que el pago esté acreditado antes de preparar el envío.'],
        whatsapp: ['Confirma con el cliente', 'Pide el dato que falta antes de cerrar el pedido.']
      },
      close: {
        facturacion: ['Emite el comprobante', 'Genera la factura y la deja asociada al pedido.'],
        inventario: ['Actualiza el inventario', 'Descuenta las unidades y deja el stock al día.'],
        planillas: ['Genera el tablero', 'Consolida los datos en un reporte que se actualiza solo.'],
        tienda: ['Publica la disponibilidad', 'Actualiza el catálogo online con el stock real.'],
        crm: ['Actualiza la ficha del cliente', 'Deja registrada la compra y el próximo contacto.'],
        whatsapp: ['Envía la confirmación', 'El cliente recibe el comprobante por el mismo canal.']
      }
    };

    var PRIORITY = {
      capture: ['tienda', 'whatsapp', 'planillas', 'crm', 'facturacion', 'inventario'],
      control: ['inventario', 'facturacion', 'planillas', 'crm', 'tienda', 'whatsapp'],
      close: ['facturacion', 'inventario', 'planillas', 'tienda', 'crm', 'whatsapp']
    };

    var FALLBACK = {
      capture: ['Recibe el dato', 'El dato entra al circuito desde el punto que ya usás.'],
      control: ['Valida la información', 'Revisa que no falte nada antes de registrarlo.'],
      close: ['Registra el movimiento', 'Queda asentado con fecha y responsable.']
    };

    var CANON = ['whatsapp', 'planillas', 'tienda', 'inventario', 'facturacion', 'crm'];
    var DEFAULT = ['whatsapp', 'planillas'];
    var LIMIT = 4;
    var state = DEFAULT.slice();
    var previous = [];
    var expanded = false;

    var colSources = $('[data-col="sources"]', builder);
    var colSteps = $('[data-col="steps"]', builder);
    var colOutputs = $('[data-col="outputs"]', builder);
    var readout = $('[data-readout]', builder);
    var cta = $('[data-builder-cta]', builder);
    var hint = $('[data-builder-hint]', builder);
    var moreBtn = $('[data-flow-more]', builder);

    function listNames(items) {
      if (items.length === 1) return items[0];
      return items.slice(0, -1).join(', ') + ' y ' + items[items.length - 1];
    }

    function stepFor(role) {
      var order = PRIORITY[role];
      for (var i = 0; i < order.length; i++) {
        if (state.indexOf(order[i]) !== -1 && ROLES[role][order[i]]) return ROLES[role][order[i]];
      }
      return FALLBACK[role];
    }

    function lower(text) {
      return text.charAt(0).toLowerCase() + text.slice(1);
    }

    function render() {
      state.sort(function (a, b) {
        return CANON.indexOf(a) - CANON.indexOf(b);
      });

      var picked = state.map(function (k) {
        return { key: k, data: SOURCES[k] };
      });

      var outs = [];
      state.forEach(function (k) {
        SOURCES[k].outputs.forEach(function (o) {
          if (outs.indexOf(o) === -1) outs.push(o);
        });
      });

      var shown = expanded ? outs : outs.slice(0, LIMIT);
      /* La lectura siempre nombra los primeros cuatro y resume el resto,
         se vean o no todos los nodos. */
      var rest = Math.max(0, outs.length - LIMIT);

      var steps = [stepFor('capture'), stepFor('control'), stepFor('close')];

      colSources.innerHTML = picked
        .map(function (p) {
          var isNew = previous.indexOf(p.key) === -1;
          return (
            '<div class="fnode' + (isNew && previous.length ? ' is-new' : '') + '">' +
            icon(p.data.icon) +
            '<span>' + p.data.label + '</span></div>'
          );
        })
        .join('');

      colSteps.innerHTML = steps
        .map(function (s, i) {
          return (
            '<div class="fnode fnode--step"><b>' + (i + 1) + '</b><span>' + s[0] +
            '<em>' + s[1] + '</em></span></div>'
          );
        })
        .join('');

      colOutputs.innerHTML = shown
        .map(function (o) {
          var isNew = !colOutputs.dataset.last || colOutputs.dataset.last.indexOf(o) === -1;
          return (
            '<div class="fnode fnode--out' + (isNew && colOutputs.dataset.last ? ' is-new' : '') + '">' +
            '<i aria-hidden="true"></i><span>' + OUTPUTS[o] + '</span></div>'
          );
        })
        .join('');

      colOutputs.dataset.last = shown.join(',');

      var labels = picked.map(function (p) {
        return p.data.label;
      });
      var outLabels = outs.slice(0, LIMIT).map(function (o) {
        return OUTPUTS[o].toLowerCase();
      });

      readout.innerHTML =
        '<p>Con <b>' + listNames(labels) + '</b> el circuito ' +
        lower(steps[0][0]) + ', ' + lower(steps[1][0]) + ' y ' + lower(steps[2][0]) +
        '. Quedan al día ' + listNames(outLabels) +
        (rest > 0 ? ' y ' + rest + ' resultado' + (rest > 1 ? 's' : '') + ' más' : '') +
        ' sin volver a escribirlo.</p>';

      if (moreBtn) {
        if (outs.length > LIMIT) {
          moreBtn.hidden = false;
          moreBtn.setAttribute('aria-expanded', String(expanded));
          moreBtn.textContent = expanded
            ? 'Mostrar menos'
            : 'Ver los ' + outs.length + ' resultados';
        } else {
          moreBtn.hidden = true;
          moreBtn.setAttribute('aria-expanded', 'false');
        }
      }

      if (cta) cta.setAttribute('href', 'contacto.html?flujo=' + state.join(','));

      previous = state.slice();

      $$('[data-source]', builder).forEach(function (btn) {
        btn.setAttribute('aria-pressed', String(state.indexOf(btn.dataset.source) !== -1));
      });

      if (hint) {
        hint.textContent =
          state.length === 6
            ? 'Están las seis herramientas: el esquema muestra el caso más amplio.'
            : 'Seleccioná las herramientas que usás hoy. Cada combinación cambia el circuito.';
      }
    }

    $$('[data-source]', builder).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.source;
        var i = state.indexOf(key);

        if (i === -1) {
          state.push(key);
        } else if (state.length > 1) {
          state.splice(i, 1);
        } else {
          return;
        }

        render();
      });
    });

    if (moreBtn) {
      moreBtn.addEventListener('click', function () {
        expanded = !expanded;
        colOutputs.dataset.last = '';
        render();
      });
    }

    var reset = $('[data-reset]', builder);
    if (reset) {
      reset.addEventListener('click', function () {
        state = DEFAULT.slice();
        previous = [];
        expanded = false;
        colOutputs.dataset.last = '';
        render();
        var first = $('[data-source]', builder);
        if (first) first.focus();
      });
    }

    render();
  }

  /* ======================================================================
     2. Comparador Hoy / Con el sistema
     ====================================================================== */
  $$('[data-compare]').forEach(function (root) {
    var tabs = $$('[role="tab"]', root);
    var panels = $$('[role="tabpanel"]', root);

    function select(index, focus) {
      tabs.forEach(function (tab, i) {
        var active = i === index;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        if (panels[i]) panels[i].hidden = !active;
      });
      if (focus && tabs[index]) tabs[index].focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        select(i);
      });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
        if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home') next = 0;
        if (e.key === 'End') next = tabs.length - 1;
        if (next !== null) {
          e.preventDefault();
          select(next, true);
        }
      });
    });

    select(0);
  });

  /* ======================================================================
     3. Selector «¿Qué necesitás resolver?»
     ====================================================================== */
  var solver = $('[data-solver]');

  if (solver) {
    var chips = $$('[data-problem]', solver);
    var panels = $$('[data-problem-panel]', solver);
    var emptyPanel = $('[data-problem-empty]', solver);
    var items = $$('.svc-item[data-service]');
    var blocks = $$('.svc-block');

    function apply(problem) {
      chips.forEach(function (c) {
        c.setAttribute('aria-pressed', String(c.dataset.problem === problem));
      });

      var active = null;
      if (emptyPanel) emptyPanel.hidden = !!problem;
      panels.forEach(function (p) {
        var on = p.dataset.problemPanel === problem;
        p.hidden = !on;
        if (on) active = p;
      });

      var keys = active ? (active.dataset.solve || '').split(/\s+/).filter(Boolean) : [];

      items.forEach(function (item) {
        var match = keys.indexOf(item.dataset.service) !== -1;
        item.classList.toggle('is-match', !!problem && match);
        item.classList.toggle('is-dim', !!problem && !match);
      });

      blocks.forEach(function (block) {
        var has = keys.some(function (k) {
          return !!block.querySelector('.svc-item[data-service="' + k + '"]');
        });
        block.classList.toggle('is-dim', !!problem && !has);
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var current = chip.getAttribute('aria-pressed') === 'true';
        var next = current ? '' : chip.dataset.problem;
        apply(next);

      });
    });

    var clear = $('[data-problem-clear]', solver);
    if (clear) {
      clear.addEventListener('click', function () {
        apply('');
      });
    }

    apply('');
  }

  /* ======================================================================
     4. Demo de pedidos
     ====================================================================== */
  var orders = $('[data-orders]');

  if (orders) {
    var rows = $$('[data-order]', orders);
    var detail = $('[data-order-detail]', orders);

    function showOrder(row) {
      rows.forEach(function (r) {
        r.classList.toggle('is-active', r === row);
        var btn = $('.row-btn', r);
        if (btn) btn.setAttribute('aria-pressed', String(r === row));
      });
      if (!detail) return;
      $$('[data-field]', detail).forEach(function (el) {
        var key = el.dataset.field;
        el.textContent = row.dataset[key] || '—';
      });
    }

    rows.forEach(function (row) {
      var btn = $('.row-btn', row);
      if (btn) {
        btn.addEventListener('click', function () {
          showOrder(row);
        });
      }
    });

    if (rows[0]) showOrder(rows[0]);
  }

  /* ======================================================================
     5. Demo de tablero
     ====================================================================== */
  var chart = $('[data-chart]');

  if (chart) {
    var bars = $$('[data-bar]', chart);
    var metricBtns = $$('[data-metric]', chart);
    var caption = $('[data-chart-caption]', chart);
    var labels = { a: 'pedidos', b: 'facturación' };
    var units = { a: 'pedidos', b: 'miles de pesos' };

    function setMetric(metric) {
      metricBtns.forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.dataset.metric === metric));
      });
      bars.forEach(function (bar) {
        bar.style.setProperty('--h', bar.dataset[metric] + '%');
        bar.setAttribute('aria-label', bar.dataset.label + ', ' + labels[metric] + ': ' + bar.dataset[metric] + ' ' + units[metric]);
      });
      if (caption) {
        caption.textContent =
          metric === 'a'
            ? 'Pedidos por semana.'
            : 'Facturación por semana, en miles de pesos.';
      }
    }

    metricBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        setMetric(b.dataset.metric);
      });
    });

    setMetric('a');
  }

  /* ======================================================================
     6. Demo de sincronización
     ====================================================================== */
  var sync = $('[data-sync]');

  if (sync) {
    var runBtn = $('[data-sync-run]', sync);
    var link = $('[data-sync-link]', sync);
    var log = $('[data-sync-log]', sync);
    var running = false;

    var steps = [
      { text: 'Catálogo: 128 productos', state: 'ok', tag: 'OK' },
      { text: 'Precios: 12 cambios', state: 'ok', tag: 'OK' },
      { text: 'Stock: 3 diferencias', state: 'warn', tag: 'REVISAR' },
      { text: 'Pedidos: 0 pendientes', state: 'ok', tag: 'OK' }
    ];

    function paint() {
      log.innerHTML = steps
        .map(function (s, i) {
          return (
            '<li data-state="' + s.state + '"><b>' + String(i + 1).padStart(2, '0') + ' · ' + s.text +
            '</b><span></span><span>' + s.tag + '</span></li>'
          );
        })
        .join('');
    }

    function run() {
      if (running) return;
      running = true;
      if (runBtn) {
        runBtn.disabled = true;
        runBtn.textContent = 'Sincronizando…';
      }
      if (link) link.classList.add('is-running');
      log.innerHTML = '';

      var i = 0;
      var delay = reduce ? 0 : 420;

      function next() {
        if (i >= steps.length) {
          running = false;
          if (runBtn) {
            runBtn.disabled = false;
            runBtn.textContent = 'Volver a sincronizar';
          }
          if (link) link.classList.remove('is-running');
          return;
        }
        var s = steps[i];
        var li = document.createElement('li');
        li.setAttribute('data-state', s.state);
        li.innerHTML =
          '<b>' + String(i + 1).padStart(2, '0') + ' · ' + s.text + '</b><span></span><span>' + s.tag + '</span>';
        log.appendChild(li);
        i += 1;
        if (delay === 0) {
          next();
        } else {
          window.setTimeout(next, delay);
        }
      }

      next();
    }

    if (runBtn) runBtn.addEventListener('click', run);
    paint();
  }

  /* ======================================================================
     7. Demo de inventario
     ====================================================================== */
  var inv = $('[data-inventory]');

  if (inv) {
    var invRows = $$('[data-inv-row]', inv);
    var filter = $('[data-inv-filter]', inv);
    var empty = $('[data-inv-empty]', inv);
    var count = $('[data-inv-count]', inv);

    function applyFilter() {
      var onlyCrit = filter && filter.getAttribute('aria-pressed') === 'true';
      var visible = 0;
      invRows.forEach(function (row) {
        var hidden = onlyCrit && row.dataset.level !== 'crit';
        row.classList.toggle('is-hidden', hidden);
        if (!hidden) visible += 1;
      });
      if (empty) empty.hidden = visible !== 0;
      if (count) count.textContent = String(visible);
    }

    if (filter) {
      filter.addEventListener('click', function () {
        var on = filter.getAttribute('aria-pressed') === 'true';
        filter.setAttribute('aria-pressed', String(!on));
        applyFilter();
      });
    }

    $$('[data-restock]', inv).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var row = btn.closest('[data-inv-row]');
        if (!row) return;
        row.dataset.level = 'ok';
        var meter = $('.dmeter i', row);
        if (meter) meter.style.setProperty('--v', '82%');
        var qty = $('.qty', row);
        if (qty) qty.textContent = row.dataset.target || '24';
        btn.disabled = true;
        btn.textContent = 'Repuesto';
        applyFilter();
      });
    });

    applyFilter();
  }

  /* ======================================================================
     8. Diagnóstico guiado (contacto)
     ====================================================================== */
  var wizard = $('[data-wizard]');

  if (wizard) {
    var form = $('[data-contact-form]', wizard);
    var steps = $$('[data-step]', wizard);
    var progress = $$('[data-progress] li', wizard);
    var backBtn = $('[data-wizard-back]', wizard);
    var backFinal = $('[data-wizard-back-final]', wizard);
    var nextBtn = $('[data-wizard-next]', wizard);
    var nextLabel = $('[data-next-label]', wizard);
    var navHint = $('[data-wizard-hint]', wizard);
    var modeBtns = $$('[data-mode]', wizard);
    var status = $('[data-wizard-status]', wizard);
    var message = $('#mensaje', wizard);
    var messageHint = $('#mensaje-hint', wizard);
    var current = 1;
    var mode = 'guiado';

    var NEXT_LABEL = {
      1: 'Siguiente: elegir problema',
      2: 'Siguiente: tus datos'
    };

    var HINT = {
      1: 'Elegí el rubro para continuar.',
      2: 'Elegí el problema para continuar.'
    };

    function announce(text) {
      if (status) status.textContent = text;
    }

    /* Un paso con opciones obligatorias no habilita el avance hasta tener selección. */
    function stepReady(step) {
      if (!step || !step.hasAttribute('data-required-group')) return true;
      return !!step.querySelector('input[type="radio"]:checked');
    }

    function updateNav() {
      var ready = stepReady(steps[current - 1]);

      if (nextBtn) {
        nextBtn.disabled = !ready;
        nextBtn.setAttribute('aria-disabled', String(!ready));
      }
      if (nextLabel) nextLabel.textContent = NEXT_LABEL[current] || 'Siguiente';
      if (navHint) {
        navHint.hidden = ready;
        navHint.textContent = HINT[current] || '';
      }
    }

    function showStep(n, focus) {
      current = n;
      steps.forEach(function (step) {
        step.hidden = Number(step.dataset.step) !== n;
      });
      progress.forEach(function (li, i) {
        var idx = i + 1;
        li.dataset.state = idx === n ? 'current' : idx < n ? 'done' : '';
      });
      /* En el paso 3 el «Anterior» vive junto al botón de envío. */
      if (backBtn) backBtn.hidden = n === 1 || n === 3;
      if (nextBtn) nextBtn.hidden = n === 3;
      updateNav();
      announce('Paso ' + n + ' de 3');
      if (focus) {
        var legend = $('legend', steps[n - 1]);
        if (legend) {
          legend.setAttribute('tabindex', '-1');
          legend.focus();
        }
      }
    }

    function setMode(next) {
      mode = next;
      modeBtns.forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.dataset.mode === next));
      });

      var guided = next === 'guiado';
      if (progress.length) progress[0].parentNode.hidden = !guided;

      steps.forEach(function (step) {
        var n = Number(step.dataset.step);
        step.hidden = guided ? n !== current : n !== 3;
      });

      if (guided) {
        showStep(current);
      } else {
        if (backBtn) backBtn.hidden = true;
        if (nextBtn) nextBtn.hidden = true;
        if (navHint) navHint.hidden = true;
      }

      if (message) {
        if (guided) {
          message.removeAttribute('data-required');
          if (messageHint) messageHint.textContent = 'Opcional. Podés agregar el detalle que quieras.';
        } else {
          message.setAttribute('data-required', '');
          if (messageHint) messageHint.textContent = 'Contá qué pasa hoy y qué te gustaría que pase.';
        }
      }

      announce(guided ? 'Diagnóstico guiado, paso ' + current + ' de 3' : 'Formulario directo');
    }

    modeBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        setMode(b.dataset.mode);
      });
    });

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        var firstInvalid = window.CLForm ? window.CLForm.validate(steps[current - 1]) : null;
        if (firstInvalid) {
          firstInvalid.focus();
          return;
        }
        showStep(Math.min(current + 1, 3), true);
      });
    }

    [backBtn, backFinal].forEach(function (btn) {
      if (!btn) return;
      btn.addEventListener('click', function () {
        showStep(Math.max(current - 1, 1), true);
      });
    });

    /* Elegir una opción habilita el avance sin tener que buscar el botón. */
    steps.forEach(function (step) {
      step.addEventListener('change', function () {
        if (mode === 'guiado') updateNav();
      });
    });

    /* Nada sale del navegador mientras el visitante no esté en el paso de contacto. */
    document.addEventListener(
      'submit',
      function (e) {
        if (e.target !== form) return;
        if (mode === 'guiado' && current !== 3) {
          e.preventDefault();
          e.stopPropagation();
          updateNav();
        }
      },
      true
    );

    setMode('guiado');
    showStep(1);

    /* Permite que un CTA externo abra el paso de contacto. */
    wizard.__goToStep = function (n) {
      if (n >= 1 && n <= 3) showStep(n, true);
    };
  }

  /* ======================================================================
     9. Enlace desde «Armá tu flujo»
     ====================================================================== */
  (function prefill() {
    if (!/contacto\.html$/.test(location.pathname)) return;
    var params = new URLSearchParams(location.search);

    /* CTA de una demostración: preselecciona el motivo y salta al paso de contacto. */
    var MOTIVOS = {
      pedidos: 'Pedidos y ventas',
      stock: 'Stock e inventario',
      conectados: 'Sistemas conectados',
      reportes: 'Reportes y datos',
      venta: 'Venta online',
      modernizar: null
    };
    var motivo = params.get('motivo');

    if (motivo && motivo in MOTIVOS) {
      var valor = MOTIVOS[motivo];
      var radio = valor
        ? document.querySelector('input[name="problema"][value="' + valor + '"]')
        : null;
      if (radio) radio.checked = true;

      /* Sin equivalente en la lista de motivos: el contexto viaja en el mensaje. */
      if (!valor) {
        var caja = document.getElementById('mensaje');
        if (caja && !caja.value) {
          caja.value = 'Vengo de Servicios: quiero modernizar un sistema que ya está en uso.';
        }
      }

      var wiz = document.querySelector('[data-wizard]');
      if (wiz && wiz.__goToStep) wiz.__goToStep(3);

      var panel = document.querySelector('[data-wizard]');
      if (panel) {
        var aviso = document.createElement('p');
        aviso.className = 'small';
        aviso.style.marginTop = '0.8rem';
        aviso.textContent =
          'Tomamos el motivo de tu consulta: ' +
          (valor || 'modernización de un sistema en uso') +
          '. Solo faltan tus datos.';
        var formEl = panel.querySelector('[data-contact-form]');
        if (formEl) panel.insertBefore(aviso, formEl);
      }
      return;
    }

    var flujo = params.get('flujo');
    if (!flujo) return;
    var textarea = document.getElementById('mensaje');
    if (!textarea) return;

    var names = {
      whatsapp: 'WhatsApp',
      planillas: 'planillas',
      tienda: 'tienda online',
      inventario: 'inventario',
      facturacion: 'facturación',
      crm: 'CRM'
    };
    var picked = flujo
      .split(',')
      .map(function (k) {
        return names[k] || '';
      })
      .filter(Boolean);

    if (!picked.length) return;
    textarea.value =
      'Vengo de «Armá tu flujo». Me interesa conectar ' + picked.join(', ') + ' en un solo circuito.';

    var form = textarea.closest('form');
    if (form) {
      var note = document.createElement('p');
      note.className = 'small';
      note.style.marginTop = '0.8rem';
      note.textContent =
        'Incluimos tu selección de «Armá tu flujo» (' + picked.join(', ') + ') en la consulta.';
      form.parentNode.insertBefore(note, form);
    }
  })();
})();
