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

// Carrito: guarda los productos en el navegador y arma el pedido por WhatsApp.
(() => {
  const cartEl = document.getElementById('cart');
  const fab = document.querySelector('.cart-fab');
  if (!cartEl || !fab) return;
  const KEY = 'pgs-cart';
  const list = cartEl.querySelector('.cart__list');
  const totalEl = cartEl.querySelector('.cart__total strong');
  const note = cartEl.querySelector('textarea');
  const money = (n) => '$' + n.toLocaleString('es-AR');

  let items = [];
  try { items = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { items = []; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} };

  const render = () => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const total = items.reduce((s, i) => s + i.qty * i.price, 0);
    fab.hidden = count === 0;
    fab.querySelector('.cart-fab__count').textContent = count;
    cartEl.classList.toggle('is-empty', count === 0);
    totalEl.textContent = money(total);
    list.innerHTML = '';
    items.forEach((it, idx) => {
      const li = document.createElement('li');
      li.className = 'cart__item';
      li.dataset.idx = idx;
      li.innerHTML = `
        <div><div class="cart__name"></div><div class="cart__unit">${money(it.price)} c/u</div></div>
        <div class="cart__sub">${money(it.qty * it.price)}</div>
        <div class="cart__qty">
          <button type="button" data-dec aria-label="Restar uno">−</button>
          <output>${it.qty}</output>
          <button type="button" data-inc aria-label="Sumar uno" ${it.max && it.qty >= it.max ? 'disabled' : ''}>+</button>
        </div>
        <button type="button" class="cart__remove" data-del>Quitar</button>`;
      li.querySelector('.cart__name').textContent = it.name;
      list.appendChild(li);
    });
  };

  const setOpen = (open) => {
    cartEl.hidden = !open;
    fab.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('cart-open', open);
    if (open) cartEl.querySelector('.cart__close').focus();
    else if (!fab.hidden) fab.focus();
  };

  const add = (name, price, max) => {
    const found = items.find((i) => i.name === name);
    if (found) { if (!max || found.qty < max) found.qty += 1; }
    else items.push({ name, price, qty: 1, max: max || 0 });
    save(); render();
    fab.classList.remove('bump'); void fab.offsetWidth; fab.classList.add('bump');
    if (typeof gtag === 'function') gtag('event', 'add_to_cart', { item_name: name, value: price, currency: 'ARS' });
  };

  document.querySelectorAll('[data-add]').forEach((btn) => {
    btn.addEventListener('click', () => {
      add(btn.dataset.add, Number(btn.dataset.price), Number(btn.dataset.max) || 0);
      btn.classList.add('is-added');
      if (btn.classList.contains('btn--add')) {
        const label = btn.textContent;
        btn.textContent = '¡Agregado!';
        setTimeout(() => { btn.textContent = label; }, 1400);
      }
      setTimeout(() => btn.classList.remove('is-added'), 600);
    });
  });

  list.addEventListener('click', (e) => {
    const li = e.target.closest('.cart__item');
    if (!li) return;
    const idx = Number(li.dataset.idx);
    const it = items[idx];
    if (e.target.closest('[data-inc]')) { if (!it.max || it.qty < it.max) it.qty += 1; }
    else if (e.target.closest('[data-dec]')) { it.qty -= 1; if (it.qty < 1) items.splice(idx, 1); }
    else if (e.target.closest('[data-del]')) items.splice(idx, 1);
    else return;
    save(); render();
  });

  fab.addEventListener('click', () => setOpen(true));
  cartEl.addEventListener('click', (e) => { if (e.target.closest('[data-cart-close]')) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !cartEl.hidden) setOpen(false); });

  cartEl.querySelector('.cart__clear').addEventListener('click', () => {
    if (confirm('¿Vaciar el carrito?')) { items = []; save(); render(); }
  });

  cartEl.querySelectorAll('[data-send]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!items.length) return;
      const lines = items.map((i) => `• ${i.qty} x ${i.name} — ${money(i.qty * i.price)}`);
      const total = items.reduce((s, i) => s + i.qty * i.price, 0);
      let msg = `¡Hola Punto Golf Store! Quiero hacer este pedido, ¿me confirman stock?\n\n${lines.join('\n')}\n\nTotal estimado: ${money(total)}`;
      if (note.value.trim()) msg += `\n\nAclaraciones: ${note.value.trim()}`;
      if (typeof gtag === 'function') gtag('event', 'whatsapp_click', { whatsapp_number: btn.dataset.send, link_location: 'carrito', value: total, currency: 'ARS' });
      window.open(`https://wa.me/${btn.dataset.send}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    });
  });

  render();
})();
