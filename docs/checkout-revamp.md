# Checkout revamp

Checkout follows the new home and cart theme: storefront header, cream background, brick-red accents, serif heading, three visible steps, and a sticky desktop order summary. On smaller screens the summary follows the active section.

## Structure

- `foodstore-web/src/pages/checkout/index.js` calls hooks and composes sections.
- `_hooks/useCheckoutItems.js` loads the cart, handles retry, derives selected items and totals, and checks stock eligibility.
- `_hooks/useCheckoutAddress.js` loads paginated addresses, preserves selection across pages, and restores an address added through the checkout return link.
- `_hooks/useCheckoutSteps.js` controls navigation, step readiness, and focus announcements.
- `_hooks/useCheckoutConfirmation.js` saves the cart, submits the order, handles failures, and opens the resulting invoice.
- `_components/` contains the heading, item list, address selection, confirmation, summary, and loading/error/empty states.

## Behavior

The steps are item review, delivery address, and confirmation. Users can return to completed steps and change their address before submission. Checkout requires selected items with sufficient stock and a selected address.

Submission saves the full cart so unchecked items remain available. The order endpoint consumes checked items only; after success, the frontend removes the ordered items and opens the invoice for payment. Repeated clicks are blocked while submission is pending. An ambiguous order response blocks another submission on the current page and directs the user to order history to check its status.

The delivery-address API now returns a count for pagination and scopes both listing and optional ID lookup to the signed-in user. The order endpoint checks empty selection, missing products, insufficient stock, and address ownership before creating records. These checks do not provide a transactional stock reservation or server-side order idempotency.

## Verification

- `CI=true npm test -- --watchAll=false --runInBand` in `foodstore-web`: 95 passing tests across 9 suites, including 17 checkout cases covering loading, address selection and return links, pagination, submission, failures, and unchecked-item preservation.
- `node --test foodstore-server/test/checkout.test.js`: 6 passing tests covering address query scoping and order validation with mocked dependencies.
- `npm run build` in `foodstore-web`: successful production build.
- Chrome review with intercepted fixture APIs at 1440, 768, 390, and 320 pixels: all three steps display without horizontal overflow, product images load, and no runtime exceptions occur. A simulated order rejection displays correctly and retains unchecked items.
- Verification did not create live orders or payments.
