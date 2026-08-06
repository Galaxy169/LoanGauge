# LoanGauge — Manual Testing Guide

Covers everything changed this session: financial profile refresh bug, comparison infinite loop, risk indicator colors, AI Recommendations gating, PDF/email report, JWT refresh/expiry, and the profile/logout UI additions.

For each step, do the action and note **Pass** / **Fail** + what you actually saw if it differs from Expected. Test as both a **free (USER)** account and a **premium (PREMIUM_USER)** account where noted — several bugs were role-specific.

---

## 1. Login / Session

| # | Step | Expected |
|---|------|----------|
| 1.1 | Log in with a valid account | Redirected to `/dashboard`, name appears in sidebar |
| 1.2 | Open DevTools → Application → Local Storage | `accessToken` and `user` present |
| 1.3 | Open DevTools → Application → Cookies → `localhost` | `refreshToken` cookie present, **HttpOnly** column checked |
| 1.4 | Stay on any page ~14 minutes without navigating (or shorten `REFRESH_BUFFER_MS`/token TTL locally to test faster) | Session stays alive with no re-login prompt — a silent refresh should fire in the background ~60s before expiry (watch Network tab for a `POST /auth/refresh-token` call you didn't trigger) |
| 1.5 | Delete the `refreshToken` cookie manually in DevTools, then wait for the next silent refresh (or trigger any API call) | You're logged out automatically and redirected to `/login` — should **not** just hang or silently fail |

---

## 2. Homepage (logged out vs logged in)

| # | Step | Expected |
|---|------|----------|
| 2.1 | Log out, visit `/` | Hero shows marketing copy ("Know your loan eligibility..."), "Get Started Free" + "See How It Works" buttons |
| 2.2 | Check top nav (logged out) | "Sign In" + "Get Started" buttons, no name/dashboard shown |
| 2.3 | Log in, visit `/` | Hero shows "Welcome back, {your first name}." with "Go to Dashboard" + "Logout" buttons |
| 2.4 | Check top nav (logged in, desktop width) | Shows "Dashboard ({name})" button **and** a separate "Logout" button beside it |
| 2.5 | Shrink browser to mobile width, open hamburger menu (logged in) | Mobile menu also shows "Dashboard ({name})" and "Logout" as two separate buttons |
| 2.6 | Click "Logout" from the homepage hero | Logged out, returns to `/`, hero reverts to logged-out marketing copy |
| 2.7 | Scroll to bottom CTA band, logged out | "Ready to calibrate your readiness?" with "Create Free Account" + "Run an Assessment" |
| 2.8 | Scroll to bottom CTA band, logged in | "Ready for your next assessment?" personalized with your name, **no** "Create Free Account" button (only "Run an Assessment") |

---

## 3. Topbar (inside the app, any authenticated page)

| # | Step | Expected |
|---|------|----------|
| 3.1 | Look at top-right of the app header | Bell (notifications) icon, and immediately to its right, a round avatar with your initial |
| 3.2 | Click the bell | Notification dropdown opens; clicking the avatar area does **not** also open it |
| 3.3 | Click the avatar | A separate dropdown opens showing your name, your role, "Profile Settings", and "Sign Out" — the bell dropdown should close if it was open |
| 3.4 | Click "Profile Settings" | Navigates to `/settings`, dropdown closes |
| 3.5 | Reopen avatar dropdown, click "Sign Out" | Logged out, redirected to `/login` |
| 3.6 | Click elsewhere on the page while a dropdown is open | Dropdown closes (click-outside behavior) |

---

## 4. Financial Profile — the "needs refresh" bug

| # | Step | Expected |
|---|------|----------|
| 4.1 | As a **new account with no profile yet**, go to `/financial-profile` | Badge shows "Action Required", button says "Create Financial Profile" |
| 4.2 | Fill out all fields, submit | Success toast, **and without reloading the page**: badge flips to "Profile Complete", button changes to "Save Profile Edits", form now shows your submitted values |
| 4.3 | Go to `/dashboard` (same session, no reload) | Should recognize the profile exists (no "create your profile" prompt) |
| 4.4 | Go to `/assessments/new` (same session, no reload) | Should also recognize the profile exists and let you proceed to create an assessment |
| 4.5 | Edit an existing field on `/financial-profile` and save | Success toast, values persist correctly, still no reload needed |

This is the one to watch closely — before the fix, all of 4.2–4.4 required a hard page refresh to reflect reality.

---

## 5. Assessment Comparison — the infinite loop / freeze bug

| # | Step | Expected |
|---|------|----------|
| 5.1 | Go to `/assessments`, select 2–5 assessments, click "Compare Selected" | Comparison page loads normally, charts render, **browser stays responsive** |
| 5.2 | Open DevTools → Network tab **before** clicking compare, filter to `comparisons`, then click compare | Exactly **one** `POST /api/comparisons` call fires — not a rapid repeating stream |
| 5.3 | On the comparison results page, leave it open and idle for 15–20 seconds while watching the Network tab | No repeated `/api/comparisons` calls should appear on their own |
| 5.4 | Copy the comparison URL (`/assessments/compare?ids=...`), open it in a new tab directly | Loads correctly with a single API call, same as 5.2 |
| 5.5 | Click "Change Selected Items", pick a different set, compare again | Works cleanly, still one call per compare, no leftover loop from the previous comparison |

If this regresses, you'll see it immediately as tab freeze / fan spin-up — no need to inspect closely, it's unmistakable.

---

## 6. Risk Indicator Colors

Do this with assessments across a spread of scores if you can (e.g. one very high score, one very low, a couple in between) so all five risk tiers get exercised: Excellent, Good, Moderate, Needs Improvement, High Risk.

| # | Step | Expected |
|---|------|----------|
| 6.1 | Open an assessment with an **Excellent** score (highest tier) on `/assessments/{id}` | Gauge ring is **green**, badge next to the title is a green pill labeled "EXCELLENT" |
| 6.2 | Open a **High Risk** assessment | Gauge ring is **red**, badge is a red pill labeled "HIGH RISK" |
| 6.3 | Check the other tiers (Good, Moderate, Needs Improvement) if you have examples | Gauge ring + badge colors step from green → yellow/orange → red sensibly, no tier shows red except High Risk (and Needs Improvement, which is orange) |
| 6.4 | Go to `/assessments` (history table) | The "Risk Indicator" badge column and the small Gauge in the "Score" column both show matching colors per row, consistent with what you saw on each assessment's detail page |
| 6.5 | Go to `/dashboard` | The "Financial Score" card's badge + gauge match your latest assessment's actual tier; "Recent Assessments" list badges match each row's tier too |

The bug specifically made Excellent-tier scores show up red — that's the one to confirm is gone everywhere.

---

## 7. AI Recommendations (Assessment Detail page)

Test with **both** a free and a premium account.

| # | Step | Expected |
|---|------|----------|
| 7.1 | **Free account**: open any assessment detail page | "AI Recommendations" card shows an upgrade prompt ("...premium feature. Upgrade to get personalized tips...") with an "Upgrade to Unlock" button — no loading spinner, no polling |
| 7.2 | **Free account**: watch Network tab on that page for ~5 seconds | No `/api/recommendations/...` calls should fire at all |
| 7.3 | **Free account**: click "Upgrade to Unlock" | Navigates to `/upgrade` |
| 7.4 | **Premium account**: open a **freshly created** assessment's detail page immediately | Card shows a pulsing skeleton + "Generating personalized recommendations…" |
| 7.5 | **Premium account**: wait a few seconds on that same page | Skeleton is replaced by a bulleted list of tips, plus a "GEMINI" or "AI Fallback" badge in the card header |
| 7.6 | **Premium account**: open an **older** assessment (recommendations should already exist) | List + badge show immediately, no skeleton flash needed |
| 7.7 | **Premium account only, harder to trigger**: if recommendations somehow never arrive within ~20 seconds | Card shows "Recommendations are being generated. Refresh the page in a few seconds." instead of hanging on the skeleton forever |

---

## 8. PDF Download & Email Report (Assessment Detail page)

| # | Step | Expected |
|---|------|----------|
| 8.1 | Click "Download PDF Report" | Button shows a spinner and disables itself; a PDF file downloads named `assessment-{id}-report.pdf`; success toast appears |
| 8.2 | Try double-clicking "Download PDF Report" quickly | Second click has no effect while the first download is still in flight (button is disabled) |
| 8.3 | Open the downloaded PDF | Contains the actual assessment report, not garbage/corrupted content |
| 8.4 | Click "Email Me Report" | Button shows a spinner and disables itself; success toast shows a real message (e.g. "Report emailed to you@example.com") — **not** a `SyntaxError`/`Unexpected token` message |
| 8.5 | Check your email inbox | Report email actually arrives |
| 8.6 | Try double-clicking "Email Me Report" quickly | Second click has no effect while the first request is in flight |

---

## 9. Consultations (Premium feature)

| # | Step | Expected |
|---|------|----------|
| 9.1 | **Premium account**: open an assessment, click "Request Advisor Review" | Success toast, redirected to `/consultations` |
| 9.2 | **Free account**: open an assessment | Button instead says "Upgrade for 1-on-1 Advisor Review" and goes to `/upgrade` when clicked |
| 9.3 | After an advisor has responded to a request (check with whoever has advisor access) | `/consultations` shows the response/remarks, not stuck on "Pending Review" |

---

## 10. Admin — Loan Types (Admin account only)

| # | Step | Expected |
|---|------|----------|
| 10.1 | Go to `/admin/loan-types`, click to create a new loan type | Form has three sections: Basic Info, Rate & Amount Limits, and a collapsible "Risk Thresholds" section |
| 10.2 | Leave a required field blank (e.g. Loan Name) and submit | Validation error shown, form doesn't submit |
| 10.3 | Enter a Min Interest Rate higher than Max Interest Rate | Validation error about min ≤ max |
| 10.4 | Leave all Risk Threshold fields blank and submit with only required fields filled | Should succeed — those fields are optional |
| 10.5 | Intentionally trigger a validation error inside the collapsed "Risk Thresholds" section | Section auto-expands to show the error |
| 10.6 | Save a valid loan type | Appears in the list with correct category/rate range/amount range displayed |

---

## 11. General Regression Pass

Quick sanity check across areas we didn't specifically change, to make sure nothing else broke:

| # | Step | Expected |
|---|------|----------|
| 11.1 | Create a new assessment end-to-end | Completes normally, redirects to the results page |
| 11.2 | Browse Goals section | Loads, create/edit a goal works |
| 11.3 | If Admin: check `/admin` dashboard stats and `/admin/users` | Loads correct numbers, no console errors |

---

**When reporting back:** for any failed step, include the step number, what you expected vs. what happened, and — if it's a visual bug — a screenshot if easy to grab. Browser console errors (F12 → Console tab) are especially useful to paste for anything that fails silently.
