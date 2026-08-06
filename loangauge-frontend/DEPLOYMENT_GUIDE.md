# LoanGauge — Dockerization & AWS Deployment Guide

Production-grade target: ECS Fargate per service, RDS for MySQL, a managed Mongo, an Application Load Balancer, Secrets Manager, and CI/CD via GitHub Actions. This document covers what changed in the code (already done, see the checklist at the bottom) and the AWS-side steps to actually stand the system up.

---

## 1. Architecture

```
                         Route 53
                    ┌────────┴────────┐
              app.loangauge.com   api.loangauge.com
                    │                  │
                    └──────┬───────────┘
                            │
                    Application Load Balancer (HTTPS via ACM cert)
                    ┌───────┴────────┐
              host-based routing rules
                    │                │
         target group: frontend   target group: gateway
                    │                │
              ┌─────┴─────┐    ┌─────┴──────┐
              │  ECS       │    │  ECS       │
              │  frontend  │    │  gateway   │
              │  (Fargate) │    │  (Fargate) │
              └────────────┘    └─────┬──────┘
                                        │ service discovery: Eureka
                          ┌─────────────┼─────────────┐
                          │             │             │
                    ┌─────┴─────┐ ┌─────┴──────┐┌─────┴──────────┐
                    │auth-service│ │financial-  ││notification-   │
                    │  (Fargate) │ │service     ││service (Fargate)│
                    └─────┬─────┘ │(Fargate)   │└──────┬──────────┘
                          │       └──┬───┬─────┘       │
                          │          │   │             │
                    ┌─────┴──────────┴┐  │       ┌─────┴──────┐
                    │   RDS MySQL      │  │       │  DocumentDB │
                    │  (auth + fin.)   │  │       │ (fin. + notif.)│
                    └──────────────────┘  │       └─────────────┘
                                            │
                                      Amazon MQ (RabbitMQ)
                                (financial-service publishes,
                                 notification-service consumes)

                    eureka-server also runs as its own ECS service,
                    registered in Cloud Map / an internal ALB / just
                    reachable by container-name DNS within the same
                    ECS cluster's private namespace (see §5).
```

Six ECS services total: `frontend`, `gateway`, `auth-service`, `financial-service`, `notification-service`, `eureka-server`. Only `frontend` and `gateway` are internet-facing (behind the ALB); the other four sit in private subnets, reachable only from inside the VPC.

### AWS services used and why

| Service | Purpose |
|---|---|
| **ECR** | Docker image registry — one repository per service (6 total) |
| **ECS on Fargate** | Runs the containers — no EC2 instances to patch/manage |
| **Application Load Balancer** | Public entry point, TLS termination, host-based routing to `frontend` vs `gateway` target groups |
| **RDS for MySQL** | Replaces the local MySQL container for `auth-service` and `financial-service` |
| **Amazon DocumentDB** (or MongoDB Atlas) | Replaces the local MongoDB container for `financial-service` and `notification-service` |
| **Amazon MQ for RabbitMQ** | Replaces the local RabbitMQ container |
| **Secrets Manager** | DB passwords, JWT secret, mail credentials, Gemini/Razorpay keys, `INTERNAL_API_SECRET` — injected into ECS tasks as environment variables, never baked into images |
| **VPC** (private + public subnets, NAT gateway) | Network isolation — only the ALB and `frontend`/`gateway` are in public-facing subnets |
| **Route 53 + ACM** | DNS + free TLS certificates for `app.loangauge.com` / `api.loangauge.com` |
| **CloudWatch Logs** | Container stdout/stderr — ECS Fargate ships logs here automatically via the `awslogs` driver |
| **GitHub Actions (OIDC)** | CI/CD — builds images, pushes to ECR, forces new ECS deployments. No long-lived AWS keys stored in GitHub. |

---

## 2. Prerequisites

- AWS account with sufficient permissions (or ask whoever owns the account to run the IAM/VPC steps).
- AWS CLI v2 installed and configured locally for the initial manual setup.
- Docker installed locally to test builds before pushing.
- A registered domain (for Route 53 + ACM) — or use the ALB's own DNS name to start and add a real domain later; everything below still works, just with an uglier URL.

---

## 3. Local testing first — don't debug in AWS

Before touching AWS, prove the whole system works containerized:

```bash
cp .env.compose.example .env.compose   # fill in real values
docker compose --env-file .env.compose up --build
```

This brings up all nine containers (mysql, mongo, rabbitmq, eureka-server, gateway, auth-service, financial-service, notification-service, frontend) on one Docker network. Visit `http://localhost:3000` for the app, `http://localhost:8761` for the Eureka dashboard (confirm all four services register), `http://localhost:8080/swagger-ui.html`-style URLs per service through the gateway for API sanity checks, `http://localhost:15672` for the RabbitMQ management UI.

If something breaks here, it'll break in ECS too, and it's far faster to debug locally than through CloudWatch logs and ECS deployment cycles.

---

## 4. Build and push images to ECR

```bash
aws ecr create-repository --repository-name loangauge-frontend
aws ecr create-repository --repository-name loangauge-gateway
aws ecr create-repository --repository-name loangauge-eureka-server
aws ecr create-repository --repository-name loangauge-auth-service
aws ecr create-repository --repository-name loangauge-financial-service
aws ecr create-repository --repository-name loangauge-notification-service

aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com

# Frontend
docker build -t <account-id>.dkr.ecr.<region>.amazonaws.com/loangauge-frontend:latest .
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/loangauge-frontend:latest

# Each backend service (repeat for auth-service, financial-service,
# notification-service, gateway, eureka-server)
cd loangauge-backend/gateway
docker build -t <account-id>.dkr.ecr.<region>.amazonaws.com/loangauge-gateway:latest .
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/loangauge-gateway:latest
```

The GitHub Actions workflows (`.github/workflows/deploy-frontend.yml`, `deploy-backend.yml`) automate this on every push to `main` once the OIDC role is set up (§8) — the manual steps above are just for the first deploy.

---

## 5. Networking, Eureka, and service discovery

Create a VPC with 2 public subnets (for the ALB) and 2 private subnets (for everything else), a NAT gateway so private-subnet tasks can still reach the internet (Gemini API, Razorpay API, Brevo SMTP), and an ECS cluster.

**On Eureka**: rather than replacing Eureka with AWS Cloud Map right away (a bigger, separate migration that would mean changing how `gateway`'s `lb://SERVICE-NAME` routes resolve), the pragmatic first step is a lift-and-shift — `eureka-server` runs as its own ECS Fargate service inside the private subnets, and every other service's `EUREKA_URI` environment variable points at it via **ECS Service Connect** or a **Cloud Map private DNS namespace** (e.g. `eureka-server.loangauge.internal:8761`), which gives you a stable internal hostname without hardcoding task IPs. This keeps all the Spring Cloud Netflix Eureka code working completely unchanged. Migrating off Eureka to native Cloud Map discovery is a reasonable follow-up once the basic deployment is stable, not a blocker for this one.

**Cold-start ordering matters once, not on every deploy**: the very first time you bring the system up, start `eureka-server` first, wait for it to be healthy, then `gateway`, then the three services. After that, routine redeployments (rolling updates against an already-running system) don't need this care — the old tasks keep serving traffic until the new ones are healthy.

---

## 6. Databases

### RDS MySQL
Single RDS MySQL 8 instance (or Aurora MySQL if you want more headroom later), in the private subnets, security group only allowing inbound 3306 from `auth-service` and `financial-service`'s security groups. Both services share one `loangauge` database (matches local dev), just with different tables (auth-service manages users, financial-service manages assessments/profiles). Set `DB_HOST` on both services' task definitions to the RDS endpoint.

### DocumentDB (or MongoDB Atlas)
`financial-service` and `notification-service` both talk to Mongo (assessments/reports, AI recommendations, notifications). Amazon DocumentDB is the AWS-native choice — same VPC, no external network hop, IAM-integrated. It's MongoDB-*compatible*, not identical, so run the full local `docker compose` test suite against a real DocumentDB cluster (or at least the recommendation/report/notification flows specifically) before fully committing — if anything in the aggregation pipeline usage turns out to be DocumentDB-incompatible, MongoDB Atlas (their own managed service, genuinely 100% real MongoDB) is the fallback with the same `MONGODB_URI` environment variable, just pointed at an `atlas` connection string instead.

### Amazon MQ (RabbitMQ)
Managed RabbitMQ broker, single-instance is fine to start. `financial-service` publishes the `assessment.completed` event that `notification-service` consumes to trigger AI recommendation generation — set `RABBITMQ_HOST`/`RABBITMQ_PORT` on both to the broker's endpoint.

---

## 7. Secrets Manager

Create one secret per sensitive value (or a JSON blob per service, either works with ECS's `secrets` task-definition field):

| Secret | Used by |
|---|---|
| `loangauge/db-username`, `loangauge/db-password` | auth-service, financial-service |
| `loangauge/mongodb-uri` | financial-service, notification-service |
| `loangauge/rabbitmq-username`, `loangauge/rabbitmq-password` | financial-service, notification-service |
| `loangauge/jwt-secret` | auth-service, financial-service |
| `loangauge/internal-api-secret` | auth-service, notification-service |
| `loangauge/mail-username`, `loangauge/mail-password` | auth-service, notification-service |
| `loangauge/gemini-api-key` | notification-service |
| `loangauge/razorpay-key-id`, `loangauge/razorpay-key-secret` | notification-service, and `razorpay-key-id` also on the **frontend** task (as `RAZORPAY_KEY_ID`, injected via `docker/entrypoint.sh` into `env-config.js` — see the code checklist below) |

In each ECS task definition, reference these via the `secrets` array (not `environment`) — ECS injects them at container start without ever putting the actual value in the task definition JSON, CloudWatch Logs, or the image.

---

## 8. ECS task definitions and services

One task definition + one service per container. Key settings that matter beyond the obvious (image URI, CPU/memory, port mappings):

- **Health check**: point ECS's own container health check at the same `/actuator/health` (backend) or `/healthz` (frontend) path baked into each Dockerfile's `HEALTHCHECK` — the ALB target group health check should match.
- **Log configuration**: `awslogs` driver, log group per service (e.g. `/ecs/loangauge/gateway`), makes CloudWatch Logs Insights queries across services straightforward later.
- **Environment variables** (non-secret): `EUREKA_URI`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `RABBITMQ_HOST`, `RABBITMQ_PORT`, `FRONTEND_RESET_PASSWORD_URL` (→ `https://app.loangauge.com/reset-password`), `CORS_ALLOWED_ORIGINS` on gateway (→ `https://app.loangauge.com`), `API_BASE_URL` on frontend (→ `https://api.loangauge.com`).
- **Task role vs execution role**: the execution role needs `secretsmanager:GetSecretValue` + ECR pull permissions; the task role is what your application code would assume if it called other AWS APIs directly (not currently needed here, but keep them separate rather than over-scoping the execution role).
- **Desired count**: 2 per service minimum for anything customer-facing (rolling deploys need at least 2 to stay available during the swap); 1 is fine for `eureka-server` to start, since a brief Eureka blip during its own redeploy doesn't take the whole system down (clients cache registrations).

`gateway` and `frontend` each get an ALB target group; the other four don't need one (they're never reached directly from outside the VPC).

---

## 9. Load balancer, DNS, TLS

1. Request an ACM certificate for `*.loangauge.com` (or the two specific subdomains).
2. Create the ALB in the public subnets, HTTPS listener on 443 using that cert, HTTP-to-HTTPS redirect on 80.
3. Two listener rules based on host header:
   - `app.loangauge.com` → `frontend` target group (port 80, matches the Dockerfile's `EXPOSE 80`)
   - `api.loangauge.com` → `gateway` target group (port 8080)
4. Route 53: `A` records (alias) for both subdomains pointing at the ALB.

This host-based split is why the frontend's runtime `API_BASE_URL` should be `https://api.loangauge.com` rather than a path like `/api` on the same domain — keeps the gateway's own routing (`/auth/**`, `/api/**`, `/notify/**`) untouched instead of needing an extra path-rewrite layer at the ALB.

---

## 10. CI/CD (GitHub Actions + OIDC)

The workflows are already written (`.github/workflows/deploy-frontend.yml`, `deploy-backend.yml`). One-time setup to let GitHub Actions deploy without storing AWS access keys as secrets:

1. Create an IAM OIDC identity provider for `token.actions.githubusercontent.com` (if the account doesn't already have one).
2. Create an IAM role trusting that provider, scoped to this repo (`repo:<org>/<repo>:ref:refs/heads/main`), with permissions for `ecr:*` (push) and `ecs:UpdateService` / `ecs:DescribeServices` (deploy) on the relevant resources.
3. Add the role's ARN as a GitHub Actions repository secret named `AWS_DEPLOY_ROLE_ARN` — that's the only secret the workflows need.

After that, every push to `main` that touches frontend code builds+pushes+redeploys `frontend`; every push touching `loangauge-backend/**` does the same for all five backend services in parallel.

---

## 11. Code changes already made (checklist / reference)

Everything below is done in this repo already — listed here so it's clear what shipped vs. what's still an AWS-console/CLI step above.

### Frontend

- **`src/utils/runtimeConfig.js`** (new) — resolves `API_BASE_URL` / `RAZORPAY_KEY_ID` from `window.__APP_CONFIG__` (runtime) first, falling back to Vite's build-time `VITE_*` vars, so one built image works across environments without a rebuild.
- **`public/env-config.js`** (new) — checked-in empty defaults; overwritten in the container at startup.
- **`index.html`** — loads `/env-config.js` before the app bundle.
- **`src/services/api.js`**, **`src/pages/premium/UpgradePage.jsx`** — now read config via `runtimeConfig.js` instead of `import.meta.env` directly.
- **`Dockerfile`** (new) — multi-stage: Node build → static files served by Nginx.
- **`docker/nginx.conf`** (new) — SPA fallback routing, `/healthz`, gzip, security headers, no-cache on `env-config.js`.
- **`docker/entrypoint.sh`** (new) — regenerates `env-config.js` from real container env vars on every container start (runs automatically via nginx's `/docker-entrypoint.d/` convention).
- **`.dockerignore`** (new).

### Backend (`loangauge-backend/`)

- **All 5 services' `pom.xml`** — added `spring-boot-starter-actuator` (health endpoint for container/ALB health checks).
- **All 5 services' `application.yml`** — added `management.endpoints.web.exposure.include: health`.
- **`auth-service`, `financial-service`, `gateway`, `notification-service` `application.yml`** — `eureka.client.service-url.defaultZone` changed from hardcoded `http://localhost:8761/eureka` to `${EUREKA_URI:http://localhost:8761/eureka}`.
- **`auth-service`, `financial-service` `application.yml`** — `spring.datasource.url` changed from hardcoded `localhost:3306` to `${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:loangauge}`.
- **`financial-service`, `notification-service` `application.yml`** — `spring.rabbitmq.host`/`port` externalized to `${RABBITMQ_HOST:localhost}` / `${RABBITMQ_PORT:5672}`.
- **`auth-service` `application.yml`** — `app.frontend.reset-password-url` externalized to `${FRONTEND_RESET_PASSWORD_URL:...}` (was hardcoded to the Vite dev server URL — would have put `localhost:5173` links in real password-reset emails otherwise).
- **`gateway`'s `CorsConfig.java`** — allowed origins now read from `app.cors.allowed-origins` (env-configurable, comma-separated) instead of a single hardcoded `http://localhost:5173`. This one was going to silently break login from the real deployed frontend if left as-is.
- **`gateway` `application.yml`** — added `app.cors.allowed-origins: ${CORS_ALLOWED_ORIGINS:http://localhost:5173}`.
- **Each of the 5 services** — new `Dockerfile` (multi-stage Maven build with `mvnw` → slim JRE runtime, non-root user, `MaxRAMPercentage` set for container-aware JVM sizing) and `.dockerignore`.
- **`auth-service/.env.example`, `notification-service/.env.example`** — added `INTERNAL_API_SECRET`, which `application.yml` requires (no default) but wasn't documented in either example file.

### Repo root

- **`docker-compose.yml`** (new) — full local stack: all 6 app containers + MySQL + MongoDB + RabbitMQ, for integration testing before touching AWS.
- **`.env.compose.example`** (new) — template for the secrets `docker-compose.yml` needs, kept separate from the frontend's own `.env` (Vite build-time vars) to avoid mixing concerns.
- **`.github/workflows/deploy-frontend.yml`, `deploy-backend.yml`** (new) — OIDC-authenticated CI/CD to ECR + ECS.

---

## 12. A note on the gateway routing config

While reading `gateway/application.yml` for this task, worth flagging: it already has explicit, correctly-ordered routes for `/api/users/**`, `/api/admin/users/**`, `/api/admin/subscriptions/**` (→ auth-service) and `/api/notifications/**`, `/api/payments/**`, `/api/reports/**`, `/api/recommendations/**`, `/notify/**` (→ notification-service), ahead of the generic `/api/**` catch-all to financial-service. That resolves Issues #1 and #2 in `BACKEND_ISSUES_REPORT.md` from earlier this session (those were written against the gateway's *behavior* observed through the running system, not this source file, which apparently wasn't available to inspect directly at the time). Worth closing those two out in the report now that the actual routing config is visible and looks correct.

---

## 13. Cost note

Roughly, for the smallest reasonable production-grade footprint (6 Fargate tasks at minimal CPU/memory, one small RDS instance, one small DocumentDB instance, one small Amazon MQ broker, one ALB, NAT gateway): expect somewhere in the ballpark of $150–300/month depending on region and whether you right-size down further. The NAT gateway and the managed database/broker instances are usually the biggest line items, not the Fargate compute itself. If cost matters more than uptime guarantees for now, single-AZ (not multi-AZ) RDS/DocumentDB/Amazon MQ cuts this significantly and is a reasonable choice for a first production deployment.
