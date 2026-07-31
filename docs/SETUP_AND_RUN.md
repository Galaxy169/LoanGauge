# Setup & Run Guide — LoanGauge

For any team member setting this project up on their own machine for the first time. This is
purely procedural — for *why* things are built this way, see `SETUP_GUIDE.md`; for coding
rules, see `CLAUDE.md`.

## Prerequisites

Install these before anything else:
- **Java 21** (Eclipse Temurin recommended) — `java -version` to confirm
- **Apache Maven** (bundled with STS) — `mvn -version` to confirm
- **Node.js 20 LTS + npm** — `node -v` / `npm -v` to confirm
- **Docker Desktop** — `docker -v` to confirm
- **Git**
- **Spring Tool Suite (STS)** — for the 5 backend services
- **VS Code** — for the frontend

## 1. Clone the repo

```bash
git clone <repo-url>
cd loangauge
```

## 2. Start local infrastructure

Create `.env` at the repo root (next to `docker-compose.yml`) — ask a teammate for the
actual values, or use these defaults for local dev:
```
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=loangauge
RABBITMQ_DEFAULT_USER=guest
RABBITMQ_DEFAULT_PASS=guest
```

Start MySQL and RabbitMQ:
```bash
docker compose up -d
docker ps    # confirm loangauge-mysql and loangauge-rabbitmq are both running
```

Check RabbitMQ's dashboard: http://localhost:15672 (login with the values from your `.env`).

## 3. Load the database schema

```bash
docker exec -i loangauge-mysql mysql -uroot -p"$MYSQL_ROOT_PASSWORD" < db/schema.sql
```
(Or just `-proot` if you're using the default password above.)

Verify:
```bash
docker exec -it loangauge-mysql mysql -uroot -proot -e "USE loangauge; SHOW TABLES;"
```
You should see 8 tables.

## 4. Set up MongoDB Atlas (shared cluster — ask your team for the connection string)

If your team already has a shared Atlas cluster, just get the connection string from
whoever set it up — you don't need to create your own. If you're the first on the team doing
this, see `SETUP_GUIDE.md` section 8 for the walkthrough (free M0 cluster, one database user,
network access open, one connection string used by both `financial-service` and
`notification-service`).

## 5. Get the third-party API keys (ask your team, or generate your own for local testing)

- **Brevo** (email): brevo.com → SMTP & API → SMTP tab → get login + SMTP key
- **Gemini API key**: https://aistudio.google.com/app/apikey
- **Razorpay**: dashboard.razorpay.com → Settings → API Keys (use Test Mode keys for
  development, not live keys)

## 6. Open and configure each backend service in STS

For each of `eureka-server`, `gateway`, `auth-service`, `financial-service`,
`notification-service` inside `loangauge-backend/`:

1. File → Import → Existing Maven Projects → point at the service's folder
2. Right-click the project → Maven → Update Project (Force Update)

For `auth-service`, `financial-service`, `notification-service` specifically — create a
`.env` file in each service's root folder (next to its `pom.xml`). Copy the structure from
that service's `.env.example` and fill in real values. **The `JWT_SECRET` value must be
identical across all three services** — pick one value and reuse it in each `.env`.

`eureka-server` and `gateway` need no `.env` — they hold no secrets.

## 7. Run the backend services (in this order)

```
1. eureka-server    → wait until http://localhost:8761 loads
2. auth-service
3. financial-service
4. notification-service
5. gateway
```
In STS: right-click each project → Run As → Spring Boot App, waiting a few seconds between
each so Eureka registration completes before the next one starts. (Startup order between
`financial-service` and `notification-service` no longer strictly matters for the RabbitMQ
queue specifically — both declare it themselves — but starting `eureka-server` first always
matters, since nothing can register before it's up.)

**Verify:** refresh http://localhost:8761 — you should see all 4 services (AUTH-SERVICE,
FINANCIAL-SERVICE, NOTIFICATION-SERVICE, GATEWAY) listed as registered instances.

Check each service's Swagger UI loads:
- http://localhost:8081/swagger-ui.html (auth-service)
- http://localhost:8082/swagger-ui.html (financial-service)
- http://localhost:8083/swagger-ui.html (notification-service)

## 8. Set up and run the frontend

```bash
cd loangauge-frontend
npm install
```

Create `.env` in `loangauge-frontend/`:
```
VITE_API_BASE_URL=http://localhost:8080
```

Run it:
```bash
npm run dev
```

**Verify:** open http://localhost:5173 — you should see the Home page, and every route
(`/login`, `/about-us`, `/profile`, etc.) should resolve to at least a placeholder page.

## 9. You're ready to work

- Read `CLAUDE.md` for the architecture, tech stack, coding rules, and which module you own.
- Read `GIT_GUIDE.md` before making your first commit.
- Create your feature branch off `develop` and start building your module, following the
  Per-Module Build Sequence in `CLAUDE.md` (Database → Entities → Repositories → DTOs →
  Services → Controllers → Swagger → Frontend → Integration → Testing).

## Troubleshooting quick reference

| Symptom | Likely cause / fix |
|---|---|
| A service won't register with Eureka | Check `eureka-server` is running first; check the service's `application.yml` has the right `defaultZone` URL |
| `NOT_FOUND - no queue 'assessment.completed'` | Shouldn't happen anymore (both services self-declare the queue) — if it does, confirm both `RabbitMQConfig` classes declare the queue with identical name/durability |
| 500 error hitting a random path like `/dashboard` | Expected if no controller exists yet for that path — harmless until real endpoints are built (see `GlobalExceptionHandler`'s `NoResourceFoundException` handler) |
| `Invalid hook call` / React errors in the browser console | Likely two copies of React — `rm -rf node_modules package-lock.json && npm install`, then `npm ls react react-dom` to confirm only one version each |
| MySQL connection refused | Confirm `docker ps` shows `loangauge-mysql` running, and your service's `.env` `DB_PASSWORD` matches the root `.env`'s `MYSQL_ROOT_PASSWORD` |
| MongoDB connection timeout | Check Atlas Network Access allows your current IP (or is set to 0.0.0.0/0), and the password in your connection string doesn't have un-encoded special characters |
