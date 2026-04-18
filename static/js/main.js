// ── NAV MOBILE ────────────────────────────────────────────────────────────────
const toggle = document.getElementById('navToggle');
const menu = document.getElementById('navMenu');
if (toggle && menu) {
  toggle.addEventListener('click', () => {
    menu.classList.toggle('open');
  });
  // Cerrar al hacer click en un link
  menu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => menu.classList.remove('open'));
  });
}

// ── ACTIVE NAV LINK ───────────────────────────────────────────────────────────
const currentPath = window.location.pathname;
document.querySelectorAll('.nav-link').forEach(link => {
  if (link.getAttribute('href') === currentPath ||
      (currentPath === '/' && link.getAttribute('href') === '/index.html')) {
    link.style.color = 'var(--text)';
    link.style.background = 'var(--surface)';
  }
});

// ── FILTROS SERVICIOS ─────────────────────────────────────────────────────────
const filtros = document.querySelectorAll('.filtro-btn');
if (filtros.length) {
  filtros.forEach(btn => {
    btn.addEventListener('click', () => {
      filtros.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filtro = btn.dataset.filtro;

      // Scroll a la sección correspondiente
      const targets = {
        'manuales': '#manuales',
        'videos': '#videos',
        'capacitaciones': '#capacitaciones'
      };
      if (targets[filtro]) {
        document.querySelector(targets[filtro])?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Filtrar por herramienta
      if (filtro === 'uipath' || filtro === 'rocketbot') {
        document.querySelectorAll('.card').forEach(card => {
          const badges = card.querySelectorAll('.badge');
          let match = false;
          badges.forEach(b => {
            if (b.textContent.toLowerCase().includes(filtro)) match = true;
          });
          card.style.display = match ? '' : 'none';
        });
      } else {
        document.querySelectorAll('.card').forEach(card => {
          card.style.display = '';
        });
      }
    });
  });
}

// ── FORMULARIO CONTACTO ───────────────────────────────────────────────────────
const form = document.getElementById('contactForm');
const feedback = document.getElementById('form-mensaje');
if (form && feedback) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Enviando...';

    try {
      const resp = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      if (resp.ok) {
        feedback.className = 'form-feedback ok';
        feedback.textContent = '✓ Mensaje enviado correctamente. Te respondo pronto.';
        form.reset();
      } else {
        throw new Error('Error en envío');
      }
    } catch {
      feedback.className = 'form-feedback err';
      feedback.textContent = '✗ Error al enviar. Escríbeme directamente por WhatsApp o email.';
    } finally {
      btn.disabled = false;
      btn.querySelector('span').textContent = 'Enviar mensaje';
    }
  });
}

// ── ANIMACIÓN DE ENTRADA ──────────────────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.card, .overview-card, .tool-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity .5s ease, transform .5s ease';
  observer.observe(el);
});
