// Centralizes runtime vs build-time configuration for values that need to
// differ per deployment environment (API base URL, Razorpay key, etc).
//
// Why this exists: Vite bakes `import.meta.env.VITE_*` values into the
// bundle at BUILD time. That's fine for `npm run dev` / a single build, but
// it means a Docker image built once would need to be rebuilt for every
// environment (staging vs prod) if those were the only source of config —
// the opposite of "build once, deploy anywhere," which is the point of
// containerizing in the first place.
//
// Runtime values instead come from `window.__APP_CONFIG__`, populated by
// `/env-config.js` — a plain script tag loaded before the app bundle (see
// index.html). In the container, `docker/entrypoint.sh` regenerates that
// file from real environment variables (set via the ECS task definition)
// every time the container starts, so the same image works in any
// environment. Locally (no Docker), `public/env-config.js`'s checked-in
// defaults are empty, so this transparently falls back to the Vite
// `VITE_*` build-time vars from your `.env` file instead.
function readConfig(runtimeKey, viteKey, fallback) {
  const runtimeValue = typeof window !== 'undefined' ? window.__APP_CONFIG__?.[runtimeKey] : undefined;
  if (runtimeValue) return runtimeValue;

  const buildTimeValue = import.meta.env[viteKey];
  if (buildTimeValue) return buildTimeValue;

  return fallback;
}

export const API_BASE_URL = readConfig('API_BASE_URL', 'VITE_API_BASE_URL', 'http://localhost:8080');
export const RAZORPAY_KEY_ID = readConfig('RAZORPAY_KEY_ID', 'VITE_RAZORPAY_KEY_ID', 'rzp_test_placeholder');
