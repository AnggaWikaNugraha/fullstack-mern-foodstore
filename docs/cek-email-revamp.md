# Email verification page revamp

The `/cek-email` page uses the shared auth layout, cream background, brick-red accents, serif heading, and food photo used by login and register. The form appears first on mobile; the full page scrolls on short screens.

## Structure and behavior

- `foodstore-web/src/pages/cek-email/index.js` calls `useResendVerification` and composes the guide and resend sections.
- `_hooks/useResendVerification.js` handles email validation, loading, duplicate-request protection, and success/error feedback.
- `_components/` contains the brand panel, three-step verification guide, and resend form.
- `src/api/auth.js` exposes `resendVerification` using the existing `/auth/resend-verification` endpoint.

Successful registration and unverified login pass the email through router state so the resend field is prefilled without putting it in the URL. Direct visits allow manual entry. The page only sends an email after form submission, clears stale feedback when the address changes, and confirms success only after a valid server response. Users can return to login after verification.

## Verification

- `CI=true npm test -- --watchAll=false --runInBand`: 56 passing tests, including 15 email-verification-page cases and existing register/login/home coverage.
- `npm run build`: successful production build.
- Chrome review at 1440, 768, 390, and 320 pixels: no horizontal overflow, image loads, and no JavaScript runtime exceptions. Required-field validation and navigation back to login work in the browser.
- API requests are mocked in tests; live email delivery and Google OAuth are not exercised.
