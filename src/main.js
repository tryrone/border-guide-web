import './style.css';
import { createIcons, ArrowRight, ArrowUpRight, BookOpen, BriefcaseBusiness, Building2, Check, ChevronRight, Circle, CircleCheck, CircleX, FileCheck2, GraduationCap, ListChecks, Map, Menu, MoreHorizontal, MoveDown, PlaneTakeoff, Route, Search, SlidersHorizontal, Sparkles, Stamp } from 'lucide';

const WAITLIST_API_URL = import.meta.env.VITE_WAITLIST_API_URL || '/api/waitlist';

createIcons({ icons: { ArrowRight, ArrowUpRight, BookOpen, BriefcaseBusiness, Building2, Check, ChevronRight, Circle, CircleCheck, CircleX, FileCheck2, GraduationCap, ListChecks, Map, Menu, MoreHorizontal, MoveDown, PlaneTakeoff, Route, Search, SlidersHorizontal, Sparkles, Stamp } });

function initNavigation() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  if (navbar) window.addEventListener('scroll', () => navbar.classList.toggle('is-scrolled', window.scrollY > 16), { passive: true });
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach((element) => element.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -36px' });
  elements.forEach((element) => observer.observe(element));
}

function initWaitlist() {
  const form = document.getElementById('newsletterForm');
  const message = document.getElementById('waitlistMessage');
  if (!form || !message) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const input = form.querySelector('#waitlistEmail');
    const button = form.querySelector('button');
    const email = input.value.trim();
    if (!email || !button) return;
    const original = button.innerHTML;
    button.disabled = true;
    button.textContent = 'Joining…';
    message.textContent = '';
    message.className = 'newsletter__message';
    try {
      const response = await fetch(WAITLIST_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, source: 'landing_page' }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.message || 'Could not join the waitlist. Please try again.');
      message.textContent = payload?.alreadyJoined ? 'You are already on the waitlist.' : 'You are on the list. We will be in touch soon.';
      message.classList.add('newsletter__message--success');
      input.value = '';
    } catch (error) {
      message.textContent = error?.message || 'Something went wrong. Please try again.';
      message.classList.add('newsletter__message--error');
    } finally {
      button.disabled = false;
      button.innerHTML = original;
      createIcons({ icons: { ArrowRight } });
    }
  });
}

function initDeleteAccount() {
  const instantButton = document.getElementById('tabInstantBtn');
  const requestButton = document.getElementById('tabRequestBtn');
  const instantTab = document.getElementById('tabInstant');
  const requestTab = document.getElementById('tabRequest');
  if (!instantButton || !requestButton || !instantTab || !requestTab) return;
  const switchTab = (showInstant) => {
    instantButton.classList.toggle('active', showInstant);
    requestButton.classList.toggle('active', !showInstant);
    instantButton.setAttribute('aria-selected', String(showInstant));
    requestButton.setAttribute('aria-selected', String(!showInstant));
    instantTab.classList.toggle('active', showInstant);
    requestTab.classList.toggle('active', !showInstant);
  };
  instantButton.addEventListener('click', () => switchTab(true));
  requestButton.addEventListener('click', () => switchTab(false));

  const instantForm = document.getElementById('instantDeleteForm');
  const requestForm = document.getElementById('requestDeleteForm');
  const successScreen = document.getElementById('successScreen');
  const successMessage = document.getElementById('successMessageText');
  const referenceBadge = document.getElementById('successRefBadge');

  instantForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('instantEmail').value.trim();
    const password = document.getElementById('instantPassword').value;
    const confirmed = document.getElementById('instantConfirmCheck').checked;
    const submit = document.getElementById('instantSubmitBtn');
    const error = document.getElementById('instantAlertError');
    error.style.display = 'none';
    if (!confirmed) {
      error.textContent = 'Please confirm that you understand account deletion is permanent.';
      error.style.display = 'block';
      return;
    }
    submit.disabled = true;
    submit.textContent = 'Processing deletion…';
    try {
      const response = await fetch('/api/account/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to delete account. Please check your credentials.');
      document.querySelector('.tab-nav').style.display = 'none';
      instantTab.style.display = 'none';
      requestTab.style.display = 'none';
      successMessage.textContent = data.message || 'Your account and personal data have been deleted.';
      successScreen.style.display = 'block';
    } catch (err) {
      error.textContent = err.message;
      error.style.display = 'block';
      submit.disabled = false;
      submit.textContent = 'Delete my account now';
    }
  });

  requestForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('requestEmail').value.trim();
    const reason = document.getElementById('requestReason').value;
    const notes = document.getElementById('requestNotes').value.trim();
    const submit = document.getElementById('requestSubmitBtn');
    const error = document.getElementById('requestAlertError');
    error.style.display = 'none';
    submit.disabled = true;
    submit.textContent = 'Submitting request…';
    try {
      const response = await fetch('/api/account/request-deletion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, reason, notes }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to submit deletion request.');
      document.querySelector('.tab-nav').style.display = 'none';
      instantTab.style.display = 'none';
      requestTab.style.display = 'none';
      successMessage.textContent = data.message || 'Account deletion request received.';
      if (data.referenceId) {
        referenceBadge.textContent = `Reference code: ${data.referenceId}`;
        referenceBadge.style.display = 'inline-block';
      }
      successScreen.style.display = 'block';
    } catch (err) {
      error.textContent = err.message;
      error.style.display = 'block';
      submit.disabled = false;
      submit.textContent = 'Submit account deletion request';
    }
  });
}

function initApp() {
  initNavigation();
  initReveal();
  initWaitlist();
  initDeleteAccount();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp);
else initApp();
