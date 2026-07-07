# Changelog

All notable changes to the AI.MED Lab website (`aimed-lab.org`) are documented
here. This project follows [Semantic Versioning](https://semver.org/) and the
[Keep a Changelog](https://keepachangelog.com/) format. This file was introduced
at v2.1.0; release history through **v2.0.0** lives in
[GitHub Releases](https://github.com/aimed-lab/aimed-org-web/releases).

## [2.1.0] — 2026-07-07

### Added
- **Unified registration flow.** A single registration page at `/member/register`
  now handles the entire new-member onboarding: invitation code + email →
  6-digit email verification → set password (twice) → member onboarding tutorial.
  The page auto-starts from the invite-email link (`?email=&code=`) and shows a
  clear "account cannot be activated — the code or email is invalid" message on
  bad input.

### Changed
- **`/member/activate` is now a clean password-only sign-in page.** Its
  "First time?" link points to `/member/register`.
- **`/admin` "Create account"** now routes to the unified `/member/register`
  flow instead of a separate in-page signup, removing duplicated UI.
- Admin invite hint copy now references `/member/register`.
- All sign-up now runs through the hardened `/api/auth` backend
  (`signup → verify-email → set-password`).

### Fixed
- **Logout no longer loops back in.** Session cookies (`member_token`,
  `admin_token`) are `httpOnly` and cannot be cleared from JavaScript, so the
  previous `document.cookie` logout was a no-op that left the user signed in.
  Logout now calls `DELETE /api/auth`, which clears all session cookies
  server-side, for both member and admin.

### Removed
- Deleted the redundant, weaker registration routes `/api/member/register` and
  `/api/member/activate` (which skipped email verification). Everything now
  flows through `/api/auth`.

### Verified
- Full happy-path exercised end-to-end on production: invite link → real emailed
  verification code → set password → onboarding tutorial.
- Logout confirmed server-side: after `DELETE /api/auth`, `/api/member/me`
  returns 401 and all session cookies are expired.
