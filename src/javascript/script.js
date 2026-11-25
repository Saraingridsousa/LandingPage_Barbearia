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

// A confirmed international number belongs in #business-contact, never inferred here.
(() => {
  const config = document.querySelector('#business-contact');
  if (!config) return;
  let contact;
  try { contact = JSON.parse(config.textContent); }
  catch { return; }
  if (!contact || typeof contact !== 'object' || Array.isArray(contact)) return;
  const phone = contact.whatsapp;
  if (typeof phone !== 'string' || !/^[1-9]\d{7,14}$/.test(phone)) return;

  const bookingURL = (service) => {
    const message = service
      ? `Olá! Gostaria de saber mais sobre ${service} na JR do Corte.`
      : 'Olá! Gostaria de agendar um horário na JR do Corte.';
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };
  document.querySelectorAll('[data-booking]').forEach((link) => {
    link.href = bookingURL(link.dataset.service);
    // Use the current tab: avoids unannounced new windows for booking controls.
  });
  const floating = document.querySelector('#floating-contact');
  if (floating) {
    floating.dataset.channel = 'whatsapp';
    floating.setAttribute('aria-label', 'Agendar pelo WhatsApp');
    floating.title = 'Agendar pelo WhatsApp';
    floating.querySelector('.floating-contact-label').textContent = 'Agendar pelo WhatsApp';
  }
  const primary = document.querySelector('#contact-primary');
  if (primary) {
    primary.href = bookingURL();
    primary.textContent = 'Agendar pelo WhatsApp ↗';
    primary.removeAttribute('target');
    primary.removeAttribute('rel');
  }
  const status = document.querySelector('#contact-status');
  if (status) status.textContent = 'Consulte a disponibilidade e agende seu horário pelo WhatsApp.';
})();

// Keep the chosen service visible when booking uses the in-page contact fallback.
(() => {
  const selection = document.querySelector('#booking-selection');
  const contact = document.querySelector('#contato');
  if (!selection || !contact) return;

  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[data-booking]');
    if (!link || link.getAttribute('href') !== '#contato') return;
    selection.textContent = link.dataset.service
      ? `Serviço de interesse: ${link.dataset.service}.`
      : '';
    contact.setAttribute('tabindex', '-1');
    contact.focus({ preventScroll: true });
  });
})();

// Explicit fragment scrolling: preserve the URL, keyboard focus, browser history
// and the native no-JavaScript fallback. Booking and menu handlers run first.
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
