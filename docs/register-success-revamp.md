# Registration success revamp

`/register/berhasil` uses the shared auth layout, cream and brick-red palette, serif headings, and food photography from login/register. The confirmation comes first on mobile and the page scrolls normally on short screens.

## Structure and flow

- `foodstore-web/src/pages/register-success/index.js` composes the brand and confirmation sections.
- `_hooks/useSuccessConfirmation.js` reads the email from router state and prepares the login and verification destinations.
- `_components/` contains the static brand panel and the confirmation section with actions.
- `register-success.css` supplies the confirmation-specific styles.

Successful registration now opens `/register/berhasil` with the registered email in router state. The page distinguishes account creation from email verification: users still need to verify before logging in. The resend link opens `/cek-email` and preserves the email for its form; it does not send another email automatically. Direct visits without email state use generic copy and allow manual email entry on the resend page.

The folder was renamed from `RegisterSucces` to `register-success`. The legacy topbar is hidden on the success route, including its trailing-slash form.

## Verification

- `CI=true npm test -- --watchAll=false --runInBand`: 60 tests pass, including registration → success → resend with email state, direct-access fallback, and login navigation.
- `npm run build`: successful production build.
- Chrome review at 1440, 768, 390, and 320 pixels: no horizontal overflow; photos load; login and resend links open the correct pages; no JavaScript runtime exceptions.
- Registration and resend APIs are mocked in tests; live account creation and email delivery are not exercised.
