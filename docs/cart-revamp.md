# Cart revamp

The cart uses the new storefront header, cream background, brick-red accents, serif heading, rounded product rows, and a sticky desktop order summary. On phones, the summary follows the items and the entire page scrolls normally.

## Structure

- `foodstore-web/src/pages/keranjang/index.js` composes sections and calls their hooks.
- `_hooks/useCartItems.js` owns loading/retry, quantity changes, deletion, persisted updates, and image fallback handling.
- `_hooks/useCartSelection.js` owns individual/bulk selection and the indeterminate select-all checkbox.
- `_hooks/useCartSummary.js` computes selected totals, shipping, stock eligibility, and checkout navigation.
- `_components/` contains the heading, item list, summary, and loading/error/empty states.

The existing cart APIs and Redux state are retained. Edits are committed to Redux after a successful API save; failures leave the previous cart intact and show a retryable error. Controls and checkout are disabled during saving. The existing automatic save listener is skipped for these already-saved changes. Concurrent cart loads share a request, failed loads do not masquerade as an empty cart, and responses from an old auth session are ignored.

The cart API now includes product stock so the page can cap quantity and block checkout for selected items with insufficient stock. Final availability still depends on the server when placing an order. The rupiah formatter now preserves whole-rupiah amounts instead of rounding to two significant digits. Header search from the cart opens the home catalog with the chosen keyword.

## Verification

- `CI=true npm test -- --watchAll=false --runInBand`: 78 passing tests, including cart loading, persistence, selection, totals, stock limits, deletion, retries, checkout navigation, header search, and existing page regressions.
- `npm run build`: successful production build.
- `node --check foodstore-server/app/cart/controller.js`: passes.
- Chrome review with fixture cart data at 1440, 768, 390, and 320 pixels: no horizontal overflow; all images load; no JavaScript runtime exceptions on the final review. Quantity changes, failed deletion, bulk selection, and the empty state were exercised with intercepted API responses.
- Live account carts, payments, and order placement were not modified during verification.
