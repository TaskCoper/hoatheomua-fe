# Create Order - layered coverage plan (v2)

Supersedes `COVERAGE-PLAN.md`. Derived from a code audit of `features/orders/**`,
`features/orders/hooks/**`, `stores/checkout-intent.store.ts`, `app/api/geocode/**`,
`playwright.config.ts`, `.github/workflows/playwright.yml` and all 14 existing spec files.

The previous plan had one implicit layer: everything with a `CO-` id was an E2E spec. That
conflated three different questions and pushed cheap, deterministic logic checks through a
five-minute browser journey against a shared remote backend.

---

## 0. The three questions

Every item in this plan answers exactly one of these. If an item seems to answer two, it is
two items.

| Layer                                                  | Question                                                                      | Runtime                | Fails when                                                                 |
| ------------------------------------------------------ | ----------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------- |
| **Unit** (`UT-`)                                       | Does the isolated business logic work?                                        | ~ms, in-process        | A pure function returns the wrong value                                    |
| **Integration / API** (`API-`, plus `CO-016`/`CO-026`) | Does our application correctly integrate its internal and external contracts? | ~s, HTTP only          | Our client and the server disagree about a payload, a fee, or an auth rule |
| **E2E / customer journey** (`CO-`)                     | Can a real customer complete the critical purchase journey?                   | ~1–2 min, full browser | A customer cannot buy, or is shown/charged the wrong number                |

**The rule that governs every reduction below:** a unit test and an E2E test can cover
different contracts. Adding unit coverage **never** deletes an E2E case. It only shrinks the
E2E case down to the part that genuinely needs a browser and a server - DOM rendering,
request suppression, and server-side agreement.

### ID spaces

- `UT-xxx` - new. Pure-function coverage. No browser, no network, no fixtures.
- `API-xxx` - new. HTTP-level coverage that is not a customer journey.
- `CO-xxx` - customer-journey scenarios. These names must survive layer changes.
  `CO-016` and `CO-026` keep a `CO-` id despite being API-shaped: they were minted before this
  plan and their layer is carried by the **Layer** field, not the prefix. New API work gets an
  `API-` id.

> **Renumbered twice on 2026-08-20.** First to group the `CO-` range by stage of the customer
> journey and drop the letter suffixes; then to pull every case that **has a spec** to the front
> of the range, so `CO-001…CO-016` are the implemented ones with no holes and `CO-017…CO-026`
> are the Deferred / Blocked ones, status unchanged. `UT-` and `API-` numbers were never
> touched. The consolidated old→new table lives at the bottom of `README.md`; this document
> uses the **current** ids throughout. `COVERAGE-PLAN.md` (v1, superseded) still uses the
> original ones.

---

## 1. Interception strategy (`page.route`)

**Introduced 2026-08-20 by `API-002`; first real consumer is `CO-008`.** Before that,
`page.route` appeared in zero specs - the previous plan's Rule 7 ("route intercepts are the
tool for unreachable states") described an intention, not a practice, while CO-007, CO-012
and CO-020/CO-021 all depended on it. Two seams are now proven in the suite:

- **`/api/geocode/autocomplete`** (API-002) - glob pattern `**/api/geocode/autocomplete*`,
  fulfilled with `{ results: [...] }`. Also verified that `page.unroute` restores the real
  seam, so a stub cannot leak past the step that armed it.
- **`/api/v1/configs/public?groupName=ahamove`** (CO-008) - matched by **URL predicate**, not
  glob, because the app reads several config groups through the same path and a loose pattern
  would stub all of them.

Two practical rules learned while doing it, both load-bearing:

1. **Arm the route inside the test body, never at file scope.** The `savedAddress` fixture
   creates its row through the profile dialog, which drives the same autocomplete component.
   A stub armed earlier feeds the fixture synthetic suggestions and it never resolves a real
   address. Fixture setup completes before the body runs, so the body is the first safe moment.
2. **Assert the route was actually hit** - and count it **inside the handler**. A pattern or
   predicate that never matches makes every downstream assertion vacuous while the test still
   passes. Counting from a `page.on('request')` listener does not prove this: the request
   goes past the listener whether or not the stub matched it. Every stub in the suite
   increments a counter in its own handler and asserts `> 0`.
3. **`page.unroute` matches its url argument by identity.** Passing a fresh arrow function
   that reads the same as the one `page.route` was armed with removes nothing, and the stub
   stays live for the rest of the test. Found in CO-012 during the 2026-08-20 cleanup; the
   predicate is now a module-level `const` shared by both calls. A string or `RegExp` pattern
   is compared by value, which is why API-002's `AUTOCOMPLETE_ROUTE` was never affected.

### The actual seams

Third-party calls do **not** all leave the browser. Three different topologies exist, and
they are not interchangeable:

| Service            | Actual call path                                                                           | Interceptable from the browser?   |
| ------------------ | ------------------------------------------------------------------------------------------ | --------------------------------- |
| **Ahamove**        | browser → **our backend** `POST /api/v1/ahamove/estimate` → Ahamove                        | Only our backend's response       |
| **VietMap**        | browser → **our Next BFF** `/api/geocode/{autocomplete,place,reverse}` → `maps.vietmap.vn` | Yes - same-origin, clean seam     |
| **VietQR**         | browser → `https://api.vietqr.io/v2/business/{taxCode}` **directly** (`services.ts:95`)    | Yes - direct cross-origin         |
| **Goong**          | browser → `https://rsapi.goong.io/geocode` **directly** (`services.ts:139`)                | Yes - direct cross-origin         |
| **Public configs** | browser → our backend `GET /api/v1/configs/public?groupName=ahamove`                       | Yes                               |
| **BaoKim**         | order detail `paymentUrl` → external redirect                                              | Yes, but see CO-014               |
| **Nhanh.vn**       | backend-side catalogue only                                                                | **No** - invisible to the browser |

### Seam-by-seam policy

**`/api/geocode/*` - the preferred seam.** Same-origin, stable shape, owned by us. Stub it
in every spec where a resolved address is deterministic _input_ (CO-002, CO-004, CO-019,
CO-020, CO-007). Keep it real only where reverse-geocode write-back is the _subject_
(CO-021). Stubbing here removes VietMap latency and quota from the critical path of most of
the suite.

**`api.vietqr.io` - recommended stub, NOT yet implemented.** A live cross-origin call to a
free public API fires mid-checkout on every `taxCode` keystroke (debounced 500ms,
`invoice-fields.tsx:56-88`). CO-009 and CO-010 both type a tax code and neither cares about
the lookup panel, so both _should_ stub it. **As of the 2026-08-20 cleanup pass neither
does** - the call is live in both, and this is the one open item from §1 that is still
outstanding. Keep it real in **CO-003 only**, where the panel _is_ the subject.

**`rsapi.goong.io` - stub wherever it fires.** A second geocoding provider alongside
VietMap, called directly from the browser, covered by nothing and subject to nobody's
contract test. _Open question for the team: why do two geocoding providers exist?_

**`/api/v1/configs/public?groupName=ahamove` - stub only in CO-008.** Everywhere else this
must be real: it carries `ahamove.free_ship`, the threshold both the client and the server
key their free-shipping decision off, and `getFreeShipKm` (`e2e/api/orders.api.ts:13`) reads
the same source of truth to guard the fixture addresses.

**`/api/v1/ahamove/estimate` - ⚠ this mocks OUR BACKEND, NOT AHAMOVE.**

> Intercepting this route replaces **your own backend's response**. It does not simulate
> Ahamove. Stubbing it removes _two_ contracts from coverage at once: the backend↔Ahamove
> integration, **and** your backend's own fee computation. Any spec that stubs this route
> can no longer make a meaningful `expectServerTotalsMatchUi` assertion, because the fee it
> compares against is one the test itself invented.
>
> **Therefore: never stub this route in a pricing spec.** The only legitimate use is forcing
> a non-200 (CO-012 §3) - a state the real service will not produce on demand.

---

## 2. Fixtures

### Product fixture - `e2e/fixtures/products.ts` (new)

All ten order-creating specs currently declare byte-identical constants:

```
SEARCH_TERM  = 'Coral Pink'
PRODUCT_NAME = 'Bó Coral Pink_2026'
PRODUCT_ID   = 'a10efc5a-ad03-4102-9e1e-5807e3f7a38c'
```

These are **shared immutable fixture data**, not deliberately-varied test data - verified
identical across all ten files. `e2e/fixtures/address.ts` already centralizes
`FREE_SHIP_ADDRESS`/`PAID_SHIP_ADDRESS`; products are the inconsistency.

Design it as a **set, not a constant** - CO-006 needs three lines across two products plus a
second variant:

```ts
export const PRIMARY_PRODUCT = { searchTerm, name, id } // used by every existing spec
export const SECONDARY_PRODUCT = { searchTerm, name, id } // CO-006 only
export const ORDER_NOTE = 'DEV TEST - Không xử lý đơn hàng này.'
```

`ORDER_NOTE` is duplicated in eight files and is a hard requirement of every order
(Rule 3 below) - it belongs in the same module.

### Address fixture - `e2e/fixtures/address.ts`

`FREE_SHIP_ADDRESS` / `PAID_SHIP_ADDRESS` via `orderTest.use({ addressSpec })`. Already
correct. Extend with an opt-in second saved address for CO-020 §3 rather than creating one
inline, so teardown stays symmetrical.

`RECEIVER_PHONE` was added by the 2026-08-20 cleanup: the saved-address fixture and the two
manual-entry cases had the same `'0909111111'` written out three times. It is deliberately
different from the invoice phone below, so a cross-wired field cannot pass unnoticed.

### Invoice fixture - `e2e/fixtures/invoice.ts` (added 2026-08-20)

`BUSINESS_INVOICE`, `PERSONAL_INVOICE`, `TAX_BUSINESS_NAME` and `NO_INVOICE_FIELDS`. The
first three were duplicated across CO-003, CO-004, CO-009, CO-010 and CO-011 - the same tax
code, email, CCCD and invoice address written out five times.

`NO_INVOICE_FIELDS` is the eight-key "no invoice" shape, spread into the `toMatchObject`
calls of CO-001, CO-002 and CO-005 for both the request payload **and** the order read back.
It is asserted as a whole rather than field by field because the risk is a _leak_: one
invoice value surviving from form state onto an order that was never meant to carry one.

### Test-harness helpers, not fixtures

- **`e2e/utils/requests.ts`** (added 2026-08-20) - the canonical `/api/v1/...` pathnames plus
  `countRequests` / `countPostsTo` / `waitForCreateOrderRequest`. The
  `new URL(request.url()).pathname === '...'` predicate was hand-written about thirty times;
  a typo in any one of them silently pinned a counter at 0 and made its assertion vacuous.
  The docblock on `countRequests` is the single home of the "counter, never account-wide
  state" reasoning that was copy-pasted into five specs.
- **`e2e/utils/delivery.ts`** (added 2026-08-20) - `scheduledDeliveryDate()` and
  `orderTimeOf()`, shared by CO-003 and CO-004 and ready for CO-017. The unix-**seconds**
  encoding is a contract, so it has one home.
- **`CheckoutPage.goToPaymentCapturingQuote()`** - replaced the ten hand-rolled
  `Promise.all([waitForRequest, waitForResponse, goToPayment])` blocks, including the
  "cheapest by `total_fee`" sort that mirrors `checkout-client.tsx` and was written out six
  times.
- **`ProductPage.addFixtureToCart()`** - replaced the identical four-call
  search → open → variant → add opening of fourteen specs. CO-006 and CO-007 still drive the
  steps by hand, because _which_ variant they pick is their subject.

---

## 3. Rules that apply to every E2E item

Carried forward from v1, with two corrections marked.

1. **One shared account, fully parallel.** Never assert account-wide state (address count,
   order count, another spec's cart). Use a per-page request counter or a route intercept.
2. **Register cleanup before asserting.** `createdOrders.push(order.id)` goes on the line
   after `placeOrder()` returns, before any `expect` that could throw.
3. **Every order carries the note** `DEV TEST - Không xử lý đơn hàng này.`
4. **No `data-testid` in checkout.** Locators are Vietnamese accessible names from
   `lib/i18n/messages/vi.json`; add new ones to `e2e/pages/checkout.page.ts`, never inline.
5. **`orderTest.use({ addressSpec })`** picks the fixture address.
6. **A spec that creates no order** needs no `createdOrders`, and should not use
   `orderTest.slow()` unless it walks the product→cart→checkout path.
7. **~~Route intercepts are the tool for unreachable states.~~ CORRECTED:** route intercepts
   are the tool for unreachable states **and for third-party determinism** - but they have
   never been used in this suite, and the `/api/v1/ahamove/estimate` seam mocks our own
   backend. Read §1 before adding one.
8. **The submit button intermittently swallows its first click** (README open risk #5). This
   is unfixed. **`CheckoutPage.placeOrder()` neither retries nor counts create-order calls** -
   it waits for the `/orders/{id}` URL, so on the happy path a swallowed click surfaces as a
   loud timeout. Counting belongs to each spec, through `countPostsTo` in
   `e2e/utils/requests.ts`. On a negative path a swallowed click is **indistinguishable** from
   a correctly blocked submit, so CO-010 and CO-011 assert the toast and the inline error -
   which only appear once the submit was really processed - **before** asserting zero POSTs.
   Any new negative-path case must do the same; a bare zero-POST assertion is a false pass.
9. After each item: update the README table and Coverage section, and add a case doc if a
   new ID was minted.

Run a single spec:

```
npx playwright test e2e/create-order/co-0NN-*.spec.ts --project=chromium
```

---

# 4. UNIT LAYER - `UT-xxx`

**Question: does the isolated business logic work?**

No browser, no network, no fixtures, no account. Requires `vitest` (not currently in
`package.json` - there is no non-E2E test infrastructure of any kind).

None of these replace an E2E case. Each one _shrinks_ one, by taking over the combinatorial
half that does not need a browser.

---

### UT-001 - `buildCheckoutPayload` invoice-branch filtering

- **Layer:** Unit
- **Scenario:** Call `buildCheckoutPayload` with form values in every invoice configuration:
  invoice off; Business with all fields populated; Personal with all fields populated; and
  both cross-contaminated states (Business values present while `invoiceType: Personal`, and
  vice versa).
- **What it proves:** `taxCode` is emitted only for Business; `identityNumber`,
  `receiptFullName`, `receiptAddress` only for Personal; `receiptEmail` and
  `receiptPhoneNumber` for both; everything nulled when `isExportInvoice` is false;
  `emptyToNull` collapses whitespace-only values. This is the permanent home of the
  throwaway 11/11 script from the 2026-08-19 FIX.
- **Does NOT prove:** that the form ever reaches those states (that is the tab-switch
  clearing, CO-009), that the sidebar reflects them (CO-009), or that the server honours the
  distinction (CO-003, CO-004).
- **Dependencies:** vitest. `payloads.ts` verified pure - imports types only, no React, no I/O.
- **Test data:** hand-built `CheckoutFormValues` literals. No fixtures.
- **Status:** ✅ **Implemented** - `features/orders/payloads.test.ts` · **Priority:** P0 · **Creates order:** No · **Third-party:** N/A

---

### UT-002 - `buildEstimatePayload` field mapping

- **Layer:** Unit
- **Scenario:** Call with a populated `productById` map, a map missing the product, mixed
  quantities, and multiple cart lines.
- **What it proves:** `itemId` resolves to `nhanhProductId` when known and **falls back to
  `productId`** when the map misses (`payloads.ts:32`); `number` carries `item.quantity`;
  `address`/`shortAddress` are the `addressLine, ward, city` concatenation; `orderTime` and
  `tagIds` pass through untouched.
- **Does NOT prove:** that the backend prices from `nhanhProductId` - that is CO-006 §4-5,
  and it is the assertion that actually protects revenue. The fallback silently sending a
  local `productId` the catalogue does not recognise is exactly the failure this unit test
  _cannot_ detect.
- **Dependencies:** vitest.
- **Test data:** literals.
- **Status:** ✅ **Implemented** - `features/orders/payloads.test.ts` · **Priority:** P0 · **Creates order:** No · **Third-party:** N/A

---

### UT-003 - `createCheckoutSchema` invoice `superRefine` matrix

- **Layer:** Unit
- **Scenario:** Build the schema with a **real `t` loaded from `lib/i18n/messages/vi.json`**,
  then parse: invoice off (no invoice fields required); Business missing each of its 3
  required fields in turn; Personal missing each of its 5 in turn; invalid email; invalid
  phone; `invoiceType: null` with `isExportInvoice: true`.
- **What it proves:** `validations.ts:73-98` raises an issue on the right `path` with the
  right message, for all 8 required-field cases plus format failures. Because `t` is real, it
  also catches a **missing or renamed translation key**, which a stub `t` would hide.
- **Does NOT prove:** that the message renders in the DOM under the right input, that the
  submit is actually blocked, or that no request fires. All three are CO-010/CO-011.
- **Deliberately pinned gap:** `invoiceType: null` with `isExportInvoice: true` requires
  **nothing** - neither branch of the `if/else if` runs. Assert current behaviour and comment
  it as a pinned gap; the UI cannot reach it today because `enableInvoice()` sets
  `InvoiceType.Personal` (`invoice-fields.tsx:107`).
- **Dependencies:** vitest. `createCheckoutSchema` is pure _given a `t`_ - it takes
  `TranslationFunction`, so the test must supply one.
- **Test data:** literals + `vi.json`.
- **Status:** ✅ **Implemented** - `features/orders/validations.test.ts` · **Priority:** P0 · **Creates order:** No · **Third-party:** N/A

---

### UT-004 - `createEstimateSchema` step-1 rules

- **Layer:** Unit
- **Scenario:** Parse empty `addressLine`/`ward`/`city`; `remarks` at 500 and 501 chars;
  invalid `phoneReceiver`; `tagIds` with 0, 1 and 2 entries; `addressLine` at 255 and 256.
- **What it proves:** the step-1 gate's rules, including the 500-char `remarks` cap and the
  `tagIds.max(1)` rule the server does **not** enforce (README open risk #1).
- **Does NOT prove:** the `safeParse → issue.path.join('.') → setError` wiring in
  `use-checkout-flow.ts:62-70`, which is bespoke and is CO-019's entire reason to exist.
- **⚠ Pinned gap this exists to record:** the schema types `latitude`/`longitude` as bare
  `z.number()`, and `defaultValues` ships `latitude: 0, longitude: 0`
  (`use-estimate-order.ts:18-19`). **`latitude: 0` therefore passes validation.** That is the
  hole CO-021 describes from the UI side; pinning it here is far cheaper than driving a
  map. If the rule is ever tightened, this test is where it surfaces.
- **Dependencies:** vitest.
- **Test data:** literals + `vi.json`.
- **Status:** ✅ **Implemented** - `features/orders/validations.test.ts` · **Priority:** P1 · **Creates order:** No · **Third-party:** N/A

---

### UT-005 - `pickBestGeocodeResult` / `normalizeAddress`

- **Layer:** Unit
- **Scenario:** Feed `services.ts:50-66` a non-OK response, an empty result list, an exact
  match at a non-zero index, a match differing only by diacritics, one differing only by
  whitespace/case, and no match at all.
- **What it proves:** NFD normalization + combining-mark stripping + whitespace collapse
  correctly identifies an exact match regardless of index, and the first result is returned
  as fallback. Vietnamese diacritic handling is the non-obvious part and is entirely
  untested today.
- **Does NOT prove:** that VietMap or Goong return anything resembling the fixtures.
- **Dependencies:** vitest. Verified pure and exported.
- **Test data:** captured `GeoResponse` literals - capture real ones once from the network
  tab rather than inventing the shape.
- **Status:** Deferred · **Priority:** P1 · **Creates order:** No · **Third-party:** N/A
- **Note:** this sits on the VietMap path the previous plan called its flakiest work
  (CO-021). It was missed entirely in v1.

---

### UT-006 - `normalizeTaxBusinessInfo`

- **Layer:** Unit
- **Scenario:** Feed `services.ts:30-48` a bare object, a `{data: {...}}` envelope, `null`,
  a non-object, and objects missing each of `id`/`name`/`address`.
- **What it proves:** defensive parsing of a third-party response returns `null` rather than
  a half-populated object when VietQR changes or breaks its envelope.
- **Does NOT prove:** that the lookup panel renders the result - CO-003.
- **Dependencies:** vitest.
- **Test data:** literals.
- **Status:** Deferred · **Priority:** P2 · **Creates order:** No · **Third-party:** N/A

---

### UT-007 - test-harness helpers

- **Layer:** Unit
- **Scenario:** `msFromEnv` (`e2e/utils/payment.ts:12`) with unset, `300_000`, `abc`, `0`,
  `-1`; `parseVnd` (`e2e/utils/money.ts`) with `1.000 ₫`, `-3.000 ₫`, `0 ₫`, and junk.
- **What it proves:** the harness's own guards. `msFromEnv`'s docblock already explains why:
  a `NaN` timeout reads as "no timeout at all" and turns a failing wait into a **hung run**.
  That failure mode is expensive and silent.
- **Does NOT prove:** anything about the product.
- **Dependencies:** vitest.
- **Test data:** literals.
- **Status:** Deferred · **Priority:** P2 · **Creates order:** No · **Third-party:** N/A
- **Note:** these are test infrastructure, not application logic. Included because a bug here
  corrupts every other result. **Not** to be confused with `lib/currency.ts`, which is a
  six-line `Intl.NumberFormat` wrapper and should **not** be tested - testing it tests ICU.

---

# 5. INTEGRATION / API LAYER - `API-xxx`, `CO-016`, `CO-026`

**Question: does our application correctly integrate its internal and external contracts?**

HTTP-level. No browser journey, or a browser used only to capture a real payload.

---

### API-001 - fixture product canary

- **Layer:** Integration / API
- **Scenario:** for **each** fixture in `e2e/fixtures/products.ts` (`PRIMARY_PRODUCT` and
  `SECONDARY_PRODUCT`), `GET` the product by id and assert 200, the name matches, at least
  one unit is purchasable, **and the product is discoverable through `ProductPage.search`**.
  **Not a checkout flow** - no cart, no browser journey.
- **What it proves:** the shared fixtures still exist, are buyable, and can be _found_.

> **Reachability guard added 2026-08-20 (Step 9.1), after CO-006 hit the gap.**
>
> `/products` renders one section per category returned by
> `getCachedCategories({ page: [Products] })`, and each section queries only the ids
> `getSectionBaseCategoryIds` resolves - its filterable, currently time-active children, or
> the section itself. `ProductPage.search` types into the **first** section's searchbox, and
> each section namespaces its filters by category id (`buildSectionUrlKeys`), so that search
> only ever looks inside that one section.
>
> The canary therefore asserts the product shares at least one category with
> `getSectionBaseCategoryIds(sections[0])`. That function is **imported from the app**, not
> reimplemented, so the guard cannot drift from what the page actually queries.
>
> `categories.length > 0` would have caught the specific product that broke CO-006 (it had
> none) but is not the real rule: a product can carry categories that no section draws from
> and still be invisible. The narrower assertion costs the same and catches both.
>
> Verified as a live detector: pointing `SECONDARY_PRODUCT` back at the category-less
> product fails the canary in 650 ms with a message naming the product's categories and the
> section's ids. Restored byte-identically.

- **Does NOT prove:** anything about checkout. Nor that the product renders on _page 1_ of
  its section - a fixture could in principle be pushed past the section's page size. Not
  currently reachable through the search helper, which filters server-side.
- **Why it earns its place:** it fails _differently_. Without it, a discontinued or renamed
  fixture product turns **ten specs red simultaneously** at `products.open()`, with timeouts
  that read as "checkout is broken". With it, one 2-second test named for the fixture goes
  red and the diagnosis is immediate. That clearer failure is the entire justification - if
  it ever grows into a second checkout flow, delete it.
- **Dependencies:** `e2e/fixtures/products.ts`; `getProductsPageSections` in
  `e2e/api/products.api.ts`.
- **Test data:** `PRIMARY_PRODUCT`, `SECONDARY_PRODUCT` - both asserted, both passing.
- **Status:** ✅ **Implemented** - `e2e/create-order/api-001-fixture-product-canary.spec.ts`
  (~0.5s) · **Priority:** P0 · **Creates order:** No · **Third-party:** Real
  (backend + Nhanh.vn catalogue - that is the point)

---

### API-002 - interception smoke test

- **Layer:** Integration / API
- **Scenario:** The pilot for `page.route`. Intercept `/api/geocode/autocomplete` with a
  fixed suggestion list and assert the checkout address field renders exactly those entries.
- **What it proves:** that route interception works against this app's request shapes -
  before CO-007, CO-012, CO-020/CO-021 and CO-008 all depend on it.
- **Does NOT prove:** any customer-facing rule. This is scaffolding, and may be deleted once
  the technique is established in three real specs.
- **Dependencies:** none.
- **Test data:** a captured autocomplete response.
- **Status:** ✅ **Implemented** - `e2e/create-order/api-002-route-interception.spec.ts` · **Priority:** P1 ·
  **Creates order:** No · **Third-party:** Intercepted (VietMap via BFF)

---

### CO-016+ - server-side create-order hardening _(keeps a `CO-` id; layer = API)_

- **Layer:** Integration / API - **the authoritative server-pricing protection**
- **Scenario:** Capture one real payload from a UI checkout, then mutate one field at a time
  and re-POST. Extends the existing spec; no new id.
- **What it proves:**

  | Mutation                                         | Expectation                                            |
  | ------------------------------------------------ | ------------------------------------------------------ |
  | `items: []`                                      | rejected                                               |
  | `items: [{itemId: 'does-not-exist', number: 1}]` | rejected, **or** accepted-and-priced-0 - record actual |
  | `number: 0` / `number: -1`                       | rejected                                               |
  | `latitude`/`longitude` dropped or `0`            | record actual                                          |
  | `phone`/`address` empty                          | record actual                                          |
  | `tagIds: [1, 2]`                                 | record actual (already pinned as a KNOWN GAP)          |
  | **`shippingFee: 0`** ✅ **DONE**                 | order created AND stored fee == the server's own quote |
  | **`shippingFee: 999_999_999`** ✅ **DONE**       | order created AND stored fee == the server's own quote |
  | unauthenticated POST                             | 401/403                                                |

- **The `shippingFee` rows are the single highest-value assertion in this plan.**
  `CreateOrderRequest` and the `EstimateShippingFeeRequest` it extends declare **no
  `ShippingFee` property at all**, so the client's number is not bindable - it is dropped at
  model binding, not compared and rejected. That makes these rows a _contract guard_: they
  prove the field is still unbindable, and they go red the day someone adds `ShippingFee` to
  that DTO for convenience.

> **Criterion corrected during implementation (2026-08-20).** The row above previously read
> `getOrder().shippingFee > 0` and specified a second captured payload. Three changes, all
> verified against `/Users/dahn/Workspace/dotnet/hoatheomua-be`:
>
> 1. **`> 0` is too weak.** It passes even if the server stores some _other_ wrong positive
>    number. The implemented assertion compares against the fee the server computed for the
>    **untampered** payload, so the control and the mutation differ in exactly one field.
> 2. **One mutation does not prove independence.** `shippingFee: 0` rules out the server
>    trusting the client and rules out `min(client, computed)` - but it _passes_ under
>    `max(client, computed)`, which would still let a tampered payload overcharge. The
>    inflated mutation closes that gap for one extra order.
> 3. **No second capture is needed.** Rather than capturing a second payload or splitting the
>    row into its own spec, the whole case moved to `PAID_SHIP_ADDRESS`. Nothing else in
>    CO-016 depends on the address, and the free-ship address made the row vacuous - the
>    server legitimately computes 0 there, so a tampered 0 is indistinguishable from an
>    honest one.
>
> Verified in practice: control fee **97 000**; both tampered orders stored 97 000.

- **Does NOT prove:** that the UI shows the customer the same number (CO-001's
  `expectServerTotalsMatchUi`), or that the fee is correct - only that it is _server-owned_.
- **Deliberately NOT reducible to a unit test:** there is no client-side function to test.
  The rule lives entirely in the server's DTO shape.
- **Dependencies:** none. Existing harness and `expectRejected` helper.
- **Test data:** one captured payload from a **`PAID_SHIP_ADDRESS`** checkout. A second
  capture is not needed - see the corrected criterion above.
- **Status:** Implemented (4 of 9 rows: both `orderTime` bounds, `tagIds`, both `shippingFee`
  mutations). Remaining: `items: []`, unknown `itemId`, `number: 0`/`-1`, zero coordinates,
  empty `phone`/`address`, unauthenticated POST · **Priority:** P0 · **Creates order:** Yes,
  five per run (cancel bogus ones inline, not via teardown) · **Third-party:** Real
- **Careful:** field-level detail is Development-only (README point 8) - assert status +
  `messageCode` only.

---

### CO-026 - cross-account cancel _(keeps a `CO-` id; layer = API)_

- **Layer:** Integration / API - security
- **Scenario:** Account one creates a pending order; account two calls
  `PATCH /api/v1/orders/{id}/cancel` from its own request context. Also probe
  `GET /api/v1/orders/{id}` cross-account.
- **What it proves:** whether `CancelOrder`'s missing owner check (README open risk #2) is
  exploitable. Assert the **desired** behaviour (403/404, order still Pending); if it passes
  because the cancel succeeded, the vulnerability is reproduced.
- **Does NOT prove:** anything about the UI. No browser needed beyond sign-in.
- **Dependencies:** a second registered, email-verified account with no relationship to the
  first. `E2E_USER2_EMAIL` / `E2E_USER2_PASSWORD` exist in `.env` but are **empty**.
- **Test data:** second account.
- **Status:** **Blocked** on credentials · **Priority:** P1 · **Creates order:** Yes (one) ·
  **Third-party:** Real
- **Must be inert until unblocked:** `orderTest.skip(!TEST_USER_2.email, '…')`, so an
  unconfigured checkout is not a red suite.
- **Judgement call, recorded:** do not write the assertion to match a broken backend before
  confirming it is broken. Decide on seeing the result - fail loudly and file it, or invert
  to a pinned `KNOWN GAP` the way CO-016 does for `tagIds`.

---

# 6. E2E / CUSTOMER-JOURNEY LAYER - `CO-xxx`

**Question: can a real customer complete the critical purchase journey?**

> The subsections below group cases by **how the v2 plan treated them** - untouched, reduced,
> kept, new, blocked - not by id order. `README.md` is the index sorted by id and by stage of
> the customer journey; use that to look a case up.

## 6.1 Implemented - no change

| ID         | Scenario                                                | Creates order         | Third-party                     | Note                                                                                                                                                                                   |
| ---------- | ------------------------------------------------------- | --------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CO-001** | Saved address, immediate, no invoice, free ship, BaoKim | Yes                   | **Real** (Ahamove)              | The reference journey. `expectServerTotalsMatchUi` here is the suite's crown jewel - client and server agree on all four money fields. **Never stub the estimate route in this spec.** |
| **CO-002** | Manual address, immediate, no invoice, free ship        | Yes                   | Real                            | Also proves checkout never persists the typed address (request counter).                                                                                                               |
| **CO-003** | Saved address, scheduled, **Business VAT**, paid ship   | Yes                   | **Real** (Ahamove + **VietQR**) | The only spec where the tax-lookup panel is the subject - keep VietQR real _here and nowhere else_.                                                                                    |
| **CO-004** | Manual address, scheduled, **Personal VAT**, paid ship  | Yes                   | Real                            | Proves `vatFee: 0` on a Personal invoice server-side (README point 2).                                                                                                                 |
| **CO-005** | Slot only, no date                                      | Yes                   | Real                            | Third of four delivery combinations.                                                                                                                                                   |
| **CO-013** | Gateway/method coupling                                 | **No**                | Real (but unused)               | The only Tier-0 spec in the folder - pure rendering rule, creates nothing.                                                                                                             |
| **CO-014** | Abandoned payment                                       | Yes                   | **Real** (opens BaoKim)         | Correctly written: opens the gateway, tolerates failure, asserts our state is untouched. Do not change.                                                                                |
| **CO-015** | Pending → Cancelled                                     | Yes (cancels its own) | Real                            | Only status transition reachable without a payment.                                                                                                                                    |

**Recommended (P2, optional) change to CO-003 only:** it is the sole spec making a live
cross-origin call to `api.vietqr.io`. That is correct - the panel is its subject - but the
call is also the least controllable thing in the spec. If it proves flaky, split the panel
assertions into their own small spec with the lookup real, and stub it in the rest of CO-003.
Do not retrofit interception into any currently-green spec without a flake to justify it.

---

## 6.2 Reduced - unit coverage takes the combinatorial half

> These are **reduced, not deleted.** The v1 note suggesting CO-010/CO-011/CO-019 could be
> deleted once unit coverage existed is **retracted**. Each retains the part only a browser
> and a server can prove.

### CO-010 - Business invoice validation _(REDUCED)_

- **Layer:** E2E
- **Scenario:** Saved address → immediate → step 2 → invoice on → Business tab. One
  representative empty-field submit, one recovery submit.
- **What it proves - the three things UT-003 cannot reach:**
  1. the inline error **renders in the DOM** under `#taxCode` (a schema issue with a correct
     `path` still fails the customer if `FieldError` never mounts);
  2. **zero `POST /api/v1/orders`** fires - armed with a page-level request counter before
     the click;
  3. **recovery**: after fixing all three fields the order is created and the server accepts
     it. This proves the gate re-opens rather than sticking closed.
- **Does NOT prove:** the full required-field matrix - that moved to **UT-003**. Nor the
  message text for every field.
- **Reduction:** v1 specified three sub-cases (all-empty, invalid-formats, recovery) with an
  enumerated assertion per field. Now: **one** all-empty submit asserting the toast + the
  `#taxCode` inline error + zero POST, then recovery. The invalid-email/invalid-phone
  sub-case moves wholesale to UT-003.
- **Dependencies:** POM additions `fieldError(inputId)` and the zero-POST counter - reused by
  CO-011, CO-012, CO-019. Rule 8 (swallowed first click) applies.
- **Test data:** `PRIMARY_PRODUCT`, `FREE_SHIP_ADDRESS`, valid business tax code (share
  CO-003's).
- **Status:** ✅ **Implemented (reduced)** - `e2e/create-order/co-010-invalid-business-vat.spec.ts` · **Priority:** P1 ·
  **Creates order:** Yes (recovery leg only) · **Third-party:** Ahamove **real**, **VietQR
  real** (§1 recommends stubbing it here; not done yet)
- **Careful:** `placeOrder()` waits for the `/orders/{id}` URL, so it cannot be used for the
  blocked submit. Click the raw button there; use `placeOrder()` only for recovery.

---

### CO-011 - Personal invoice validation _(REDUCED)_

- **Layer:** E2E
- **Scenario:** Same shape with the Personal tab - which is where `enableInvoice()` already
  lands. **Assert the tab is active rather than clicking it**, so a changed default surfaces
  here.
- **What it proves:** the same three browser-only things as CO-010, plus one server contract
  the unit layer cannot touch: the recovery order carries `invoiceType: 'Personal'`,
  `taxCode: null`, and the server returns **`vatFee: 0`** - because the server keys VAT off
  the tax code, not the toggle (README point 2).
- **Does NOT prove:** the five-field required matrix - that is **UT-003's per-field loop**,
  which is precisely the case v1 argued needed a loop "because a dropped `requireField` call
  is exactly the regression this catches". That argument is correct and it is a unit-test
  argument: five browser journeys to catch it is ~25 minutes; five unit cases is ~10ms.
- **Reduction:** v1 specified four sub-cases including a five-iteration per-field loop. Now:
  **the recovery leg plus one all-empty submit.** The loop moves to UT-003.
- **Dependencies:** CO-010's POM helpers.
- **Test data:** as CO-010.
- **Status:** ✅ **Implemented (reduced)** - `e2e/create-order/co-011-invalid-personal-vat.spec.ts` ·
  **Priority:** P1 · **Creates order:** Yes (recovery leg) · **Third-party:** Ahamove real

---

## 6.3 Kept at full size - E2E-only wiring

### CO-019 - step-1 validation _(KEPT - NOT a duplicate of CO-010/CO-011)_

- **Layer:** E2E
- **Scenario:** Switch to manual entry, then: everything empty; invalid `phoneReceiver`;
  `remarks` over 500 chars; recovery. Stop at step 2 - never place an order.
- **What it proves - and why this is not the third clone of the same spec:** step 1 and step
  2 validate through **two different mechanisms**.
  - Step 2 submit goes through `methods.handleSubmit` → `zodResolver(createCheckoutSchema)`
    (`use-estimate-order.ts:36`) - standard react-hook-form.
  - Step 1 → 2 does a **manual** `createEstimateSchema(t).safeParse(methods.getValues())`
    and then hand-maps every issue with
    `issue.path.join('.') → methods.setError(path, …)` (`use-checkout-flow.ts:62-70`).

  That hand-rolled mapping is bespoke code with no test anywhere. A schema unit test cannot
  reach it - the schema can be perfectly correct while the mapping writes the error to the
  wrong field name, or to none. CO-019 is the **only** coverage of it.

- **Also proves:** no `POST /api/v1/ahamove/estimate` fires on a failed gate.
- **Does NOT prove:** the schema rules themselves - those are **UT-004**.
- **Reduction:** none. **Priority raised from #10 to P1** - v1 ranked it last on the grounds
  that it shares helpers with CO-010/CO-011, which the audit shows is false.
- **Dependencies:** CO-010's `fieldError()` helper and zero-request counter.
- **Test data:** `PRIMARY_PRODUCT`; manual address entry.
- **Status:** Deferred · **Priority:** P1 · **Creates order:** **No** · **Third-party:**
  **Geocode intercepted** (a deterministic suggestion makes the recovery leg reliable)
- **Careful:** `addressLine` is `getByLabel('Địa chỉ', { exact: true })`, which also matches
  `Địa chỉ nhận hoá đơn` once invoicing is on. Staying on step 1 keeps it unambiguous.

---

### CO-009 - invoice tab switch clears the other branch

- **Layer:** E2E (component-test territory, but no RTL layer exists - see note)
- **Scenario:** Step 2 → invoice on (lands Personal) → fill all five → switch to Business →
  fill `taxCode` → switch back to Personal → refill → submit.
- **What it proves:**
  1. `receiptEmail` / `receiptPhoneNumber` **survive** a tab switch - confirmed intentional
     on 2026-08-19: both types require them (`validations.ts:89-90`, `:95-96`) and both send
     them, so carrying them across is correct data, not a leak;
  2. `identityNumber` / `receiptFullName` / `receiptAddress` are **cleared** leaving Personal,
     and do not resurrect on return;
  3. **the money assertion**: after switching back to Personal the sidebar `VAT 8%` row is
     **gone**, because `taxCode` was cleared;
  4. the submitted payload carries `taxCode: null`, `invoiceType: 'Personal'`, and the server
     returns `vatFee: 0`.
- **Does NOT prove:** the payload filtering in isolation - that is **UT-001**, which must
  land first (see implementation order) so CO-009 can be written narrow.
- **⚠ Why a sidebar-only assertion is insufficient:** the FIX has three layers, and layers 2
  (`payloads.ts` filters by `invoiceType`) and 3 (`checkout-client.tsx:120` requires
  `invoiceType === Business` for `hasTaxCode`) mean a sidebar assertion **passes even if the
  form-clearing in layer 1 regresses**. CO-009 must assert the cleared **field values** and
  the captured POST body, not just the sidebar.
- **Dependencies:** UT-001 (so payload assertions are not duplicated here).
- **Test data:** `PRIMARY_PRODUCT`, `FREE_SHIP_ADDRESS`, CO-003's valid business tax code.
- **Status:** ✅ **Implemented** - `e2e/create-order/co-009-invoice-tab-switch.spec.ts` ·
  **Priority:** **P0 - regression cover for a shipped live pricing fix** ·
  **Creates order:** Yes · **Third-party:** Ahamove real, **VietQR real** (§1 recommends
  stubbing it here; not done yet)
- **Done when:** step 5's VAT-row assertion **fails against the pre-fix code** - verify by
  stashing the fix once. An assertion that passes both ways guards nothing.
- **Layer note:** `clearInvoiceFields` (`invoice-fields.tsx:47-50`) is DOM + react-hook-form
  wiring - neither pure nor server-dependent. In a repo with React Testing Library this would
  be a component test. There is none, and **CO-009 must not wait for one to be built.**

---

## 6.4 New E2E items

### CO-008 - free-shipping config unavailable _(NEW)_

- **Layer:** E2E
- **Scenario:** Intercept `GET /api/v1/configs/public?groupName=ahamove` and return `[]`,
  then a malformed `value.value`. Reach step 2 with `FREE_SHIP_ADDRESS` - an address that
  _should_ ship free - and observe what the customer is shown and charged.
- **What it proves:** the failure mode hidden at `checkout-client.tsx:60,100`:

  ```ts
  const freeShipKm = Number(configs.find((c) => c.key === 'ahamove.free_ship')?.value.value)
  const isFreeShip = freeShipKm >= 0 && distanceKm >= 0 && distanceKm <= freeShipKm
  ```

  With the config missing, `Number(undefined)` is `NaN`, `NaN >= 0` is `false`, `isFreeShip`
  is `false` - and **every customer inside the free-ship radius is silently charged
  shipping.** It fails closed _against the customer_, with no error and no toast.

- **Does NOT prove:** what the _server_ does with the same missing config. Worth recording
  the observed server `shippingFee` alongside, since the two sides read the same config and
  may diverge under failure.
- **Decision taken (2026-08-20): pinned as a `KNOWN GAP`.** Observed behaviour matches the
  prediction exactly - an in-radius address is charged the full Ahamove fee, the
  `Giảm giá (bán kính miễn phí ship)` row does not render at all, the total includes shipping,
  and no toast or error appears. Both paths to `NaN` are covered as separate variants:
  `find()` returning undefined (empty group) and `Number('…')` on a non-numeric value.
  Pinned rather than failed loudly because a fallback is a production decision with its own
  blast radius; the case documents the question instead of pre-empting it.
- **Verified to be a live detector, not a vacuous one.** Feeding the _stub_ the real
  threshold (`5`) makes the discount row render (`Received: 1`) and the spec fail at that
  assertion. So the config value alone flips the waiver and the spec observes it.
- **Dependencies:** API-002 (first `page.route` usage) - **done**.
- **Test data:** `PRIMARY_PRODUCT`, `FREE_SHIP_ADDRESS`.
- **Status:** ✅ **Implemented** - `e2e/create-order/co-008-freeship-config-unavailable.spec.ts`
  (2 variants) · **Priority:** P1 · **Creates order:** No (stops at the sidebar) ·
  **Third-party:** **Config intercepted** (URL predicate), Ahamove real
- **Why E2E and not unit:** the expression is inline in a 240-line component, the threshold
  is server-owned data, and the distance is Ahamove's. Extracting it into a function purely
  to unit-test it would be test-driven damage. See CO-018.

---

### CO-017 - date only, no slot: the fourth delivery combination

- **Layer:** E2E
- **Scenario:** Clone CO-005 with the premise inverted - pick a date (`today + 2`), never
  open the slot select.
- **What it proves:** `orderTime > 0` + `tagIds: []` is treated as **scheduled**: the sidebar
  shows `Ngày giao hàng` and **no** `Thời gian giao` row; the order detail reads the date and
  **not** `Ngay sau khi thanh toán`; and in Tier B the paid order gets **no Ahamove
  dispatch** - the backend books a ride only when `orderTime == 0 && tagIds == []`
  (README point 6), so `orderTime > 0` alone suppresses it.
- **Does NOT prove:** anything about slots (CO-005).
- **Dependencies:** none.
- **Test data:** `FREE_SHIP_ADDRESS`, `PRIMARY_PRODUCT`, `date = today + 2` (far enough from
  the today..+7 edges that a run straddling midnight cannot drift out).
- **Status:** Deferred · **Priority:** P1 · **Creates order:** Yes · **Third-party:** Real
- **Tier B:** do **not** call `waitForAhamoveDispatch` - it polls _for_ a booking and would
  fail by design. Copy CO-003's negative dispatch assertions, and allow a few seconds after
  `Paid` before asserting absence.
- **Done when:** Tier A passes **and** the Tier B block has been run once by hand - the
  no-dispatch assertion is the reason this spec exists and only executes with a real payment.

---

### CO-007 - buy-now entry and checkout intent guards

- **Layer:** E2E
- **Scenario:** Six sub-cases sharing one page. **§3 is the one that matters.**
  1. Empty intent → `/checkout` redirects to `/cart` (`use-checkout-flow.ts:36-39`).
  2. Buy-now from product detail with quantity 2 → `/checkout` with the right line.
  3. **Buy-now must not touch the cart.** Add product A to the cart, buy-now product B, place
     the order, return to `/cart` - **A is still there.** `use-checkout-flow.ts:92-94` removes
     lines only when `source === 'cart'`; a regression here **silently deletes a customer's
     cart**.
  4. Cancel booking → `/cart` for cart-sourced, `/products` for buy-now; returning to
     `/checkout` bounces because the intent was cleared.
  5. Post-order revisit → `/cart` (`clearIntent()` ran; must not resurrect a paid basket).
  6. Phone-less account gate → intercept `GET /api/taskcoper/v1/users/*`, blank
     `phoneNumber`, assert `contactMissing` copy + `Chỉnh sửa thông tin` CTA and no address
     picker (`checkout-client.tsx:177-184`).
- **Does NOT prove:** cart pricing (CO-006).
- **Dependencies:** new `ProductPage.buyNow()` and a quantity-stepper helper. §6 needs
  API-002.
- **Test data:** `PRIMARY_PRODUCT` **and** `SECONDARY_PRODUCT` (§3 needs two distinct lines).
- **Status:** ✅ **§3 implemented** - `e2e/create-order/co-007-checkout-entry-guards.spec.ts`;
  §1/§2/§4/§5/§6 remain **Not started** (P2) · **Priority:** P1 (§3) ·
  **Creates order:** Yes (one, in §3) · **Third-party:** Ahamove real
- **Careful:** §6 must use an intercept. **Never edit the real account's profile** - it is
  shared with every spec running in parallel.

---

### CO-012 - step navigation and failure handling

- **Layer:** E2E
- **Scenario:** Back-navigation, address re-quote, and both failure paths. **§4 is the one
  that matters.**
  1. `Quay lại` preserves note, address and delivery options; going forward re-quotes
     (a second estimate call) - `handleGoToPayment` re-quotes unconditionally, and a stale
     quote after an address change is how a customer is charged the wrong shipping.
  2. Changing the address re-quotes with the **new** coordinates.
  3. **Estimate failure** - intercept `POST /api/v1/ahamove/estimate` → 500; assert the
     `Không thể ước tính đơn hàng.` toast, that the page stays on step 1, and no order can be
     created.
  4. **Create failure** - intercept `POST /api/v1/orders` → 500; assert the toast, the URL
     stays `/checkout`, **`/cart` still holds the line**, and the intent survives a reload.
     `items.forEach(removeCartItem)` and `clearIntent()` both run _after_ a successful
     `createOrder` (`use-checkout-flow.ts:88-95`), so a failure must leave both alone.
  5. Retry after dropping the intercept succeeds, and **exactly one** order exists.
- **Does NOT prove:** that Ahamove itself ever fails.
- **⚠ Interception note:** §3 is the **only** legitimate stub of
  `/api/v1/ahamove/estimate` in this plan, and it works precisely because a 500 is a
  _transport-level_ outcome - it does not require the stub to invent a fee. Never stub this
  route with a fabricated success body.
- **Dependencies:** `submitExpectingFailure()` on the POM (CO-010 builds the counter half);
  API-002. Rule 8 applies acutely - a swallowed first click looks identical to a suppressed
  request.
- **Test data:** `PRIMARY_PRODUCT`, `FREE_SHIP_ADDRESS`, second saved address for §2.
- **Status:** ✅ **§4 implemented** - `e2e/create-order/co-012-step-navigation-failures.spec.ts`;
  §1/§2/§3/§5 remain **Not started** (P2) · **Priority:** P1 (§4) ·
  **Creates order:** No (the only submit is the intercepted one) ·
  **Third-party:** `POST /api/v1/orders` intercepted with a 500; Ahamove estimate real

---

### CO-006 - multi-line order, partial cart selection, cart cleanup

- **Layer:** E2E
- **Scenario:** Three cart lines (two variants of `PRIMARY_PRODUCT` + `SECONDARY_PRODUCT`) at
  mixed quantities; select **two**; check out; verify cleanup.
- **What it proves:**
  - the sidebar lists exactly the two selected lines with the right quantities and `Tạm tính`;
  - the payload's `items` carry the products' **`nhanhProductId`, not the local `productId`**
    (`payloads.ts:32`) - the field the backend prices from;
  - server read-back: `details.length === 2`, per-line `number` matches, `productFee` equals
    `Σ(price × number)`, and `expectServerTotalsMatchUi` holds across multiple lines;
  - **cart cleanup**: the two ordered lines are gone, the third remains at its quantity.
- **Does NOT prove:** the fallback logic in isolation - **UT-002**. But UT-002 cannot detect
  the fallback silently sending an id the catalogue rejects; only this spec prices real lines
  server-side. **This is the clearest example in the plan of a unit test and an E2E test
  covering genuinely different contracts.**
- **Dependencies:** `e2e/fixtures/products.ts` with a second product; a variant-by-index
  helper on `ProductPage` - both **done**.
- **Test data:** three lines, quantities 2 / 1 / 1.
- **Status:** ✅ **Implemented** - `e2e/create-order/co-006-multiline-partial-cart.spec.ts` ·
  **Priority:** P0 · **Creates order:** Yes (one) · **Third-party:** Real

> **Implementation notes (2026-08-20).**
>
> **The unticked line is a sibling variant of a purchased product, not an unrelated item.**
> That is what makes the cleanup assertion a real detector: an implementation that cleared
> the whole cart, or that removed by _product_ rather than by _line_, would pass a
> "cart is empty" check and fail this one. Proven by mutation - replacing
> `items.forEach(removeCartItem)` with `clearCart()` fails the spec with
> _"the unselected sibling variant was removed"_; source restored byte-identically.
>
> **`SECONDARY_PRODUCT` had to be replaced.** The Step-2 pick
> (`Giỏ mây đan mắt cáo Sunny`) has **zero categories**, and `/products` renders one section
> per category with its own `` `${categoryId}_q` `` searchbox - so it never rendered and was
> unreachable through `ProductPage.search`. It passed API-001 because that canary only calls
> the API. Now `TANA bó kiểu_2026`, which shares "Hoa bó" with `PRIMARY_PRODUCT`, has no
> variants (so the order covers both the child-id and parent-id paths), and was verified to
> resolve to exactly one link through the real search helper. **API-001 should be extended
> to assert the fixture products are UI-reachable - it currently cannot catch this class of
> failure.**
>
> **Deferred, deliberately:** the "one step added to CO-001" below. CO-006 now covers cart
> cleanup far more thoroughly, and touching CO-001 was out of Step 9's scope.

- **Deferred - one step for CO-001:** after the order, `cart.goto()` and assert the ordered
  line is gone - the single-line version of the same rule.
- **Careful:** assert by line label on the cart page only. **Never count the cart globally.**

---

### CO-020 / CO-021 - address editing _(SPLIT)_

The largest untested surface in checkout, and the flakiest work in the plan. Split so the
deterministic half can land without the map half blocking it.

#### CO-020 - form-level address editing

- **Layer:** E2E
- **Scenario:** (1) manual → saved restores the previous selection
  (`checkout-fields.tsx:86-89`); (2) zero saved addresses forces manual and hides the toggle
  - via intercept, **never by deleting the shared account's addresses**; (3) switching between
    two saved addresses re-applies `phoneReceiver` and the address line; (4) changing city
    resets ward and clears `wardCode` (`checkout-fields.tsx:225-228`) - a stale ward from
    another city is a mis-delivery.
- **Does NOT prove:** anything about the map or reverse geocoding.
- **Dependencies:** `savedAddress` fixture extended with an opt-in second row (so teardown
  stays symmetrical); API-002.
- **Test data:** two saved addresses.
- **Status:** Deferred · **Priority:** P2 · **Creates order:** No · **Third-party:**
  **Geocode intercepted**

#### CO-021 - map pin and reverse geocode

- **Layer:** E2E - integration subject
- **Scenario:** (1) clearing the autocomplete zeroes `latitude`/`longitude`/`mapId`
  (`checkout-fields.tsx:316-321`) - **pin what actually happens, see the KNOWN GAP below**;
  (2) dragging the pin writes back `addressLine` + ward + city and the **moved** coordinate
  reaches the estimate payload; (3) a pin beyond the anchor radius shows
  `Điểm này quá xa địa chỉ của bạn…` and leaves the coordinate unchanged.
- **Does NOT prove:** form-level behaviour (CO-020).

> **KNOWN GAP - §1's original premise is false. Confirmed by UT-004 (2026-08-20).**
>
> This section previously read "continuing is blocked or produces no valid quote". It is not
> blocked. `createEstimateSchema` types `latitude`/`longitude` as bare `z.number()`
> (`validations.ts:27-28`), and `defaultValues` ships them as `0`
> (`use-estimate-order.ts:18-19`). **`latitude: 0, longitude: 0` passes step-1 validation**,
> so a form whose address never resolved to a coordinate leaves step 1 and quotes Ahamove
> against 0,0.
>
> `features/orders/validations.test.ts` pins this as
> `UT-004 → 'KNOWN GAP: a zero coordinate passes step 1'`. It is a pinned record of current
> behaviour, **not** an endorsement of it.
>
> **Consequence for CO-021:** write it as a `KNOWN GAP` assertion - clear the
> autocomplete, continue, and record that the estimate fires with a zero coordinate - not as
> a green "blocked" tick. Do not write an assertion that expects blocking; it will fail
> against the current code and read as a broken test rather than a product gap.
>
> **Not fixed here, deliberately.** Tightening the schema to reject a zero coordinate is a
> production change with its own blast radius (every path that seeds `defaultValues`, plus
> whatever legitimately submits 0 today). It belongs in its own item with its own decision,
> not in a test-coverage step. Raise it as a product question: _should step 1 refuse to quote
> an unresolved address?_

- **Dependencies:** UT-004 (**answered** - §1 is a pinned gap, not a pass), CO-020.
- **Test data:** a resolved address plus a known offset; read `address-map-picker.tsx` for
  the actual radius before choosing one.
- **Status:** Deferred · **Priority:** P2 · **Creates order:** No · **Third-party:**
  **Geocode REAL - this is the integration subject**
- **Escape hatch, kept from v1:** assert on resulting form state, never on the map's
  internals. If the drag will not settle, drive the picker through its "my location"
  affordance, or **park CO-021 as a documented sub-gap rather than leaving a flaky spec in
  the suite.**

---

## 6.5 Blocked

### CO-018 - free-shipping boundary _(BLOCKED - and a unit test cannot unblock it)_

- **Layer:** E2E · **Status:** **Blocked** on deterministic boundary data · **Priority:** P1
- **Scenario:** an address at _exactly_ `distanceKm === freeShipKm`, where equality must be
  free (`<=` on both sides).
- **Why a unit test cannot unblock this - traced:**

  ```ts
  const freeShipKm = Number(ahamoveConfigs.find((c) => c.key === 'ahamove.free_ship')?.value.value)
  const distanceKm = selectedService?.data?.distance ?? 0
  const isFreeShip = freeShipKm >= 0 && distanceKm >= 0 && distanceKm <= freeShipKm
  ```

  1. **It is not a function.** It is an inline expression at `checkout-client.tsx:99-102`.
     Extracting it solely to test it is test-driven damage.
  2. **The threshold is server-owned** - `ahamove.free_ship` from
     `/api/v1/configs/public`, not a constant.
  3. **The distance is Ahamove-owned** - `selectedService.data.distance`.
  4. **The authoritative fee is recomputed server-side** - `Distance <= freeShipping`
     (README point 3). The client's value is display plus a payload field the server's DTO
     does not even bind (README point 1).

  A unit test would therefore assert that `a <= b` behaves like `<=`, using data neither
  side owns, for a value the server discards. It would pass forever and protect nothing.
  **The real protection is CO-016+'s `shippingFee` row.**

- **What would actually unblock it:** a test environment where `ahamove.free_ship` can be
  pinned, plus a fixture address whose Ahamove distance lands exactly on it. Both are
  environment work, not test work.
- **Doc status:** rewritten 2026-08-19 against `<=` (commit `5e136da`). The stale guards in
  `co-003`/`co-004` were corrected to `toBeGreaterThan(freeShipKm)` at the same time.
- **~~⚠ Inconsistency to resolve:~~ RESOLVED 2026-08-20.** The README used to list this case as
  _Review_ while this plan concluded _Blocked_. The README now says **Blocked**, matching here.

### ~~Outside free-ship radius~~ - CLOSED 2026-08-20 _(held `CO-006` in the original numbering)_

- **Status:** **Merged into CO-003 / CO-004 and closed.** It holds no ID in the final numbering
  and has no case doc.
- **The decision v1 left drifting, now taken.** The case had a doc and a README row but appeared
  in no work-item table. Its substance - an address beyond the radius is charged the full
  Ahamove fee, with no discount row, and that fee survives quote → sidebar → payload → created
  order - is asserted in full by CO-003 and CO-004, both of which run on `PAID_SHIP_ADDRESS`.
  A separate case would have duplicated them without adding a distinct contract.
- The number it held is **not** left as a hole - every later renumbering reassigned it. See the
  consolidated rename table in `README.md`.

### CO-022 … CO-025 - SePay webhook

- **Layer:** Integration · **Status:** **Blocked** - SePay webhook broken and absent from
  this repository · **Priority:** P0 if ever unblocked · **Keep the docs.**
- Out of scope throughout. CO-013 retains the SePay gateway/method coupling because that is
  pure client logic and still earns its keep.

---

## 6.6 Dropped by decision

- **Shipping-service selection** (non-default service, list ordering, `shippingEmpty`).
  Keeping the current "cheapest is preselected" assertion as the whole of it.
- **`checkout/checkout.spec.ts`** - ✅ **DELETED 2026-08-20.** A legacy smoke test CO-001
  covered strictly better, carrying its own Tier B block. Two further reasons decided it:
  it used `addressTest` rather than `orderTest`, so **it registered no `createdOrders` and
  leaked one real Pending order on every run**, and it duplicated the fixture product and
  order-note constants inline.

  Its one assertion nothing else made - that the order detail renders the ordered quantity
  as `x2` - was **moved verbatim into CO-006**, which already orders a line at quantity 2 and
  lands on the same page. Nothing else in it was unique.

---

# 7. CI strategy

## Verified findings

- **`.github/workflows/playwright.yml` cannot currently pass.** It has **no `env:` block and
  no secrets**. `playwright.config.ts:4` calls `process.loadEnvFile()` in a `try/catch`;
  `.env` is gitignored, so in CI it throws, is swallowed, and `baseURL` is `undefined`.
  `TEST_USER.email` falls back to `''` (`fixtures/auth.ts:9`), the `setup` project's sign-in
  fails, and all three browser projects (`dependencies: ['setup']`) never run.
- **`webServer` is genuinely required.** `E2E_BASE_URL` is `http://localhost:3000`, the
  `webServer` block is commented out, and the workflow never builds or starts the app.
- **The backend is remote and shared** - `NEXT_PUBLIC_API_BASE_URL` points at a deployed
  host. Local frontend, shared remote backend.
- **Orders are real and persistent.** No MSW, no nock, no mock backend anywhere. Teardown
  cancels them, so they land `Cancelled` rather than `Pending`, but they persist and each
  carries a live Ahamove quote.
- **`npx playwright test --list --project=chromium` reports 24 tests in 22 files**
  (2026-08-20) - 23 browser tests + 1 setup. Nothing filters projects by default, so a full
  run is **23 × chromium/firefox/webkit + 1 setup = 70 tests**. Of those, **12 create a real
  order per browser → ~36 real orders per green run.**
- **Runtime, measured 2026-08-20:** `e2e/create-order` alone is **8m00s for 19 tests at
  `workers: 1`** against a local dev server and the shared remote backend. The whole suite is
  ~10 minutes per browser, so chromium-only fits the **60-minute job timeout** comfortably and
  all three browsers would be ~30 minutes of it for near-zero extra signal - which is the
  other reason for the chromium-only recommendation below.

## Recommended model - unit/typecheck/lint on PR, Playwright nightly + manual

Not chosen for convention. Chosen because the suite writes persistent records to a shared
environment and depends on four external services - disqualifying for per-PR execution.

**PR workflow:** `vitest run` + `tsc --noEmit` + `eslint`. No Playwright. Seconds.

**Nightly + `workflow_dispatch`:**

```yaml
env:
  E2E_BASE_URL: http://localhost:3000
  E2E_USER_EMAIL: ${{ secrets.E2E_USER_EMAIL }}
  E2E_USER_PASSWORD: ${{ secrets.E2E_USER_PASSWORD }}
run: pnpm exec playwright test --project=chromium
```

Plus uncomment `webServer` with `command: 'pnpm build && pnpm start'`.

| Setting          | Value                                                   | Reason                                                                                                                                                                                                                                                                                                                                            |
| ---------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Browser projects | **chromium only** for `create-order/`                   | The risk surface is pricing, payload shape and order state - none browser-specific. Firefox + WebKit currently buy near-zero and cost 22 extra real orders per run. Scope cross-browser to Tier 0 (`auth`, `product`, `co-015`) if wanted at all.                                                                                                 |
| Workers          | **1** on CI                                             | `fullyParallel` against one shared account is safe only because the specs are scrupulous about it. Don't spend that margin on CI speed.                                                                                                                                                                                                           |
| Retries          | **2** on CI, **0** local                                | A retry creates another real order. Acceptable at 2, not more.                                                                                                                                                                                                                                                                                    |
| `trace`          | **`retain-on-failure`**                                 | Currently `on-first-retry` with `retries: 0` locally, so **local failures produce no trace at all**. This is the highest-ROI line in the config.                                                                                                                                                                                                  |
| `screenshot`     | `only-on-failure`                                       | Cheap.                                                                                                                                                                                                                                                                                                                                            |
| `video`          | **`on-first-retry`, CI only**                           | _Corrected from the earlier recommendation._ A trace already embeds DOM snapshots, a screenshot timeline, network and console. Video adds tens of MB per failure for marginal signal and would dominate artifact cost across 42 tests × 2 retries. It earns its keep only on a CI retry, where it separates a flake from a deterministic failure. |
| Artifacts        | `playwright-report/` 30d; **add `test-results/` at 7d** | Traces live in `test-results/` and are only useful while the failure is fresh.                                                                                                                                                                                                                                                                    |

**Tier B is never CI work.** `E2E_WAIT_FOR_PAYMENT=1` is global and the suite is
`fullyParallel`, so it opens five simultaneous 300s payment waits _and_ disables teardown for
every order in the run (`fixtures/order.ts:16-22`). Run it one spec at a time, by hand:

```
E2E_WAIT_FOR_PAYMENT=1 npx playwright test e2e/create-order/co-001-*.spec.ts \
  --project=chromium --workers=1
```

Note README open risk #4: BaoKim's return URLs are hardcoded to `hoa-theo-mua.vercel.app`,
so a Tier B run against `localhost` is redirected off-origin after paying. The specs do not
follow the redirect, so they still pass - but do not add an assertion that would.

---

# 8. Implementation order

Ordered to minimize wasted work. Steps 1–3 take about an hour and unblock everything else.

| #   | Item                                                                      | Why here                                                                                                                                                                                |
| --- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Disable the PR trigger on `playwright.yml`** (keep `workflow_dispatch`) | One line. The only actively harmful thing in the repo right now: a permanently-red check trains you to ignore checks, and if it ever went green it would create ~33 real orders per PR. |
| 2   | **`e2e/fixtures/products.ts` + API-001 canary**                           | Mechanical, zero risk, and every later spec imports from it. Doing it before CO-009/CO-006 means those are written against the fixture, not retrofitted.                                |
| 3   | **Playwright config: trace / screenshot / video**                         | Three lines. Do it _before_ writing new specs so you can debug them.                                                                                                                    |
| 4   | **vitest + UT-001 + UT-002**                                              | Resurrects the throwaway 11/11 script as permanent cover for the shipped FIX **before** CO-009, so CO-009 can be written narrow instead of duplicating payload assertions.              |
| 5   | **CO-009**                                                                | Now reduced in scope by step 4, and still the only cover for a live pricing fix. Stash the fix once to confirm it goes red against the old code.                                        |
| 6   | **UT-003 + UT-004**, then **CO-010** and **CO-011** in reduced form       | Write the unit matrix first so the E2E specs are written already knowing what is covered - the alternative is writing them full-size and cutting them back.                             |
| 7   | **CO-016+ (`shippingFee` row)**                                           | Unchanged from v1 and still the highest-value single assertion in the plan. Self-contained, API-only, existing harness.                                                                 |
| 8   | **API-002** - first `page.route` usage - then **CO-008**                  | Small, self-contained pilot that proves the technique before CO-007/CO-012/CO-020/CO-021 all depend on it. CO-008 is the first real consumer.                                           |
| 9   | **CO-006**                                                                | Highest-value remaining journey gap; needs the product fixture from step 2.                                                                                                             |
| 10  | **CO-007 §3**, then **CO-012 §4**                                         | The two cart-destruction paths. Write only these sub-cases first; the siblings are P2.                                                                                                  |
| 11  | **CO-019**                                                                | Now correctly priced as its own coverage, and CO-010 has already built its helpers.                                                                                                     |
| 12  | **UT-005 / UT-006 / UT-007**                                              | Cheap, independent, good filler whenever E2E work is blocked on environment.                                                                                                            |
| 13  | **CO-017**                                                                | Needs one manual Tier B run to be worth anything - schedule it when someone can pay.                                                                                                    |
| 14  | **CO-020**, then **CO-021**                                               | Fixture-heavy and flakiest. UT-004 has answered the open question: CO-021 is a **pinned KNOWN GAP** (a zero coordinate passes step 1), not a green tick.                                |
| 15  | **CO-026**                                                                | Blocked on the second account; inert until credentials exist.                                                                                                                           |

The only hard dependencies: **4 before 5**, **2 before 9**, **8 before CO-007 §6 / CO-012 /
CO-020 / CO-021 / CO-008**, and **UT-004 before CO-021**.

---

# 9. Open questions to resolve

1. ~~**CO-018 status** - README says _Review_, the plan says _Blocked_. Reconcile.~~
   **Resolved 2026-08-20: Blocked, in both documents.**
2. ~~**Outside free-ship radius** - merge into CO-003/CO-004 and close, or give it a row?~~
   **Resolved 2026-08-20: merged into CO-003/CO-004 and closed.** See §6.5.
3. **Two geocoding providers** - VietMap (via BFF) and Goong (direct from browser,
   `services.ts:139`). Why both? One is likely dead code, and if so `UT-005`'s scope shrinks.
4. **Is there a BaoKim sandbox** that would let Tier B run unattended? That single answer
   would convert five manual blocks into automated coverage.
5. **Can `ahamove.free_ship` be pinned** in a test environment? That unblocks CO-018.
6. ~~**`checkout/checkout.spec.ts`** - confirm deletion.~~
   **Resolved 2026-08-20: deleted.** See §6.6 for what was carried over.
