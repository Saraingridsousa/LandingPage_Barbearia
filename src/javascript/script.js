'use strict';

(() => {
  const nav = document.querySelector('#navbar');
  const button = document.querySelector('#btn_mobile');
  const links = document.querySelector('#nav_list');
  if (!nav || !button || !links) return;

  const desktop = window.matchMedia('(min-width: 1024px)');
  const setOpen = (open) => {
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    links.hidden = !desktop.matches && !open;
  };
  const resetMenu = () => {
    const focusWasInMenu = links.contains(document.activeElement);
    button.hidden = desktop.matches;
    setOpen(false);
    if (!desktop.matches && focusWasInMenu) button.focus();
    if (desktop.matches && document.activeElement === button) links.querySelector('a').focus();
  };
  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  links.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;
    setOpen(false);
    if (link.hash) {
      const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      button.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target)) setOpen(false);
  });
  nav.addEventListener('focusout', (event) => {
    if (!nav.contains(event.relatedTarget)) setOpen(false);
  });
  desktop.addEventListener('change', resetMenu);
  resetMenu();
  links.dataset.ready = 'true';
})();

// Explicit fragment scrolling: preserve the URL, keyboard focus, browser history
// and the native no-JavaScript fallback. Menu handlers run first; external contact links are untouched.
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey ||
        event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.('a[href^="#"]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const hash = link.hash;
    if (!hash || hash === '#') return;
    let id;
    try { id = decodeURIComponent(hash.slice(1)); }
    catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    // On restrictive origins, let the original anchor perform navigation.
    try {
      if (location.hash !== hash) history.pushState(history.state, '', hash);
    } catch { return; }
    event.preventDefault();
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    // Explicit behavior avoids reliance on CSS alone in embedded/mobile browsers.
    target.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
  });
})();

// Keep the biography current without displaying a stale age if JS is disabled.
(() => {
  const ageText = document.getElementById('barber-age');
  if (!ageText) return;
  const birthYear = 2007;
  const birthMonth = 10;
  const birthDay = 26;
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const birthdayPending = month < birthMonth || (month === birthMonth && day < birthDay);
  const age = today.getFullYear() - birthYear - Number(birthdayPending);
  if (Number.isInteger(age) && age >= 0) ageText.textContent = `, tenho ${age} anos`;
})();
