// Compartir: usa el menú nativo del celular; si no existe, copia el link.
const shareBtn = document.getElementById('share');
if (shareBtn) {
  shareBtn.addEventListener('click', async () => {
    const data = {
      title: 'Punto Golf Store',
      text: 'Pelotas de golf nuevas y usadas y accesorios, con entrega en Pacheco',
      url: location.href
    };
    const label = shareBtn.querySelector('.social__v');
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(data.url);
        label.textContent = '¡Link copiado!';
      }
    } catch (e) { /* el usuario canceló */ }
  });
}

// GA4: cuenta cada clic a WhatsApp (marcarlo como evento clave en GA4).
document.querySelectorAll('a[href*="wa.me"]').forEach((link) => {
  link.addEventListener('click', () => {
    if (typeof gtag === 'function') {
      gtag('event', 'whatsapp_click', {
        whatsapp_number: (link.href.match(/wa\.me\/(\d+)/) || [])[1],
        link_location: link.closest('section, header, footer, .sticky-cta')?.id || link.closest('header, footer, .sticky-cta')?.className || 'otro'
      });
    }
  });
});

// Menú mobile: abre el panel lateral y lo cierra al elegir una sección.
const burger = document.querySelector('.burger');
const menu = document.getElementById('menu');
if (burger && menu) {
  const setMenu = (open) => {
    menu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    if (open) menu.querySelector('.menu__panel > a').focus();
    else burger.focus();
  };
  burger.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', (e) => {
    if (e.target.closest('[data-close], .menu__panel > a')) setMenu(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) setMenu(false);
  });
}
