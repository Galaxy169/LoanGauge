# LoanGauge — Backend Integration Issues Report

**To:** Antigravity (Backend)
**From:** Frontend Engineering (loangauge-frontend)
**Date:** 2026-08-05
**Context:** Found while integration-testing the frontend against `http://localhost:8080` (API Gateway) using the credentials/environment described in `loangauge_api_docs.md`.

---

## Summary

All frontend request/response handling was audited against `loangauge_api_docs.md` field-by-field and confirmed correct — these are backend/gateway issues, not frontend bugs, except where explicitly noted as already fixed on our side.

| # | Issue | Severity | Owner |
|---|-------|----------|-------|
| 1 | ~~API Gateway does not route `/api/users/**`, `/api/admin/users/**`, `/api/admin/subscriptions/**` to auth-service~~ — **RESOLVED**, see note below | **Critical** | Gateway |
| 2 | ~~Notification service routing is ambiguous/undocumented (`/notify/**` vs `/api/**`)~~ — **RESOLVED**, see note below | Medium | Gateway |
| 3 | `POST /api/consultations` returns `500 Internal Server Error` — **confirmed backend-only**, reproduced with a well-formed request bypassing the frontend entirely | **High** | financial-service |
| 4 | `/auth/refresh-token` must issue claims from *current* DB state, not stale token data — please confirm | **High** | auth-service |
| 5 | Consultation `status` actually persists as `COMPLETED`, not the documented `RESPONDED` | Medium | financial-service / docs |
| 6 | `POST /api/reports/{assessmentId}/email` returns a bare string body instead of the documented `{success, message, data}` envelope | Medium | whichever service owns this route |
| 7 | `ProfileRequestDto.cibilScore` is `@NotNull`, but `scoreCreditProfile()` explicitly handles a `null` score as "unpopulated" — the DTO currently makes that code path unreachable | **High** | financial-service |

---

## Issue 1 — API Gateway misroutes auth-service endpoints (404)

### Symptom

Through the gateway, these all return `404 Not Found`:

```
GET http://localhost:8080/api/users/profile
GET http://localhost:8080/api/admin/users
GET http://localhost:8080/api/admin/subscriptions
```

### Proof it's the gateway, not the service

Calling auth-service directly on its own port works correctly:

```bash
curl -X GET 'http://192.168.0.116:8081/api/admin/users' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer <valid-admin-token>'
```

```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [ { "id": 1, "firstName": "Test", ... }, ... ],
  "timestamp": "2026-08-05T17:54:35.6263234"
}
```

Same token, same path, direct-to-service (8081) → 200 with data. Through the gateway (8080) → 404. The service and data are fine; the gateway isn't forwarding the request.

### Root cause

`loangauge_api_docs.md`'s own architecture table contradicts its endpoint reference:

```
| Service                  | Direct Port | Gateway Prefix |
| ------------------------ | ----------- | -------------- |
| Auth Service              | 8081        | /auth/**       |
| Financial Service         | 8082        | /api/**        |
```

But section 2 ("User Profile") and section 12 ("Admin") both document `/api/users/**` and `/api/admin/**` as **Auth Service** endpoints — paths that, per the table, belong to Financial Service's `/api/**` prefix. The gateway's route rules almost certainly send the generic `/api/**` predicate straight to financial-service, which has no handler for `/users/profile` or `/admin/users`, hence `404`. (`/api/admin/dashboard` and `/api/admin/loan-types`, which genuinely are financial-service endpoints, are presumably unaffected — not confirmed in this pass, worth a quick check.)

### Required fix

Add route predicates for the auth-service-owned sub-paths, evaluated **before** the generic financial-service catch-all (Spring Cloud Gateway example):

```yaml
spring:
  cloud:
    gateway:
      routes:
        # --- Auth service: specific paths, must win over the /api/** catch-all below ---
        - id: auth-users
          uri: lb://AUTH-SERVICE
          predicates:
            - Path=/api/users/**

        - id: auth-admin-users
          uri: lb://AUTH-SERVICE
          predicates:
            - Path=/api/admin/users/**

        - id: auth-admin-subscriptions
          uri: lb://AUTH-SERVICE
          predicates:
            - Path=/api/admin/subscriptions/**

        - id: auth-core
          uri: lb://AUTH-SERVICE
          predicates:
            - Path=/auth/**

        # --- Financial service: everything else under /api/** ---
        - id: financial-service
          uri: lb://FINANCIAL-SERVICE
          predicates:
            - Path=/api/**
```

Route order/specificity matters here — if the generic `/api/**` → financial-service rule matches first, it swallows these requests before the more specific rules are ever evaluated.

### Verification

Once fixed, these three should return `200` with `success: true` through the gateway (8080), not just via direct-to-service calls:

- `GET /api/users/profile`
- `GET /api/admin/users`
- `GET /api/admin/subscriptions`

### RESOLVED

Confirmed by reading `gateway/application.yml` directly (while working on containerizing the backend for deployment) — the gateway already has explicit, correctly-ordered routes for `/api/users/**`, `/api/admin/users/**`, and `/api/admin/subscriptions/**` to `AUTH-SERVICE`, all placed ahead of the generic `/api/**` → `FINANCIAL-SERVICE` catch-all. Whatever produced the original 404s has since been fixed on the gateway config side. No frontend action needed.

---

## Issue 2 — Notification service routing is ambiguous

`loangauge_api_docs.md` §10 states, verbatim:

> **Note:** The notification service is internally proxied. The gateway maps `/notify/**` to the notification service but current routing uses `/api/**`. Check with your team on the exact public path.

This is the same class of bug as Issue 1 — a documented but unresolved ambiguity about whether notification-service (8083) is reachable via `/notify/**` or `/api/**`. Frontend currently calls `GET /api/notifications/{userId}` and `PUT /api/notifications/{id}/read` per the doc's explicit endpoint listing, and these haven't thrown errors in current testing — but the routing intent should be confirmed and locked down explicitly (add an unambiguous route for `/api/notifications/**` → notification-service, same priority reasoning as Issue 1), and the docs updated to remove the "check with your team" caveat.

### RESOLVED

Same finding as Issue 1 — `gateway/application.yml` has explicit routes for `/api/notifications/**`, `/api/payments/**`, `/api/reports/**`, `/api/recommendations/**`, and `/notify/**`, all mapped to `NOTIFICATION-SERVICE` and ordered ahead of the `/api/**` catch-all. Just the docs (`loangauge_api_docs.md` §10) still need that "check with your team" caveat removed, since the routing itself is no longer ambiguous.

---

## Issue 3 — `POST /api/consultations` → 500 Internal Server Error (confirmed backend-only)

### Original symptom (frontend-side bug, already fixed)

`assessmentId` was originally sent as a **string** (`"42"`) instead of a number — it came from a React Router URL param (`useParams()`), which is always a string, and was passed through unconverted. Fixed in `AssessmentDetailPage.jsx`: now sends `Number(id)`.

### Follow-up: 500 persists even with a fully well-formed request

This was re-tested with a direct curl call that **bypasses the frontend and the gateway entirely**, hitting financial-service on `8082` directly:

```bash
curl -X POST 'http://192.168.0.116:8082/api/consultations' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer <token with role: PREMIUM_USER>' \
  -H 'Content-Type: application/json' \
  -d '{ "assessmentId": 37 }'
```

```json
{
  "success": false,
  "timestamp": "2026-08-05T19:01:12.9467823",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "path": "/api/consultations"
}
```

The token's decoded payload confirms `"role":"PREMIUM_USER"`, `assessmentId` is a genuine JSON number, and the request goes straight to the service — no frontend, no gateway, no serialization ambiguity in the mix. This **rules out the frontend entirely** for this specific failure. It's an unhandled exception inside financial-service's consultation-creation logic.

Note also that a generic catch-all is clearly present (the response has the clean `{success, status, error, message, path}` shape, so *some* global handler exists) — it's just masking the real exception behind `"An unexpected error occurred"` instead of surfacing a specific `4xx` for whatever's actually going wrong.

### Requested actions

1. Share the financial-service stack trace for this exact request (`assessmentId: 37`, that `PREMIUM_USER` token) — the response body doesn't expose it.
2. Check, in likely order:
   - Does assessment `37` actually exist and belong to the calling user? A `.findById(...).get()` on a missing/mismatched record throws `NoSuchElementException`, which would land in exactly this generic catch-all.
   - Is there a duplicate-request guard (one active consultation per assessment) that's throwing instead of returning a clean `409 Conflict`?
   - Any synchronous side effect on creation (RabbitMQ publish, notification trigger, `advisorUserId` handling) not wrapped in its own try/catch, taking the whole request down with it.
3. Once the real exception type is known, add a specific `@ExceptionHandler` for it so this returns a meaningful `4xx` in the future instead of a bare `500`.

---

## Issue 4 — Please confirm: does `/auth/refresh-token` re-read current role from the DB?

### Context

We had a related frontend bug (now fixed) where, after a Razorpay upgrade succeeded, the frontend only patched the **local** Redux user object to `PREMIUM_USER` — it never obtained a new access token. Since JWTs are self-contained and signed at issuance, the old token kept presenting the pre-upgrade role on every subsequent request, and premium-gated endpoints correctly rejected it with `403`/`AuthorizationDeniedException`.

**Frontend fix:** `UpgradePage.jsx` now calls `POST /auth/refresh-token` immediately after a verified payment, and adopts whatever `accessToken`/`user` that returns via `setCredentials`.

### What we need confirmed on your side

That fix only works if `/auth/refresh-token` **re-derives the user's current role from the database** at refresh time (rather than just re-signing whatever role was embedded in the refresh token / prior session state). If refresh-token instead reuses the original claims without a fresh DB lookup, our fix is cosmetic and the same stale-role problem will resurface immediately after refresh. Please confirm the implementation does a fresh user lookup on every refresh, and if not, that's the actual fix needed here (not just on the frontend).

This same mechanism is also what determines how long it takes for an **admin-initiated** role change (`PUT /api/admin/users/{userId}/role`) to take effect for that user's *already-logged-in* session — worth documenting the expected behavior (do they need to log out/in, or does their next natural token refresh pick it up?).

---

## Issue 5 — Consultation `status` is `COMPLETED` in the DB, not the documented `RESPONDED`

### Evidence

Direct DB read on `advisor_consultation` after an advisor responded:

```
consultation_id  assessment_id  user_id  advisor_user_id  remarks                    status      created_at           updated_at
1                37             11       12                dgfdgfdgfdgd              COMPLETED   2026-08-05 19:14:52  2026-08-05 19:15:49
2                37             11       12                adsfghdsasdfghmdsasxdfgh  COMPLETED   2026-08-05 19:16:27  2026-08-05 19:21:47
```

`loangauge_api_docs.md` §8/§9 documents the status enum as `PENDING | RESPONDED` only. The real, persisted value after `PUT /api/advisor/consultations/{id}` is `COMPLETED`. This isn't a hypothesis — it's read directly from the table.

### Impact this caused on the frontend

`ConsultationsPage.jsx` and `AdvisorDashboardPage.jsx` were both written against the documented `RESPONDED` value: badges, the "resolved history" list, and — worse — the block that actually renders the advisor's remarks text were all gated on `status === 'RESPONDED'`. Since that string never matched, users saw "Pending Review / Awaiting Advisor Review" indefinitely even after an advisor had genuinely completed the review and remarks existed in the row.

**Frontend fix applied:** both pages now key off `remarks` being non-empty rather than matching a specific status string — this is inherently correct per your own docs (`remarks: null` until answered) and is resilient to whichever status literal the backend actually uses.

### Requested action

Not blocking (frontend is now resilient either way), but please reconcile the docs and the implementation — either the enum should genuinely be `PENDING | RESPONDED` and the persistence code has a typo/wrong constant, or `COMPLETED` is the intended real value and `loangauge_api_docs.md` §8/§9 need updating to match. Right now they disagree, which will bite the next integration (e.g. anything server-side or in another client that pattern-matches the documented value).

---

## Issue 6 — `POST /api/reports/{assessmentId}/email` doesn't return the documented JSON envelope

### Symptom

Per `loangauge_api_docs.md`, this endpoint should return:

```json
{ "success": true, "message": "Report emailed to user@example.com", "data": null }
```

In practice the response body observed from the frontend is a bare string:

```
Report emailed to user@example.com
```

The email itself sends successfully — this is purely a response-shape bug. But the Content-Type header is still (or is being treated as) `application/json`, so any client that calls `response.json()` on it — which is the standard/default behavior for a JSON API — throws a `SyntaxError` trying to parse a plain string as JSON. On our side this surfaced as RTK Query's `fetchBaseQuery` throwing `SyntaxError: Unexpected token 'R', "Report ema"... is not valid JSON` and displaying that raw parser error to the user in a toast, even though the underlying action succeeded.

### Frontend fix applied

`notificationApi.js`'s `emailReport` mutation now uses a custom `responseHandler` that tries `JSON.parse` first and falls back to treating the raw text as the message if parsing fails, so this is no longer user-facing. This is a workaround, not a fix — the frontend can't distinguish "the string is the whole message" from "the string is a truncated/malformed JSON body" the way a proper envelope would let it.

### Requested action

Return the documented envelope (`{ "success": true, "message": "...", "data": null }`) as actual JSON, matching every other endpoint in the docs, rather than writing the message directly to the response body.

---

## Issue 7 — `cibilScore` DTO validation contradicts the scoring logic's own null-handling

### The contradiction

`ScoringUtil.scoreCreditProfile` (or wherever this logic lives) explicitly branches on a missing score:

```java
if (cibilScore == null) {
    base = 50; // Neutral default when CIBIL is unpopulated
} else if (cibilScore >= 750) {
    base = 100;
} ...
```

This code can only run if `cibilScore` is allowed to be `null` by the time it reaches this method. But the DTO says otherwise:

```java
@NotNull(message = "CIBIL score is required")
@PositiveOrZero
@Max(value = 900, message = "CIBIL score must be between 300 and 900")
Integer cibilScore,
```

`@NotNull` means a request can never actually reach `scoreCreditProfile` with `cibilScore == null` — Bean Validation rejects the request at the controller boundary first with "CIBIL score is required." The `null` branch is dead code as the DTO is currently written.

There's a second, smaller mismatch in the same block: the `@Max` annotation's own message says *"CIBIL score must be between 300 and 900,"* but the actual constraint applied is `@PositiveOrZero` (floor of 0) + `@Max(900)` — so a value like `100` would currently pass validation despite the error message implying a 300 floor.

### Requested fix

1. Remove `@NotNull` from `cibilScore` so a request can omit it (send `null`) and reach the neutral-default branch as intended.
2. Change `@PositiveOrZero` to `@Min(300)` so the floor actually matches the `@Max` message's stated range, and so validation only ever rejects an out-of-range *provided* value — not a missing one. (Standard Bean Validation constraints like `@Min`/`@Max` are already skipped automatically for a `null` value, so this alone is enough — no conditional/custom validator needed once `@NotNull` is gone.)

### Frontend change made to match this

`financialProfileSchema.cibilScore` (in `src/validators/profile.validators.js`) now treats a blank field as `null` rather than requiring a number, and validates 300–900 only when a value is actually provided. `FinancialProfilePage.jsx`'s CIBIL score field is optional, defaults to blank (not a guessed number), and its live gauge preview shows the neutral-baseline state when left empty. This is only safe to ship once the DTO change above lands — until then, submitting a blank CIBIL score from the frontend will get rejected by the current `@NotNull`.

---

## Appendix — Frontend request contract (for reference)

These are the exact request shapes the frontend sends today, confirmed against `loangauge_api_docs.md`:

| Endpoint | Method | Body sent by frontend |
|---|---|---|
| `/api/consultations` | POST | `{ "assessmentId": 42 }` *(fixed — was a string)* |
| `/api/users/profile` | GET | — |
| `/api/admin/users` | GET | — |
| `/api/admin/subscriptions` | GET | — |

All other endpoint integrations (auth, financial profile, assessments, goals, comparisons, admin loan-types/subscriptions writes, payments) were also audited this session against the docs and matched the documented contract exactly — no further discrepancies found on the frontend side as of this report.
