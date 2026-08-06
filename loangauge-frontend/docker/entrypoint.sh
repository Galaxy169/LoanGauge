#!/bin/sh
# Regenerates env-config.js from real container environment variables every
# time the container starts. Dropped into /docker-entrypoint.d/ — the
# official nginx image automatically runs every executable script in that
# directory before starting nginx itself, so no custom ENTRYPOINT/CMD
# override is needed (see https://github.com/nginxinc/docker-nginx).
#
# This is what lets one built image get deployed to dev/staging/prod with
# different backend URLs just by changing the ECS task definition's
# environment variables — no rebuild required.
set -eu

CONFIG_PATH="/usr/share/nginx/html/env-config.js"

cat <<EOF > "$CONFIG_PATH"
window.__APP_CONFIG__ = {
  API_BASE_URL: "${API_BASE_URL:-}",
  RAZORPAY_KEY_ID: "${RAZORPAY_KEY_ID:-}"
};
EOF

echo "[entrypoint] wrote runtime config to $CONFIG_PATH (API_BASE_URL=${API_BASE_URL:-<unset>})"
