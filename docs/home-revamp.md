# Home revamp

Home uses a cream background, FoodStore red accents, a photographic hero, a responsive category strip, and a four-column desktop catalog (two columns on phones). The header includes working search, favorites, cart quantity, and account links. The catalog continues to use the existing product, category, tag, cart, and wishlist APIs.

Search resets pagination. Product pages contain eight items. Loading, empty, failed request, unavailable stock, and cart/wishlist feedback are handled explicitly. The banner is illustrative; product details and availability come from the API.

## Verification

- Production build: `npm run build` in `foodstore-web`.
- Tests: `CI=true npm test -- --watchAll=false --runInBand` in `foodstore-web` (10 tests).
- Chrome review with real catalog data at widths 1440, 768, 390, and 320 pixels; no horizontal page overflow.
- Browser interactions: keyword search, category selection, clearing filters, and the guest login flow.
- Authenticated cart/wishlist success and failure behavior is covered with mocked API responses in component tests.

## Image assets

- `foodstore-web/public/images/home/hero-burger.jpg`: generated with the built-in image_gen tool, then encoded as JPEG for delivery (1536 × 1024, approximately 500 KB).
- `foodstore-web/public/images/home/pastry.png`: reused from the existing repository upload `3f62bd55492b7d4024997f6bc0af5540.png`.

Final image-generation prompt:

> Use case: ads-marketing. Asset type: food ecommerce homepage hero photograph. Create a beautiful premium editorial food photograph, landscape 1536x1024. A delicious generous sesame brioche cheeseburger with crisp green lettuce, tomato, melted cheddar and grilled beef on a matte cream ceramic plate with golden french fries, a small red dipping sauce cup. Three-quarter overhead view. Warm pale cream tabletop (#f6eddf), subtle natural sunlight from upper left and soft shadows, small red gingham napkin at lower right, a few scattered fries. The burger is the main focus in the middle-right, food fills composition. Warm appetizing authentic textures, premium contemporary casual restaurant photography, sharp food details, restrained styling, no people, no text, no logo, no watermark. The image will sit on the right side of a cream and brick-red website hero; do not include any website UI.

