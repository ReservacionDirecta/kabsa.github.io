// Inicialización de AOS si está disponible
document.addEventListener('DOMContentLoaded', function () {
  // Cargar parciales (navbar/footer) si hay contenedores data-include
  (async function loadPartials() {
    const includeEls = Array.from(document.querySelectorAll('[data-include]'));
    if (!includeEls.length) {
      afterPartialsInit();
      return;
    }
    await Promise.all(includeEls.map(async (el) => {
      const url = el.getAttribute('data-include');
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        const html = await res.text();
        el.outerHTML = html; // reemplazar el contenedor por el contenido
      } catch (e) {
        console.error('No se pudo cargar parcial:', url, e);
      }
    }));
    afterPartialsInit();
  })();

  function afterPartialsInit() {
  // Render de íconos Lucide si está disponible
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
  if (window.AOS) {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      mirror: false,
      offset: 50,
      disable: 'mobile'
    });
  }

  // Estados de carga en formularios: deshabilita botón y muestra spinner
  const forms = document.querySelectorAll('form');
  forms.forEach((form) => {
    form.addEventListener('submit', () => {
      const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
      if (submitBtn) {
        submitBtn.classList.add('is-loading');
        submitBtn.setAttribute('aria-busy', 'true');
        submitBtn.disabled = true;
      }
    });
  });

  // Micro-interacción: feedback en enlaces con data-loading
  document.querySelectorAll('[data-loading]')?.forEach((el) => {
    el.addEventListener('click', () => {
      el.classList.add('is-loading');
      el.setAttribute('aria-busy', 'true');
    });
  });

  // Lazy load defensivo para imágenes (si no tienen loading definido)
  document.querySelectorAll('img:not([loading])').forEach((img) => {
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
  });

  // Scroll reveal simple con IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.getAttribute('data-delay') || 0;
        setTimeout(() => {
          entry.target.classList.add('fade-in-up');
        }, parseInt(delay));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

  // Toggle menú móvil si existen los elementos
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    window.toggleMenu = function () {
      mobileMenu.classList.toggle('hidden');
      mobileMenu.classList.toggle('-translate-x-full');
    };
    menuBtn.addEventListener('click', window.toggleMenu);
  }

  // Dropdown persistente (hover/click) para "El Grupo"
  (function setupDropdown() {
    const container = document.querySelector('[data-dropdown="group-menu"]');
    if (!container) return;
    const btn = container.querySelector('[data-dropdown-toggle]');
    const panel = container.querySelector('[data-dropdown-panel]');
    if (!btn || !panel) return;

    let isOpen = false;
    let closeTimeoutId = null;

    function open() {
      if (closeTimeoutId) { clearTimeout(closeTimeoutId); closeTimeoutId = null; }
      panel.classList.remove('hidden');
      btn.setAttribute('aria-expanded', 'true');
      isOpen = true;
    }
    function close() {
      if (closeTimeoutId) { clearTimeout(closeTimeoutId); closeTimeoutId = null; }
      panel.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
      isOpen = false;
    }
    function scheduleClose() {
      if (closeTimeoutId) { clearTimeout(closeTimeoutId); }
      closeTimeoutId = setTimeout(() => {
        // cerrar solo si el mouse no volvió a entrar
        if (!container.matches(':hover')) close();
      }, 200);
    }

    // Abrir/cerrar por click
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (isOpen) close(); else open();
    });

    // Mantener abierto al pasar del botón al panel (hover con tolerancia)
    container.addEventListener('mouseenter', open);
    container.addEventListener('mouseleave', scheduleClose);
    panel.addEventListener('mouseenter', open);
    panel.addEventListener('mouseleave', scheduleClose);
    btn.addEventListener('mouseenter', open);
    btn.addEventListener('mouseleave', scheduleClose);

    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => { if (!container.contains(e.target)) close(); });
  })();

  // Funciones globales de modales reutilizables
  if (!window.openModal) {
    window.openModal = function(modalId) {
      const modal = document.getElementById(modalId);
      if (!modal) return;
      modal.classList.remove('hidden');
      modal.classList.add('modal-animation');
      document.body.classList.add('overflow-hidden');
      setTimeout(() => {
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
          modalContent.classList.remove('opacity-0', 'translate-y-10');
          modalContent.classList.add('opacity-100', 'translate-y-0');
          modalContent.style.transform = 'scale(1)';
        }
      }, 10);
    }
  }
  if (!window.closeModal) {
    window.closeModal = function(modalId) {
      const modal = document.getElementById(modalId);
      if (!modal) return;
      const modalContent = modal.querySelector('.modal-content');
      if (modalContent) {
        modalContent.classList.remove('opacity-100', 'translate-y-0');
        modalContent.classList.add('opacity-0', 'translate-y-10');
      }
      setTimeout(() => {
        modal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      }, 300);
    }
  }

  // Cerrar modal al hacer clic fuera y con ESC
  document.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      if (event.target === modal) {
        const modalId = modal.getAttribute('id');
        window.closeModal(modalId);
      }
    });
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const open = document.querySelector('.modal:not(.hidden)');
      if (open) {
        window.closeModal(open.id);
      }
    }
  });

  // Resaltar enlace activo del navbar según la página actual
  (function highlightActiveNav() {
    const filename = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const isHome = filename === '' || filename === 'index.html';
    const allLinks = Array.from(document.querySelectorAll('header a[href]'));

    function activate(link) {
      link.classList.add('text-kabsa-blue');
      link.classList.add('font-semibold');
      link.classList.remove('text-gray-600');
    }

    // Limpiar estado previo
    allLinks.forEach(a => {
      a.classList.remove('font-semibold');
      if (!a.classList.contains('bg-whatsapp-green')) {
        a.classList.add('text-gray-600');
        a.classList.remove('text-kabsa-blue');
      }
    });

    // Regla para home
    if (isHome) {
      const homeLinks = allLinks.filter(a => a.getAttribute('href').toLowerCase().startsWith('index.html'));
      homeLinks.forEach(activate);
      return;
    }

    // Otras páginas
    const currentLinks = allLinks.filter(a => {
      const href = (a.getAttribute('href') || '').toLowerCase();
      if (href.endsWith('#inicio')) return false; // evitar anchor de home
      const hrefFile = href.split('#')[0];
      return hrefFile.endsWith(filename);
    });
    if (currentLinks.length) currentLinks.forEach(activate);
  })();

  // Lógica de formulario de contacto si existe el formulario
  const contactForm = document.getElementById('contact-form');
  const formSuccessMessage = document.getElementById('form-success');
  const formErrorMessage = document.getElementById('form-error');
  if (contactForm) {
    const requiredFields = contactForm.querySelectorAll('[required]');
    function showFieldError(field) {
      field.classList.add('border-red-500');
      field.classList.add('bg-red-50');
    }
    function clearFieldError(field) {
      field.classList.remove('border-red-500');
      field.classList.remove('bg-red-50');
    }
    requiredFields.forEach(field => {
      field.addEventListener('blur', function () {
        if (!field.value.trim() && field.type !== 'checkbox') {
          showFieldError(field);
        } else if (field.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(field.value.trim())) {
            showFieldError(field);
          }
        }
      });
      field.addEventListener('input', function () {
        if (field.value.trim() || field.type === 'checkbox') {
          clearFieldError(field);
        }
      });
    });

    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();
      if (formSuccessMessage) formSuccessMessage.classList.add('hidden');
      if (formErrorMessage) formErrorMessage.classList.add('hidden');

      let hasErrors = false;
      requiredFields.forEach(field => {
        if (field.type === 'checkbox') {
          if (!field.checked) { showFieldError(field); hasErrors = true; }
        } else if (!field.value.trim()) {
          showFieldError(field); hasErrors = true;
        }
      });

      const emailField = contactForm.querySelector('input[type="email"]');
      if (emailField && emailField.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value.trim())) {
          showFieldError(emailField);
          hasErrors = true;
        }
      }

      if (hasErrors) {
        if (formErrorMessage) formErrorMessage.classList.remove('hidden');
        return;
      }

      // Simulación de envío; integrar fetch() a backend si aplica
      if (formSuccessMessage) formSuccessMessage.classList.remove('hidden');
      contactForm.reset();
      if (formSuccessMessage) setTimeout(() => formSuccessMessage.classList.add('hidden'), 5000);
    });
  }

  // --- Hero slider ---
  (function initHeroSlider() {
    const slider = document.getElementById('hero-slider');
    if (!slider) return;
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('.hero-dot'));
    const prevBtn = document.getElementById('hero-prev');
    const nextBtn = document.getElementById('hero-next');
    let current = 0;
    let timerId = null;

    function goTo(index) {
      const total = slides.length;
      const nextIndex = (index + total) % total;
      slides.forEach((s, i) => {
        s.style.opacity = i === nextIndex ? '1' : '0';
      });
      dots.forEach((d, i) => {
        d.classList.toggle('bg-white/70', i === nextIndex);
        d.classList.toggle('bg-white/40', i !== nextIndex);
      });
      current = nextIndex;
    }

    function showNext() { goTo(current + 1); }
    function showPrev() { goTo(current - 1); }

    function start() {
      stop();
      timerId = setInterval(showNext, 3000);
    }
    function stop() {
      if (timerId) clearInterval(timerId);
      timerId = null;
    }

    // Events
    if (nextBtn) nextBtn.addEventListener('click', () => { showNext(); start(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { showPrev(); start(); });
    dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); start(); }));
    const heroSection = document.getElementById('inicio');
    if (heroSection) {
      heroSection.addEventListener('mouseenter', stop);
      heroSection.addEventListener('mouseleave', start);
    }

    // Init
    goTo(0);
    start();
  })();

  // --- Mapa de proyectos (Leaflet) ---
  (function initProjectsMap() {
    const mapEl = document.getElementById('mapa-proyectos');
    if (!mapEl || !window.L) return;

    // Limpiar el contenido del mapa si existe algo previamente
    mapEl.innerHTML = '';
    mapEl._leaflet_id = null;

    // Ubicaciones de los proyectos del Grupo KABSA en Perú SOLAMENTE
    const locations = [
      { name: 'Proyecto Vial Tramo 1', location: 'Cajamarca', coords: [-7.1617, -78.5128], project: 'Construcción de carretera asfaltada - KATSUMOTO' },
      { name: 'Edificio Multiusos', location: 'Cusco', coords: [-13.5319, -71.9675], project: 'Edificación moderna - ARGOS CORPORATION' },
      { name: 'Puente Libertad', location: 'La Libertad', coords: [-8.1116, -79.0288], project: 'Puente de 180m de luz - BRONTES CONSTRUCTORA' },
      { name: 'Sistema de Agua Potable', location: 'Amazonas', coords: [-6.2308, -77.8691], project: 'Red de agua y saneamiento - KATSUMOTO' },
      { name: 'Pavimentación Urbana', location: 'Piura', coords: [-5.1945, -80.6328], project: 'Pavimentación de avenidas - ARGOS CORPORATION' },
      { name: 'Centro Educativo', location: 'Loreto', coords: [-3.7437, -73.2516], project: 'Institución educativa - BRONTES CONSTRUCTORA' },
      { name: 'Sede Principal', location: 'Lima', coords: [-12.0464, -77.0428], project: 'Oficinas corporativas KABSA GROUP' },
    ];

    // Inicializar mapa centrado en Perú
    const map = L.map('mapa-proyectos', { 
      zoomControl: true, 
      scrollWheelZoom: false,
      center: [-9.19, -75.0152],
      zoom: 5
    });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Crear ÚNICAMENTE los marcadores de la lista de ubicaciones
    const markers = [];
    locations.forEach(loc => {
      const popupContent = `<div style="min-width: 200px;">
        <strong style="font-size: 14px; color: #040872;">${loc.name}</strong><br/>
        <span style="font-size: 12px; color: #666;">📍 ${loc.location}</span><br/>
        <span style="font-size: 11px; color: #888;">${loc.project}</span>
      </div>`;
      const marker = L.marker(loc.coords).bindPopup(popupContent);
      marker.location = loc.location;
      marker.addTo(map);
      markers.push(marker);
    });

    // Ajustar el mapa para mostrar todos los proyectos de Perú
    const allBounds = L.latLngBounds(locations.map(l => l.coords));
    if (allBounds.isValid()) {
      map.fitBounds(allBounds.pad(0.15));
    }

    // Filtro por ubicación (departamento)
    const select = document.getElementById('country-select');
    if (select) {
      select.addEventListener('change', () => {
        const value = select.value;
        let visibleCoords = [];
        markers.forEach(m => {
          const shouldShow = value === 'ALL' || m.location === value;
          if (shouldShow) {
            if (!map.hasLayer(m)) {
              m.addTo(map);
            }
            visibleCoords.push(m.getLatLng());
          } else {
            if (map.hasLayer(m)) {
              map.removeLayer(m);
            }
          }
        });
        if (visibleCoords.length > 0) {
          const bounds = L.latLngBounds(visibleCoords);
          map.fitBounds(bounds.pad(0.2));
        }
      });
    }
  })();
  }
});


