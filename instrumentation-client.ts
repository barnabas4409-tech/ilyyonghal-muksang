import posthog from 'posthog-js';
import * as Sentry from '@sentry/nextjs';

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: '/ingest',
  ui_host: 'https://us.posthog.com',
  defaults: '2026-01-30',
  capture_exceptions: true,
  capture_pageview: false,
  capture_pageleave: true,
  persistence: 'localStorage+cookie',
  debug: process.env.NODE_ENV === 'development',
});

Sentry.init({
  dsn: 'https://5c5a55a05efe3ac5c0a7f63219c7a8b0@o4511504406740992.ingest.us.sentry.io/4511504429875200',
  integrations: [Sentry.replayIntegration()],
  tracesSampleRate: 1,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  sendDefaultPii: true,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
