# Register revamp

Register uses the same cream background, brick-red accents, serif headings, and food photography as login and the new home page. On mobile the form appears before the brand panel; short screens can scroll through the entire page.

## Structure

- `foodstore-web/src/pages/register/index.js` composes sections and calls their hooks.
- `_hooks/useRegisterForm.js` owns field validation, independent password visibility, server errors, loading, duplicate-submit protection, and the verification redirect.
- `_hooks/useGoogleRegister.js` provides the existing Google OAuth URL and callback error state.
- `_components/` contains the brand, registration form, and Google registration section.
- `register.css` adjusts spacing for the longer form.
- `component/AuthLayout/` shares the layout, header, password input, Google button, and theme with login.

Validation requires a trimmed name of 3–255 characters, a valid email, a password of 6–255 characters, and a matching confirmation. Successful registration opens `/register/berhasil`, which links to login and `/cek-email` while preserving the email in router state. Server field errors are attached to their inputs, and failed requests allow retry. No backend authentication behavior was changed.

The folder is lowercase `register`, with the application import updated accordingly. The register route is exact so `/register/berhasil` can reach its existing success page. The legacy topbar is hidden only on `/register` and `/register/`.

## Verification

- `CI=true npm test -- --watchAll=false --runInBand`: 41 tests pass, including 18 register cases and the existing login/home tests.
- `npm run build`: successful production build.
- Chrome review at 1440, 768, 390, and 320 pixels: no horizontal overflow, image loads, and no JavaScript runtime exceptions. Required-field validation and navigation back to login work in the browser.
- Authentication and registration requests are mocked in tests; live account creation, verification email delivery, and Google OAuth are not exercised.
