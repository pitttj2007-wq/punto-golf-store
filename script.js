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
