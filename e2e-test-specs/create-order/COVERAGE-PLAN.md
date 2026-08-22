# Create Order - coverage gap plan

> ## ⚠️ LỖI THỜI - tài liệu lịch sử, đừng dùng để tra cứu
>
> Bản này đã bị **`COVERAGE-PLAN-v2.md`** thay thế, và mọi ID `CO-` bên dưới là **ID cũ**,
> trước lần đánh số lại ngày 2026-08-20. Đây là lý do duy nhất nó còn được giữ: để tra lại
> quyết định cũ.
>
> - Cần biết bộ test hiện tại có gì → [`README.md`](./README.md)
> - Cần lý do kỹ thuật của từng case → [`COVERAGE-PLAN-v2.md`](./COVERAGE-PLAN-v2.md)
> - Cần dịch ID cũ sang ID mới → bảng "Đổi số ID" ở cuối `README.md`

Derived from the code (`features/orders/**`, `stores/checkout-intent.store.ts`,
`app/[locale]/(protected)/(customer)/{cart,checkout,orders}`) against the nine implemented specs.
SePay-as-payment is out of scope throughout - CO-009…CO-012 stay Blocked, and CO-015 keeps the
SePay gateway/method coupling because that is pure client logic.

Each work item below is self-contained: pick one, do it, update the README table, move on.
Nothing here depends on a later item **except** CO-018, which is the regression test for the FIX
and must come after it.

## Execution order

Work top-down. The table is the recommended order, not the order the sections are written in -
each row links to its section by ID.

| #      | ID      | Item                                                      | Kind                        | Why here                                                                                                                                                                         |
| ------ | ------- | --------------------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ~~0~~  | CO-005  | ~~Rewrite the stale free-ship doc~~ **DONE**              | doc                         | The `<=` flip is fresh today; do it before the reason is forgotten.                                                                                                              |
| ~~1~~  | FIX     | ~~the invoice tab-switch state leak~~ **DONE**            | app code                    | A live pricing bug (VAT charged on a Personal invoice), not test debt. Ship it first.                                                                                            |
| **2**  | CO-018  | Invoice tab switch clears the other branch                | new spec                    | Regression cover for the FIX. Do it while that is fresh.                                                                                                                         |
| **3**  | CO-007  | Business invoice validation                               | new spec (doc exists)       | Builds the two POM helpers - `fieldError()` and the zero-POST counter - that CO-017, CO-021 and CO-023 all reuse. Cheapest real gap.                                             |
| **4**  | CO-017  | Personal invoice validation                               | new spec                    | Direct mirror of CO-007. Nearly free once its helpers exist.                                                                                                                     |
| **5**  | CO-016+ | Server-side create-order hardening                        | extend existing             | Contains the single highest-value assertion in the plan: the server ignores a tampered `shippingFee`. API-only, no new POM, existing harness.                                    |
| **6**  | CO-019  | Date only, no slot - the 4th delivery combination         | new spec                    | The one genuinely missing delivery combination. Clone of CO-013; run its Tier B block once by hand.                                                                              |
| **7**  | CO-022  | Multi-line, partial cart selection, cart cleanup          | new spec + 1 step in CO-001 | Exercises the `nhanhProductId ?? productId` fallback with several lines in flight - the likeliest place a real pricing bug hides.                                                |
| **8**  | CO-020  | Buy-now entry + checkout intent guards                    | new spec                    | Needs new `ProductPage` methods (`buyNow`, quantity stepper). First item that isn't purely additive to existing POMs.                                                            |
| **9**  | CO-021  | Step navigation + estimate/create failure handling        | new spec                    | Route intercepts plus `submitExpectingFailure()` - which CO-007 already gave you.                                                                                                |
| **10** | CO-023  | Step-1 validation (address / phone / remarks)             | new spec                    | Same helpers as CO-007/CO-017; parked here only because it guards less money than the four above it.                                                                             |
| **11** | CO-024  | Address editing - saved↔manual, city→ward, clear, map pin | new spec (split it)         | Needs a second-saved-address fixture, and its map steps are the flakiest work in the plan. Do 1/2/4/5 as `CO-024a`, the map steps as `CO-024b`, and park `b` if it won't settle. |
| **12** | CO-025  | Cross-account cancel (no owner check on the BE)           | new spec                    | Blocked on the second account, and the only item whose outcome is a decision rather than a green tick.                                                                           |

Three things drove that order: **the code fix outranks all test work** (FIX + CO-018), **CO-007 pays
for CO-017, CO-021 and CO-023** by building the negative-path POM helpers once, and **fixture-heavy or
externally-flaky work goes last** (CO-024, CO-025) so it can slip without blocking anything.

Legitimate swap: if the question that worries you most is "does the server really ignore the fees
the client sends", pull CO-016+ to the front - it is self-contained and answers that in one sitting.

**Dropped by decision:** shipping-service selection (non-default service, list ordering,
`shippingEmpty`). Keeping the current "cheapest is preselected" assertion as the whole of it.

---

## Rules that apply to every item

These are the constraints the existing suite already works under. Breaking one of them produces a
flaky spec that passes alone and fails in a full run.

1. **One shared account, fully parallel.** Never assert account-wide state (address count, order
   count, cart contents belonging to another spec). Use a per-page request counter or a route
   intercept instead. See README open risk #8.
2. **Register cleanup before asserting.** `createdOrders.push(order.id)` goes on the line after
   `placeOrder()` returns, before any `expect` that could throw.
3. **Every order carries the note** `DEV TEST - Không xử lý đơn hàng này.`
4. **No `data-testid` in checkout.** Locators are Vietnamese accessible names from
   `lib/i18n/messages/vi.json`; add new ones to `e2e/pages/checkout.page.ts`, never inline in a
   spec. Copy changes break these silently.
5. **`orderTest.use({ addressSpec })`** picks the fixture address:
   `FREE_SHIP_ADDRESS` (inside the radius) or `PAID_SHIP_ADDRESS` (outside).
6. **A spec that creates no order** does not need `createdOrders`, and should not use
   `orderTest.slow()` unless it actually walks the product→cart→checkout path.
7. **Route intercepts are the tool for unreachable states** (no addresses, no phone number,
   a 500 from the server). They are deterministic and cannot collide with a parallel spec.
8. After each item: update the table and the Coverage section in
   `e2e-test-specs/create-order/README.md`, and add the case doc if a new ID was minted.

Run a single spec:

```
npx playwright test e2e/create-order/co-0NN-*.spec.ts --project=chromium
```

---

## CO-007 - Business invoice validation

**Gap.** The `superRefine` in `features/orders/validations.ts:73-98` is the only thing standing
between a Business invoice and a missing tax code. Nothing tests it. The spec doc already exists and
is marked _Ready to implement: Yes_.

**Reference.** `e2e-test-specs/create-order/CO-007-invalid-business-vat.md`.

**File.** `e2e/create-order/co-007-invalid-business-vat.spec.ts` (new).

**Shape.** Saved address, immediate delivery, reach step 2, turn the invoice on, Business tab, then
three sub-cases. No order is ever created, so no `createdOrders` bookkeeping and no teardown risk -
this is the cheapest spec in the plan.

**Steps.**

1. Product → cart → checkout → `pickSavedAddress` → `setNote` → `goToPayment` (the Ahamove quote
   still has to land, or the submit button never enables).
2. `checkout.enableInvoice()` then `checkout.businessTab.click()`.
3. **All three required fields empty** → click submit → assert:
   - the `Vui lòng kiểm tra lại các trường thông tin.` toast,
   - an inline `Mã số thuế là bắt buộc.` under `#taxCode`,
   - `Email nhận hoá đơn là bắt buộc.` and `Số điện thoại nhận hoá đơn là bắt buộc.`,
   - **no `POST /api/v1/orders` request** - this is the assertion that matters, count it with a
     page-level request counter armed before the click,
   - the URL is still `/checkout`.
4. **Invalid formats** - fill `receiptEmail` with `not-an-email` and `receiptPhoneNumber` with
   `123`, fill a valid `taxCode` → submit → assert
   `Vui lòng nhập địa chỉ email hợp lệ.` and
   `Số điện thoại không hợp lệ (ví dụ: 0983 024 353).`, still no POST.
5. **Recovery** - fix all three fields → submit → the order is created. This is the half that proves
   the gate opens again rather than being permanently stuck; push to `createdOrders`.

**POM additions.** A `submitAttempted` helper is not needed - copy the counter pattern from
`CheckoutPage.placeOrder`. Add a `fieldError(inputId: string)` locator to `CheckoutPage`
(`#taxCode` → `xpath=following-sibling::div//*[@data-slot="field-error"]`, verify the actual DOM
first) so steps 3 and 4 read cleanly and CO-017 can reuse it.

**Careful.** `placeOrder()` retries a swallowed click and asserts exactly one create-order call -
it cannot be used here, because steps 3 and 4 expect _zero_ calls. Click the raw button
(`Thanh toán đơn hàng`) directly and assert the counter, then use `placeOrder()` only in step 5.

**Done when** all three sub-cases pass and step 5's order shows up cancelled after teardown.

---

## CO-017 - Personal invoice validation

**Gap.** The Personal branch requires five fields (`validations.ts:91-97`) - `identityNumber`,
`receiptFullName`, `receiptAddress`, `receiptEmail`, `receiptPhoneNumber` - and has no spec at all,
not even a doc. Strictly more surface than the Business branch.

**Files.** `e2e-test-specs/create-order/CO-017-invalid-personal-vat.md` (new doc, mirror CO-007's
structure) and `e2e/create-order/co-017-invalid-personal-vat.spec.ts`.

**Shape.** Identical to CO-007 with the Personal tab, which is where `enableInvoice()` already
lands - do not click the tab, assert it is active, so a changed default surfaces here.

**Sub-cases.**

1. All five empty → five inline `{field} là bắt buộc.` errors + the toast + no POST.
2. One at a time: fill four, leave one empty, submit, assert only that field errors and no POST.
   Loop over the five fields rather than writing five steps - a dropped `requireField` call is
   exactly the regression this catches, and only a per-field loop catches it.
3. Invalid email + invalid phone formats.
4. Recovery: all five valid → order created → the payload carries all five and
   `invoiceType: 'Personal'`, `taxCode: null`, and the created order has `vatFee: 0`
   (Personal invoices carry no VAT - the server keys VAT off the tax code, README point 2).

**Done when** the loop in sub-case 2 covers all five fields and the recovery order reads
`vatFee: 0`.

---

## FIX - the invoice tab-switch state leak (code change, not a test) - DONE

**Done (2026-08-19).** Three layers, all on `test/e2e-testing`:

1. `invoice-fields.tsx` - module-scope `BUSINESS_ONLY_FIELDS` / `PERSONAL_ONLY_FIELDS` /
   `SHARED_INVOICE_FIELDS` plus a `clearInvoiceFields()` helper. The tab's `onValueChange` now clears
   the branch being left (and its stale errors, via `clearErrors`); the switch-off path was rewritten
   to use the same helper so the two cannot drift. `receiptEmail` / `receiptPhoneNumber` survive a tab
   switch - both types require them.
2. `payloads.ts` - `buildCheckoutPayload` now filters by `invoiceType` (`taxCode` only for Business,
   `identityNumber`/`receiptFullName`/`receiptAddress` only for Personal) instead of sending whatever
   is non-empty. Structural: a regression in (1) can no longer reach the wire.
3. `checkout-client.tsx` - `hasTaxCode` additionally requires `invoiceType === Business`, so the VAT
   row cannot render on a Personal invoice even with a stale `taxCode` in form state.

**Confirmed by the user (2026-08-19):** `receiptEmail` and `receiptPhoneNumber` survive a tab switch on
purpose. They are the only invoice fields rendered outside an `invoiceTypeForm ===` guard
(`invoice-fields.tsx:235`, `:257`), both types require them (`validations.ts:89-90`, `:95-96`), and both
types send them - so carrying them across is visible, editable, correct data, not a leak. CO-018 must
assert they are **preserved**, not cleared.

**Consequence for CO-018:** layers 2 and 3 mean a sidebar-only assertion ("switch to Personal, no VAT
row") now passes _even if the form clearing regresses_. CO-018 must assert the cleared **field values**
(and ideally the captured POST body), not just the sidebar, or it won't guard layer 1 at all.

Verified: `tsc --noEmit` clean, `eslint` clean on the three files, and a throwaway script exercised
`buildCheckoutPayload` in both leak directions (11/11 checks - Business drops the personal three,
Personal drops `taxCode`, both keep email/phone). The DOM half of layer 1 is **not** yet verified by
hand or by test; that is CO-018's job.

---

### Original analysis

**The bug.** `InvoiceFields` (`features/orders/components/invoice-fields.tsx:83-96`) clears the
invoice fields only when the switch goes **off**. The `invoiceType` tab `Controller` (line 104-115)
is a bare `field.onChange` - switching Personal↔Business clears nothing. And
`buildCheckoutPayload` (`features/orders/payloads.ts:67-80`) sends every non-empty field regardless
of `invoiceType`. Two consequences:

- Fill Personal → switch to Business → submit: the order carries `identityNumber`,
  `receiptFullName` and `receiptAddress` alongside a Business `invoiceType`.
- Fill a Business `taxCode` → switch to Personal → submit: `taxCode` survives, so
  `hasTaxCode` (`checkout-client.tsx:119`) stays true, the sidebar shows a **VAT 8% row on a
  Personal invoice**, and the server charges VAT because it keys off the tax code, not the toggle.
  The customer is shown, and charged, VAT on an invoice type that should not carry it.

**Decision: fix the UI state.** Do not encode the current behaviour in a test.

**Fix.** In the `invoiceType` `Controller`'s `onValueChange`, clear the branch being left before
setting the new type:

- → `Business`: null `identityNumber`, `receiptFullName`, `receiptAddress`
- → `Personal`: null `taxCode`

Keep `receiptEmail` / `receiptPhoneNumber` - both branches require them, so clearing them would make
a tab switch destroy valid input the customer has to retype. Use the same
`setValue(name, null, { shouldDirty: true })` shape the switch-off path already uses, and reuse a
small local `clearFields([...])` helper so the two paths cannot drift.

**Also worth checking while in there** (report, do not necessarily change): `buildCheckoutPayload`
trusting form state rather than filtering by `invoiceType` is what turned a UI slip into a wire
payload. A `invoiceType === Business ? {taxCode, ...} : {identityNumber, ...}` split there would make
the leak structurally impossible. Decide whether you want the belt as well as the braces.

**Verify by hand** before writing CO-018: fill Personal, switch to Business, confirm the sidebar VAT
row and the hidden fields both behave.

---

## CO-018 - Invoice tab switch clears the other branch

**Gap.** Regression cover for the FIX. Do this immediately after the fix, not before.

**File.** `e2e/create-order/co-018-invoice-tab-switch.spec.ts` (new) + case doc.

**Steps.**

1. Reach step 2 with a saved address, immediate delivery.
2. `enableInvoice()` (lands on Personal) → fill all five Personal fields.
3. Switch to Business. Assert:
   - `#taxCode` is empty (it was never filled - the point is what happens on the way back),
   - `receiptEmail` / `receiptPhoneNumber` **kept** their values,
   - no VAT row in the sidebar yet (no tax code).
4. Fill `taxCode` with the valid business code CO-003 uses. Assert the `VAT 8%` row appears.
5. Switch back to Personal. Assert:
   - the `VAT 8%` row is **gone** (`taxCode` was cleared - this is the money-side assertion),
   - `identityNumber`, `receiptFullName`, `receiptAddress` are empty (they were cleared on the way
     out in step 3, and must not resurrect),
   - `receiptEmail` / `receiptPhoneNumber` still hold their values.
6. Refill the Personal fields, submit, and assert the created payload has `taxCode: null`,
   `invoiceType: 'Personal'`, and the order reads `vatFee: 0`.

**Done when** step 5's VAT row assertion fails against the pre-fix code and passes after it -
check that explicitly by stashing the fix once.

---

## CO-019 - Date only, no slot: the fourth delivery combination

**Gap.** Four delivery combinations are reachable; three are covered.
`orderTime > 0` + `tagIds: []` - a date with no window - is placed by nobody.

**Your call, recorded:** a date with no slot **is** a scheduled delivery and must **not** get
Ahamove tracking fields after a successful payment. That matches the backend: the ride is booked
inside the payment webhook and only when `orderTime == 0 && tagIds == []`
(README point 6), so `orderTime > 0` alone is enough to suppress dispatch. This spec is the only
thing that pins it.

**Files.** `e2e-test-specs/create-order/CO-019-date-only-scheduled.md` +
`e2e/create-order/co-019-date-only-baokim.spec.ts`.

**Base.** Clone `co-013-slot-only-same-day-baokim.spec.ts` - it is the closest sibling (same
free-ship address, same no-invoice, same BaoKim) and already has the scheduled-delivery
assertions. Invert its premise: pick a date, never open the slot select.

**Steps.**

1. `orderTest.use({ addressSpec: FREE_SHIP_ADDRESS })`, saved address, note.
2. `checkout.pickDeliveryDate(date)` with `date = today + 2 days` - inside the today..+7 window,
   and far enough from the edges that a run straddling midnight cannot drift out of it.
3. Assert `checkout.deliverySlot` still reads `Không chọn`, and that
   `checkout.deliveryDateClear` **is** visible (the mirror of CO-013's assertion, and the cheapest
   proof `orderTime > 0`).
4. Sidebar: `Ngày giao hàng` is the picked date formatted `dateLong`; there is **no**
   `Thời gian giao` row (CO-013 asserts the opposite - that pairing is the whole point).
5. Payload: `orderTime` equals `Math.floor(date.setHours(0,0,0,0)/1000)` - read the exact value the
   picker produces from `checkout-fields.tsx:447` rather than recomputing it loosely,
   `tagIds: []`, everything else at CO-001's values.
6. API read-back: `orderTime` matches, `tagsId: []`, `shippingFee: 0`, plus
   `expectServerTotalsMatchUi`.
7. Order detail UI: `Ngày giao dự kiến` shows the picked date and **not**
   `Ngay sau khi thanh toán` - `isScheduledDelivery` is `orderTime > 0 || tagsId.length`
   (`orders/[id]/page.tsx:214`), so this is the UI half of the same rule. No tag label in
   parentheses, since there is no slot.
8. **Tier B** (`WAIT_FOR_PAYMENT`): park, pay, then assert the order is `Paid` **and**
   `ahahaMoveOrderId` / `ahahaMoveTrackingUrl` are both still empty, and the
   `Theo dõi đơn hàng` card does not render. Do **not** call `waitForAhamoveDispatch` - it polls
   _for_ a booking and would fail by design. Copy CO-003's negative dispatch assertions instead,
   and give the backend a few seconds after `Paid` before asserting the absence, so a booking that
   lands slightly late is not mistaken for one that never came.

**Done when** the spec passes in Tier A, and the Tier B block has been run once by hand - the
no-dispatch assertion is the reason this spec exists and it only executes with a real payment.

---

## CO-016+ - server-side create-order hardening

**Gap.** CO-016 captures a real payload from the UI and then mutates one field at a time - the
perfect harness, currently used for two rules only (`orderTime` bounds, `tagIds` unvalidated).
Everything else the endpoint accepts is untested, including the README's central claim that the
server recomputes every fee and ignores the client's.

**File.** Extend `e2e/create-order/co-016-order-payload-validation.spec.ts`. No new ID. Add steps
after the existing ones so the captured `basePayload` is reused.

**New steps, each one field off the base payload.**

| Mutation                                         | Expectation                                                           | Why                                                                                                  |
| ------------------------------------------------ | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `items: []`                                      | rejected                                                              | an order with nothing in it must not price at 0 and sit payable                                      |
| `items: [{itemId: 'does-not-exist', number: 1}]` | rejected, or accepted-and-priced-0 - **record what actually happens** | the subtotal comes from the Nhanh.vn catalogue; an unknown id either 422s or silently prices nothing |
| `number: 0` and `number: -1`                     | rejected                                                              | a negative line would reduce the total                                                               |
| `latitude`/`longitude` dropped or `0`            | record actual                                                         | the Ahamove quote needs real coordinates                                                             |
| `phone`/`address` empty                          | record actual                                                         | these come from the account, not the form, so the UI can never send them empty                       |
| `tagIds: [1, 2]`                                 | record actual                                                         | the form caps at 1 (`validations.ts:31-34`); the server rule is commented out                        |
| **`shippingFee: 0` with `PAID_SHIP_ADDRESS`**    | order is created **and** `getOrder().shippingFee > 0`                 | the money assertion - proves the server quotes Ahamove itself and ignores the client's number        |
| unauthenticated `POST /api/v1/orders`            | 401/403                                                               | use `page.request` from a fresh context, or strip the cookie                                         |

**Method.** Same `expectRejected` helper (status + `messageCode` only - field detail is
Development-only, README point 8). For the rows marked _record actual_, assert the behaviour you
observe and comment it as pinned-current-behaviour, the way the existing `tagIds` step does. A spec
that documents a gap is worth more than one that skips it.

**Careful.** The `shippingFee` row needs a second captured payload from a `PAID_SHIP_ADDRESS`
checkout, because the free-ship address legitimately produces `shippingFee: 0`. Either add a second
capture step or move that one row into its own spec - a second capture inside CO-016 is cheaper.
Every accepted order must be pushed to `createdOrders`, and any order carrying a bogus field
should be cancelled inline rather than left to teardown (the existing `tagIds` step does this).

**Done when** every row above is either asserted or explicitly pinned with a comment, and the
`shippingFee` row is green.

---

## CO-020 - Buy-now entry and checkout intent guards

**Gap.** Every existing spec enters through the cart with every line selected. Four guards around
`useCheckoutFlow` / `useCheckoutIntentStore` are untested, and one of them is the reason a customer
can lose their cart.

**File.** `e2e/create-order/co-020-checkout-entry-guards.spec.ts` (new) + case doc.

**Sub-cases** - these are cheap and share one page, so keep them in one spec as separate steps.

1. **Empty intent → `/cart`.** `page.goto('/checkout')` with nothing in the intent store
   (`useCheckoutFlow:36-39`). Assert the URL settles on `/cart`. Every existing spec relies on this
   in a comment and nothing verifies it.
2. **Buy-now entry.** Product detail → set quantity 2 → `Mua ngay`. Assert `/checkout` with the
   right line and quantity in the sidebar. Needs a `buyNow()` method on `ProductPage`
   (`Mua ngay`, `features/products/components/product-purchase-box.tsx`) and a quantity stepper
   helper.
3. **Buy-now must not touch the cart.** Add an unrelated product to the cart _first_, then buy-now a
   different one, place the order, then go to `/cart` and assert the unrelated line is **still
   there**. `useCheckoutFlow:92-94` only removes lines when `source === 'cart'` - a regression here
   silently deletes a customer's cart. This is the highest-value assertion in the item.
4. **Cancel booking.** Reach step 1, click `Huỷ thanh toán` (note: not "Hủy đơn hàng" - that is the
   order-detail CTA). Assert the redirect target is `/cart` for a cart-sourced intent and
   `/products` for a buy-now one (`useCheckoutFlow:108-111`), and that returning to `/checkout`
   bounces to `/cart` because the intent was cleared.
5. **Post-order revisit.** After a successful order, `page.goto('/checkout')` → `/cart`.
   `clearIntent()` ran, so this must not resurrect a paid-for basket.
6. **Phone-less account gate.** Route-intercept `GET /api/taskcoper/v1/users/*` and blank
   `phoneNumber` in the response, then load `/checkout`. Assert the form is replaced by
   `Vui lòng bổ sung họ tên và số điện thoại trong hồ sơ của bạn.` and the
   `Chỉnh sửa thông tin` CTA, and that no address picker renders
   (`checkout-client.tsx:176-183`). Do **not** edit the real account's profile - the account is
   shared with every other spec running in parallel.

**Done when** sub-case 3 is green and sub-case 6 uses an intercept rather than a profile edit.

---

## CO-021 - Step navigation and failure handling

**Gap.** Nothing exercises going backwards, and nothing exercises either failure path. A failed
create-order must leave the cart and the intent intact - otherwise the customer loses the basket
_and_ has no order.

**File.** `e2e/create-order/co-021-step-navigation-failures.spec.ts` (new) + case doc.

**Steps.**

1. **Back preserves the form.** Reach step 2, click `Quay lại`, assert the note, the address
   selection and the delivery options are all still set (`step` is local state; the form lives in
   `useEstimateOrder`'s `useForm`, so nothing should be lost). Then go forward again and assert a
   **second** estimate call fires - `handleGoToPayment` re-quotes unconditionally, and a stale quote
   from before an address change is how a customer gets charged the wrong shipping.
2. **Address change re-quotes.** Back to step 1, switch to a different saved address (or to manual
   with `PAID_SHIP_ADDRESS`), forward again, and assert the new quote's `latitude`/`longitude`
   match the new address - the payload/estimate coordinate agreement CO-001 asserts once, here
   across a change.
3. **Estimate failure.** Intercept `POST /api/v1/ahamove/estimate` → 500. Click continue. Assert
   the `Không thể ước tính đơn hàng.` toast, that the page stays on step 1 (the
   `Tiếp tục đến thanh toán` button is still there), and that no order can be created.
4. **Create failure.** Reach step 2 with the estimate un-intercepted, then intercept
   `POST /api/v1/orders` → 500. Submit. Assert:
   - the `Không thể tạo đơn hàng.` toast,
   - the URL is still `/checkout` (no push to `/orders/...`),
   - `/cart` still holds the line - `items.forEach(removeCartItem)` and `clearIntent()` both run
     _after_ a successful `createOrder`, so a failure must leave both alone,
   - the intent survives: reloading `/checkout` still shows the order rather than bouncing to
     `/cart`.
5. **Retry succeeds.** Drop the intercept, submit again, assert exactly one order exists. This is
   the assertion that a failed attempt did not leave a half-created order behind.

**Careful.** `CheckoutPage.placeOrder()` waits for a `/orders/{id}` URL and asserts one create call

- it is unusable for steps 3 and 4. Add a `submitExpectingFailure()` to the POM, or click the button
  directly in those steps.

**Done when** step 4's cart assertion is green - that is the one protecting the customer's basket.

---

## CO-022 - Multi-line order, partial cart selection, cart cleanup

**Gap.** Every create-order spec is one line at `QUANTITY = 1`. Three untested things collapse into
one spec: multi-line pricing, the cart's per-line selection (`selectedCartItems`,
`cart/page.tsx:334`), and the removal of the ordered lines afterwards.

**Files.** `e2e/create-order/co-022-multiline-partial-cart.spec.ts` (new) + case doc.
Plus **one step added to CO-001**: after the order, `cart.goto()` and assert the ordered line is
gone. That is the plain single-line version of the same rule and belongs in the base case.

**Steps.**

1. Add **three** lines to the cart - two variants of the search product plus one other product, at
   mixed quantities (e.g. 1, 2, 1). `ProductPage.selectFirstVariant` returns the label; you will
   need a variant-by-index helper to get a second one.
2. In the cart, tick **two** of the three (`cart.select(label)`, not `selectAll()`), and note the
   cart's own subtotal for the selection.
3. Checkout: the sidebar lists exactly the two selected lines, with the right quantities, and
   `Tạm tính` equals their subtotal - the third product must appear nowhere.
4. Place the order. Payload: `items` has two entries with the right `number` values, and the
   `itemId`s are the products' `nhanhProductId` (not the local `productId`) -
   `payloads.ts:28-31`. Nothing currently asserts that mapping explicitly and it is the field the
   backend prices from.
5. API read-back: `details` has length 2, per-line `number` matches, and `productFee` equals the
   sum of `price * number` across the lines. `expectServerTotalsMatchUi` for the totals.
6. **Cart cleanup:** back to `/cart` - the two ordered lines are gone, the third is **still there**
   at its original quantity. Assert by line label on this page only, never by counting the cart
   globally.

**Done when** step 6 passes, since it is both the selection assertion and the cleanup assertion.

---

## CO-023 - Step-1 validation

**Gap.** `createEstimateSchema` runs on every attempt to leave step 1
(`use-checkout-flow.ts:62-70`) and nothing tests it. Cheap, no order created.

**File.** `e2e/create-order/co-023-step-one-validation.spec.ts` (new) + case doc.

**Steps.** Switch to manual entry so the fields are reachable, then:

1. **Everything empty** → continue → the `Vui lòng kiểm tra lại các trường thông tin.` toast, inline
   `là bắt buộc` errors on `addressLine` / `Phường / Xã` / `Tỉnh / Thành phố`, and **no**
   `POST /api/v1/ahamove/estimate`.
2. **Invalid `phoneReceiver`** (`123`) with everything else valid → the
   `Số điện thoại không hợp lệ (ví dụ: 0983 024 353).` error, no estimate.
3. **`remarks` over 500 chars** → `Ghi chú không được vượt quá 500 ký tự.`, no estimate.
   Note the textarea has no `maxLength` attribute, so this is reachable from the UI.
4. **Recovery** → fill a valid manual address → continue → the estimate fires and step 2 renders.
   Stop there; do not place an order.

**Careful.** `addressLine` is `getByLabel('Địa chỉ', { exact: true })`, which also matches
`Địa chỉ nhận hoá đơn` once invoicing is on - the POM already documents this. Stay on step 1 and it
is unambiguous.

---

## CO-024 - Address editing

**Gap.** The largest untested surface in checkout: `AddressMapField`, the autocomplete's clear path,
the city→ward cascade, and the saved↔manual round trip. All of it is client-side and none of it
needs an order to be created.

**File.** `e2e/create-order/co-024-address-editing.spec.ts` (new) + case doc. This is the one item
worth splitting further if it runs long - each step below stands alone.

**Steps.**

1. **Manual → saved restores the previous selection.** Pick a saved address, switch to manual
   (fields blank - CO-002 covers that half), switch back with `Chọn địa chỉ đã lưu`, and assert the
   original address is reapplied. `handleManualToggle`'s else-branch
   (`checkout-fields.tsx:86-89`) re-selects `selectedAddressId`, and nothing tests it.
2. **Zero saved addresses forces manual.** Intercept `GET /api/v1/addresses` → `[]`. Assert no
   picker renders, the manual fields are shown unconditionally, and the
   `Nhập địa chỉ mới` / `Chọn địa chỉ đã lưu` toggle is absent
   (`showManualFields = manualAddress || !hasSavedAddresses`, and the toggle is gated on
   `hasSavedAddresses`). Intercept, do not delete the shared account's addresses.
3. **Switching between two saved addresses** re-applies `phoneReceiver` and the address line. Needs
   a second saved address - extend the `savedAddress` fixture with an opt-in second row rather than
   creating one inline, so teardown stays symmetrical.
4. **City change resets ward.** Pick a city, pick a ward, change the city, assert the ward selector
   is back to `Chọn phường / xã` and `wardCode` is cleared
   (`checkout-fields.tsx:225-228`). A stale ward from another city is a mis-delivery.
5. **Clearing the autocomplete resets the coordinate.** Fill and resolve an address, clear the
   input, and assert continuing is blocked / no valid quote is produced - `onClear` zeroes
   `latitude`/`longitude`/`mapId` (`checkout-fields.tsx:316-321`), and `latitude: 0` is what the
   estimate would be sent.
6. **Map pin adjustment.** Resolve an address, drag/click the map a short distance, and assert the
   reverse geocode writes back `addressLine` + ward + city (`checkout-fields.tsx:339-361`), and
   that the coordinate in the eventual estimate payload is the _moved_ one.
7. **Pin beyond the anchor radius** → `Điểm này quá xa địa chỉ của bạn. Vui lòng kéo ghim lại gần hơn.`
   and the coordinate unchanged. Read `address-map-picker.tsx` for the actual radius before
   choosing an offset.

**Careful.** Steps 6 and 7 drive a real map canvas and a live VietMap reverse geocode - they are the
most likely to be flaky in the whole plan. Assert on the form state that results, never on the
map's internals, and if the drag proves unstable, drive the picker through its "my location"
affordance or park 6–7 as a documented sub-gap rather than leaving a flaky spec in the suite.

---

## CO-025 - Cross-account cancel

**Gap.** `CancelOrder` filters on `Id` alone - unlike every other order method it has no owner
check, so any authenticated customer can cancel any other customer's pending order. README open
risk #2. Proving it needs a second account.

**Credentials are ready.** `E2E_USER2_EMAIL` and `E2E_USER2_PASSWORD` are now in `.env`, empty -
fill them with a second registered, email-verified account that has **no** relationship to the
first. Nothing reads them yet.

**Wiring.**

1. `e2e/fixtures/auth.ts`: export `TEST_USER_2` alongside `TEST_USER`, and add a `secondUserPage`
   fixture. The `signIn` helper already takes a `user` option, so it can sign in a second context
   directly - reuse it rather than adding a second storage-state file, so an empty credential fails
   loudly at sign-in rather than silently reusing account one's session.
2. `playwright.config.ts` needs no change if the second account signs in inside the fixture.

**Spec.** `e2e/create-order/co-025-cross-account-cancel.spec.ts` + case doc.

1. `orderTest.skip(!TEST_USER_2.email, 'E2E_USER2_* not configured')` - the spec must be inert
   until the credentials are filled in, so an unconfigured checkout is not a red suite.
2. Account one creates a pending order the usual way, `createdOrders.push`.
3. Account two: `PATCH /api/v1/orders/{id}/cancel` from its own request context.
4. Assert the **desired** behaviour - 403/404, and the order still `Pending` when account one reads
   it back. Then, if it fails because the cancel succeeded, you have reproduced the vulnerability:
   leave the spec failing and file it, or invert it to a pinned-current-behaviour step with a
   `KNOWN GAP` comment the way CO-016 does for `tagIds`. Decide which when you see the result -
   do not write the assertion to match a broken backend before you have confirmed it is broken.
5. Also check the read side while you have a second account: account two doing
   `GET /api/v1/orders/{id}` on account one's order. If that leaks too, it is a bigger finding than
   the cancel.

**Note.** Account two must not share the cart/address state of account one - a separate browser
context per account, which the fixture shape above gives you for free.

---

## CO-005 - the doc is stale (housekeeping) - DONE

Commit `5e136da` (2026-08-17) flipped the free-ship comparison from `distanceKm < freeShipKm` to
`<=` in `features/orders/components/checkout/checkout-client.tsx:100`.

`CO-005-freeship-boundary.md` stated the rule as strict `<`, so its main assertion - "at exact
equality the fee is charged" - was **inverted**. The suite README was already correct (it records
`<=` on both sides, matching `Distance <= freeShipping` on the server); the case doc was not.

**Done (2026-08-19).** `CO-005-freeship-boundary.md` rewritten against `<=`: Quick Review, Flow,
Critical Assertions, Objective, Repository Evidence (with line refs), §6/§7/§9 and §15 all now assert
that equality **is** free - sidebar shows the raw fee plus the `Giảm giá (bán kính miễn phí ship)`
row, payload carries `shippingFee: 0`. Added an "Operator history" callout naming `5e136da`, a note
that the sidebar is fed `rawShippingFee` (`:228`) while the payload gets the zeroed value (`:124`),
and the new point that equality is the one distance where the client and server operators must agree -
which also makes the stubbed-estimate unblocking route strictly weaker (§14). The case itself stays
Blocked on deterministic boundary data.

**Stale guard in the spec code, fixed too.** `co-003` and `co-004` gate their paid-ship fixture with
`expect(distanceKm).toBeGreaterThanOrEqual(freeShipKm)`. That was correct under `<`; under `<=` a
distance exactly equal to the radius is free, so the guard would pass and the run would then fail on
`sidebarRow('Giảm giá (bán kính miễn phí ship)').toHaveCount(0)` with a message blaming the address.
Both changed to `toBeGreaterThan(freeShipKm)`. The free-ship specs (`co-001`, `co-002`, `co-013`,
`co-014`) use `toBeLessThan(freeShipKm)`, which is still valid - strictly inside the radius is free
under either operator - so they were left alone.

Two stale references fixed alongside it: `CO-006`'s Business Rule row (`<` → `<=`) and `CO-001`'s
Confirmed bullet. `CO-001`'s fixture guard (`expect(distanceKm).toBeLessThan(freeShipKm)`) is
unaffected - an address strictly inside the radius is free under either operator.
