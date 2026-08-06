# LoanGauge — Form Validation Testing Guide

Every form field in the app, what the client-side rule actually is (from the zod schema, not guesswork), and what happens for edge-case input. Use this to answer "what happens if I enter X" confidently, and to know in advance which answers are a little rough around the edges.

**Two important patterns to understand before testing, so odd-looking results don't surprise you:**

1. **Blank required number fields show a generic message, not a custom one.** Most numeric inputs (Financial Profile, New Assessment, Goals) use React Hook Form's `valueAsNumber: true`, which turns an empty field into `NaN` *before* zod ever sees it. Zod treats `NaN` as its own type and rejects it with its built-in message: **"Expected number, received nan"** — not a friendly "This field is required." This is real, current behavior, not a bug I'm flagging for you to fix blind — just something to expect so it doesn't look like the form broke.
2. **Admin → Loan Types numeric fields behave differently (better).** That form deliberately avoids `valueAsNumber` and instead normalizes blank input in the schema itself, so blank required fields there show a proper custom message (e.g. "Interest rate is required"). It's the one form where blank-field messaging is polished.
3. **This guide is now cross-checked against `VALIDATIONS_REPORT.md` (the backend's documented DTO rules).** Everywhere the frontend previously drifted from the backend contract — accepting something the backend would reject, or rejecting something the backend would accept — it's been fixed in the validators and reflected below, so frontend and backend now give the evaluator the same answer.

---

## 1. Register (`/register`)

| Field | Try entering | Expected result |
|---|---|---|
| First Name | (blank) | "First name is required" |
| First Name | 101+ characters | "First name cannot exceed 100 characters" |
| First Name | `"   "` (spaces only) | "First name is required" — now trimmed before the length check, matching the backend's `@NotBlank` (previously this passed client-side and would've been rejected by the backend instead) |
| Last Name | same rules as First Name | same behavior as above |
| Email | (blank) | "Email is required" |
| Email | `notanemail` | "Invalid email format" |
| Email | `test@test` (no TLD) | "Invalid email format" — zod's email check requires a dot in the domain part, so a bare hostname isn't enough |
| Email | `test@test.com` | Passes |
| Email | 151+ characters | "Email cannot exceed 150 characters" — matches the backend's `@Size(max=150)` |
| Password | `abc` | "Password must be at least 8 characters long" — zod actually fails this against all four rules internally (length, uppercase, digit, special char all fail), but the form only ever displays the **first** failing rule's message per field, so this is the only one you'll see until you fix it and resubmit |
| Password | `alllowercase1!` | "Password must contain at least one uppercase letter" |
| Password | `ALLUPPER1!` | "Password must contain at least one lowercase letter" |
| Password | `Password!` (no digit) | "Password must contain at least one digit" |
| Password | `Password1` (no special char) | "Password must contain at least one special character (@#$%^&+=!*()_-)" |
| Password | `Password1~` (special char, but not in the backend's whitelist) | Fails — the special-character check now matches the backend's exact allowed set (`@#$%^&+=!*()_-`), not just "any non-alphanumeric character." `~`, `` ` ``, `[`, `]`, and similar are no longer accepted here even though they used to pass. |
| Password | `Password1!` or `Pass@1234` | Passes (8+ chars, upper, lower, digit, a whitelisted special char) |
| Password | 51+ characters | "Password must be at most 50 characters long" |
| Confirm Password | doesn't match Password | "Passwords don't match" — shown under the **Confirm Password** field specifically |
| Phone | (blank) | **Passes** — optional field, sent to the backend as `null` |
| Phone | `1234567890` | Fails — must start with 6, 7, 8, or 9 |
| Phone | `987654321` (9 digits) | Fails — needs exactly 10 digits |
| Phone | `+919876543210` | Fails — no country code / `+` allowed, digits only |
| Phone | `9876543210` | Passes |

---

## 2. Login (`/login`)

| Field | Try entering | Expected result |
|---|---|---|
| Email | (blank) | "Email is required" |
| Email | `notanemail` | "Invalid email format" |
| Password | (blank) | "Password is required" |
| Password | anything non-blank | Passes client-side (no complexity check at login — correctly so, since login shouldn't reject a real existing password for not meeting today's policy) |

---

## 3. Forgot Password (`/forgot-password`)

| Field | Try entering | Expected result |
|---|---|---|
| Email | (blank) | "Email is required" |
| Email | `notanemail` | "Invalid email format" |

---

## 4. Reset Password (`/reset-password`)

Same password complexity rules as Register.

| Field | Try entering | Expected result |
|---|---|---|
| New Password | weak/incomplete password | Same staged messages as Register's password field (length checked first, then upper/lower/digit/special) |
| Confirm Password | mismatch | "Passwords don't match" |

---

## 5. Settings → Profile Info (`/settings`)

| Field | Try entering | Expected result |
|---|---|---|
| First Name / Last Name | blank, 101+ chars | Same rules as Register |
| Phone | invalid format | Same rules as Register's phone field |
| Email | anything | Field is **disabled** — cannot be edited from the UI at all, by design |

---

## 6. Settings → Security & Passwords (`/settings`)

| Field | Try entering | Expected result |
|---|---|---|
| Current Password | (blank) | "Old password is required" |
| New Password | weak password | Same staged complexity messages as Register |
| Confirm New Password | mismatch | "Passwords don't match" |
| New Password | same as Current Password | **Passes client-side** — there's no rule preventing the new password from matching the old one. If the backend rejects this, the error will come back as a generic toast from the API response, not a field-level message. |

---

## 7. Financial Profile (`/financial-profile`)

All numeric fields use `valueAsNumber: true`, so remember: **blank → "Expected number, received nan"**, not a custom required message.

| Field | Try entering | Expected result |
|---|---|---|
| Age | `17` | "Age must be at least 18" |
| Age | `101` | "Age cannot exceed 100" |
| Age | `25.5` | Fails — must be a whole number (`.int()`); message will be zod's default integer-type message since no custom one is set |
| Dependents | `-1` | "Dependents cannot be negative" |
| Dependents | `21` | "Dependents cannot exceed 20" |
| Work Experience (Years) | `-1` | "Work experience cannot be negative" |
| Work Experience (Years) | `61` | "Work experience cannot exceed 60" (matches the backend's `@Max(60)` — this was wrongly capped at 50 before) |
| Work Experience (Years) | `60` | Passes |
| Monthly Income | `0` | **Passes** — the backend's `@DecimalMin("0.0")` explicitly accepts `0.0` as a valid income, so the field now allows it too (it used to wrongly reject `0` with "must be greater than 0") |
| Monthly Income | `-5000` | "Monthly income cannot be negative" |
| Monthly Expenses | `0` | Passes, same reasoning as Monthly Income |
| Monthly Expenses | negative | "Monthly expenses cannot be negative" |
| Existing Loans | `-1` | "Existing loans cannot be negative" |
| Existing Loans | `51` | "Existing loans cannot exceed 50" |
| Monthly EMI | `-1` | "Monthly EMI cannot be negative" — note `0` **is allowed** here (no `.positive()`, just `.min(0)`), unlike Income/Expenses |
| Credit Card Balance | negative | "Credit card balance cannot be negative" |
| Savings | negative | "Savings cannot be negative" |
| Fixed Deposits / Investments | negative | Same message pattern — but these two are the only optional numeric fields, so **blank is fine** here (no NaN issue since they're `.optional()`) |
| Emergency Fund | negative | "Emergency fund cannot be negative" |
| CIBIL Score | (blank) | **Passes** — this field is genuinely optional. Blank sends `null`, and the backend's scoring logic (`scoreCreditProfile`) substitutes a neutral baseline score rather than treating it as missing/invalid. The field defaults to blank, not a guessed number, and the live gauge preview next to it shows "NEUTRAL BASELINE (NO SCORE)" while empty. |
| CIBIL Score | `0`–`299` | "CIBIL score must be between 300 and 900" — a *provided* score below the real CIBIL floor is rejected; only *omitting* the field entirely is treated as valid. |
| CIBIL Score | `300`, `900` | Passes (boundaries inclusive) |
| CIBIL Score | `901` | "CIBIL score must be between 300 and 900" |
| CIBIL Score | `750.5` | Fails — must be a whole number |

Note: this depends on a matching backend fix — the DTO's current `@NotNull` on `cibilScore` would reject a `null` submission outright regardless of what the frontend sends, contradicting the scoring method's own null-handling. See `BACKEND_ISSUES_REPORT.md`, Issue 7.
| Credit Utilization | `-1` | "Credit utilization cannot be negative" |
| Credit Utilization | `101` | "Credit utilization cannot exceed 100" |
| Notes | 256+ characters | "Notes cannot exceed 255 characters" |
| Notes | (blank) | Passes — optional |
| Marital Status / City Type / Employment Type / Income Stability | N/A | These are `<Select>` dropdowns constrained to fixed options — there's no way to enter an invalid value through the UI itself |

---

## 8. New Assessment — Step 2 (`/assessments/new`)

| Field | Try entering | Expected result |
|---|---|---|
| Desired Loan Amount | `0` or negative | "Loan amount must be greater than 0" |
| Desired Loan Amount | (blank) | "Expected number, received nan" (same `valueAsNumber` pattern as above) |
| Desired Loan Amount | `10000000000000` (14 digits) | "Loan amount is too large" — matches the backend's `@Digits(integer=12, fraction=2)` cap, which the report specifically calls out as a rejected example. This is now caught client-side instead of round-tripping to the backend for a 400. |
| Desired Loan Amount | a value **above the selected loan type's `maxLoanAmount`** (e.g. more than the card showed, but still under the 12-digit ceiling) | **No client-side error** — the schema checks `> 0` and the overall digit cap, but does **not** cross-check against the *selected loan type's own* min/max range shown on the card. This is a real gap: the backend's dynamic `validateAgainstLoanType` business rule *does* enforce this server-side (rejecting with e.g. *"Loan amount must be between 50000 and 2000000 for Personal Loan"*), so the request will submit and come back with a backend error instead of a client-side one. Good one for an evaluator to probe, and accurately answerable: "the backend catches it, the frontend doesn't yet." |
| Repayment Tenure | dragged below the loan type's stated min or above its max | **Cannot happen from the slider** — the `<input type="range">` has `min`/`max` set to the loan type's own `minTenureMonths`/`maxTenureMonths`, so the UI physically prevents out-of-range values via the slider. |
| Repayment Tenure | forced to `1` or `2` months some other way | "Tenure must be at least 3 months" — matches the backend's `@Min(3)` (this schema previously allowed as low as 1 month, which the backend would have rejected) |
| Repayment Tenure | `3` months | Passes the DTO-level check (still subject to the loan type's own configured minimum via the slider/business rule) |
| Expected Interest Rate | `0` | "Interest rate must be at least 0.01" |
| Expected Interest Rate | `101` | "Interest rate cannot exceed 100" — note the backend's raw DTO bound (`@Digits(integer=3, fraction=2)`) technically allows up to `999.99`; the frontend intentionally caps at a realistic `100` as a sanity guard. In practice any rate above what a loan type's own `maxInterestRate` allows gets rejected by the backend's business rule regardless, so this doesn't let anything invalid through. |
| Expected Interest Rate | a value **outside the loan type's own min/max benchmark** shown under the field, but still ≤ 100 | **No client-side error** — same gap as Loan Amount above: only the global `0.01–100` bound is enforced client-side, not the specific loan type's range. The backend's `validateAgainstLoanType` rule catches this and returns a specific error naming the loan product. |

---

## 9. Goals (`/goals/new`, `/goals/:id/edit`)

| Field | Try entering | Expected result |
|---|---|---|
| Goal Name | (blank) | "Goal name is required" |
| Goal Name | 101+ characters | "Goal name cannot exceed 100 characters" |
| Target Amount | `0` or negative | "Target amount must be greater than 0" |
| Current Amount | negative | "Current amount cannot be negative" |
| Current Amount | (blank) | Passes — optional |
| Target Date | a **past date** (the date picker itself doesn't block this — no `min` attribute is set on it) | "Target date must be a valid future date" |
| Target Date | today's exact date | Fails the same way — the check is `date > new Date()` (strictly after *now*, including time-of-day), so picking today via a date-only picker (which defaults to midnight) will actually fail this check. This is a real, testable edge case worth confirming. |
| Target Date | (blank) | "Target date is required" |
| Notes | 256+ characters | "Notes cannot exceed 255 characters" |

Note: the backend's own `@Future` message is *"Target date must be in the future"* — slightly different wording from the frontend's *"Target date must be a valid future date"*. Doesn't matter functionally (the frontend check stops an invalid date before it's ever sent), but if an evaluator compares exact text between a frontend toast and a backend response for this field, that's why it differs.

---

## 10. Admin → Loan Types (`/admin/loan-types`, Admin role only)

Reminder: this form does **not** have the blank-number-shows-"nan" issue — required numeric fields show proper custom messages here.

| Field | Try entering | Expected result |
|---|---|---|
| Loan Name | (blank) | "Loan name is required" |
| Loan Name | 101+ characters | "Loan name cannot exceed 100 characters" |
| Category | N/A | Dropdown limited to Secured/Unsecured — can't be entered invalid |
| Interest Rate | (blank) | "Interest rate is required" (clean custom message, not "nan") |
| Interest Rate | `0` or negative | "Interest rate must be greater than 0" |
| Interest Rate | `101` | "Interest rate cannot exceed 100" |
| Max Tenure Months | (blank) | "Max tenure is required" |
| Max Tenure Months | `0` or negative | "Max tenure must be greater than 0" |
| Max Tenure Months | `36.5` | Fails — "Max tenure must be a whole number" |
| Min Interest Rate | set higher than Max Interest Rate | "Min interest rate cannot exceed max interest rate" (shown under Min Interest Rate) |
| Min Loan Amount | set higher than Max Loan Amount | "Min loan amount cannot exceed max loan amount" |
| Min Tenure Months | set higher than Max Tenure Months | "Min tenure cannot exceed max tenure" |
| Description | 501+ characters | "Description cannot exceed 500 characters" |
| Description | (blank) | Passes — optional |
| FOIR Excellent/Acceptable/Caution thresholds | entered out of ascending order (e.g. Excellent higher than Acceptable) | "FOIR thresholds must ascend: Excellent ≤ Acceptable ≤ Caution" — and the collapsed "Risk Thresholds" section **auto-expands** to show this error if it was collapsed |
| DTI Low/Moderate/High thresholds | out of ascending order | "DTI thresholds must ascend: Low ≤ Moderate ≤ High" |
| Any risk threshold field (FOIR/DTI/Multiplier) | (blank) | Passes — all seven risk fields are optional |
| Multiplier | `0` or negative | "Multiplier must be greater than 0" |
| Any percent field (FOIR/DTI thresholds) | negative, or over `100` | "Cannot be negative" / "Cannot exceed 100" |

---

## 11. Admin → Subscription Plans (`/admin/subscriptions`, Admin role only)

| Field | Try entering | Expected result |
|---|---|---|
| Plan Name | (blank) | "Plan name is required" |
| Plan Name | 51+ characters | "Plan name cannot exceed 50 characters" |
| Price | `0` or negative | "Price must be greater than 0" |
| Price | (blank) | "Expected number, received nan" (this form does use `valueAsNumber`) |
| Status | N/A | Dropdown limited to Active/Inactive |

---

## 12. Advisor → Respond to Consultation (`/advisor`, Advisor role only)

| Field | Try entering | Expected result |
|---|---|---|
| Remarks | (blank) or fewer than 10 characters | "Remarks must be at least 10 characters long" |
| Remarks | 2001+ characters | "Remarks cannot exceed 2000 characters" |
| Remarks | exactly 10 characters | Passes (boundary is inclusive) |

---

## 13. Backend business-rule validations (no client-side equivalent — these only surface after submit)

These aren't tied to a single form field's shape — they're dynamic checks the backend runs in its service layer, so the frontend can't validate them ahead of time. Good territory for an evaluator's "what if" questions since the exact wording is documented and worth quoting back precisely.

| Scenario | What happens |
|---|---|
| Loan amount, tenure, or interest rate falls outside the **selected loan type's own** configured min/max (even though it passes the general DTO bounds above) | Backend rejects with a message naming the specific loan product and its actual range, e.g. *"Loan amount must be between 50000 and 2000000 for Personal Loan"* |
| A standard `USER` (free tier) tries to create a **4th** assessment | *"Free-tier assessment limit of 3 reached. Upgrade to Premium for unlimited assessments."* — `PREMIUM_USER`, `FINANCIAL_ADVISOR`, and `ADMINISTRATOR` roles are exempt. The frontend does show its own "3 Free Assessments Used" screen before this is even attempted, so this backend message is more of a defense-in-depth check than something you'd normally see — but a direct API call (or a role/limit change mid-session) could still trigger it. |
| A user with **no financial profile yet** tries to run an assessment | *"Complete your financial profile before running an assessment."* — the frontend also blocks this earlier with its own "Financial Profile Required" screen (`NewAssessmentPage`'s `useCheckProfileExistsQuery` gate), so again this is the backend's own defense-in-depth version of the same rule. |

---

## Quick reference — boundary values worth double-checking everywhere

For any `min(N)`/`max(N)` rule, the three values that actually prove the boundary is implemented correctly are **N-1** (should fail), **N** (should pass — all the bounds in this app are inclusive), and **N+1** (should fail again on the other side). If an evaluator picks one value to test a rule, it'll almost always be one of these three.
