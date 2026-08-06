// Checked-in fallback for local (non-Docker) dev and builds — deliberately
// empty so runtimeConfig.js falls through to Vite's build-time VITE_* env
// vars instead. Inside the container, docker/entrypoint.sh OVERWRITES this
// exact file at startup with real values pulled from the container's
// environment variables (set via the ECS task definition), so the same
// built image can be deployed to any environment without a rebuild.
//
// Do not hand-edit this file for a real deployment — set environment
// variables on the container/task instead.
window.__APP_CONFIG__ = {
  API_BASE_URL: '',
  RAZORPAY_KEY_ID: '',
};
