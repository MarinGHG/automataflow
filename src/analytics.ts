import { OpenPanel } from '@openpanel/web';

// OpenPanel web analytics for automataflow.marinbenke.dev.
// Only the public clientId belongs in client code. The API secret is
// server-side only and must never be bundled into the browser.
export const op = new OpenPanel({
  clientId: '21c8000e-b71c-4fc0-a880-8decdcd2026d',
  trackScreenViews: true,
  trackOutgoingLinks: true,
  trackAttributes: true,
});

// Thin wrapper for custom events, e.g. track('simulation_run', { type: 'dfa' }).
export function track(name: string, properties?: Record<string, unknown>) {
  op.track(name, properties);
}
