import posthog from 'posthog-js';

// PostHog product analytics. The phc_ key is a public client key committed in
// .env.production so Vercel builds need no extra secret. Events go through the
// /ingest rewrite in vercel.json so ad blockers don't drop them.
//
// The registration form collects children's and parents' personal details, so
// replays mask every input and every text node, events never carry form
// values, and the /data page (which lists registrations) is neither recorded
// nor autocaptured.

const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
const enabled = !!KEY && ((!import.meta.env.DEV && !isLocal) || import.meta.env.VITE_POSTHOG_DEV === '1');

type Events = {
  registration_form_viewed: Record<string, never>;
  registration_submitted: { class_applied: string; has_email: boolean; success: boolean };
  contact_clicked: { channel: 'whatsapp' | 'phone'; placement: string };
  social_link_clicked: { network: string; placement: string };
};

export function initAnalytics() {
  if (!enabled) return;
  const onDataPage = window.location.pathname.startsWith('/data');
  posthog.init(KEY!, {
    api_host: '/ingest',
    ui_host: 'https://us.posthog.com',
    defaults: '2026-08-30',
    capture_pageview: 'history_change',
    capture_pageleave: true,
    autocapture: !onDataPage,
    enable_heatmaps: true,
    capture_dead_clicks: true,
    capture_exceptions: true,
    capture_performance: { web_vitals: true },
    disable_session_recording: onDataPage,
    session_recording: { maskAllInputs: true, maskTextSelector: '*' },
  });
  posthog.register({ app: 'sva-public-school' });
  document.addEventListener('click', onClick, { capture: true });
}

export function track<E extends keyof Events>(event: E, props?: Events[E], leavingPage = false) {
  // Link clicks may navigate away, so those go out with sendBeacon.
  if (enabled) posthog.capture(event, props, leavingPage ? { transport: 'sendBeacon' } : undefined);
}

function placementOf(el: Element) {
  if (el.closest('header')) return 'header';
  if (el.closest('footer')) return 'footer';
  if (el.closest('#contact')) return 'contact';
  return 'page';
}

function onClick(event: MouseEvent) {
  const link = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
  if (!link) return;
  const href = link.getAttribute('href') || '';
  const placement = placementOf(link);
  // Only the channel, never the number dialled.
  if (href.startsWith('tel:')) return track('contact_clicked', { channel: 'phone', placement }, true);
  if (/^https?:\/\/(api\.)?wa\.me\//.test(href)) return track('contact_clicked', { channel: 'whatsapp', placement }, true);
  const social = href.match(/instagram|facebook|twitter|x\.com|youtube/);
  if (social) track('social_link_clicked', { network: social[0], placement }, true);
}
