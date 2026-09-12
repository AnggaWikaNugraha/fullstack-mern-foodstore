# Login revamp

Login follows the new home theme: cream background, brick-red accents, serif emphasis, the shared FoodStore brand styles, and the existing burger photograph. The form comes first on mobile, and the page scrolls normally on short screens.

## Structure

- `foodstore-web/src/pages/login/index.js` composes the page and calls section hooks.
- `_hooks/useLoginForm.js` owns validation, password visibility, request status, error handling, authentication dispatch, and redirects.
- `_hooks/useGoogleLogin.js` provides the Google sign-in URL and callback error state.
- `_components/` contains the brand panel, form, and Google sign-in section.
- `component/AuthLayout/` shares the layout, header, password field, Google button, and responsive styles with register.

The folder name is lowercase `login`; the application import was updated accordingly. Login uses its own header, so the legacy topbar is hidden on `/login` and `/login/`.

Successful login returns to `/`. Unverified accounts go to `/cek-email`. Request failures keep the form available for another attempt. The Google link continues to use the existing backend OAuth endpoint.

## Verification

- `CI=true npm test -- --watchAll=false --runInBand`: 23 passing tests, including 13 login cases.
- `npm run build`: successful production build.
- Chrome review at 1440, 768, 390, and 320 pixels: no horizontal overflow; the image loads at every size.
- Browser checks: required-field messages, password visibility, and the Google callback failure message; no JavaScript runtime exceptions.
- Authentication success and failure branches are tested with mocked API responses. Live Google OAuth was not exercised.
