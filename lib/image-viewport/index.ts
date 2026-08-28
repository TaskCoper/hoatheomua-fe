/**
 * Reader for the image-viewport contract - the `#iv=1,x,y,w,h` fragment the admin app writes onto
 * stored image URLs. `types.ts`, `viewport-url.ts` and `viewport-layout.ts` are byte-identical
 * copies of `src/lib/image-viewport/` in the admin repo (taskcoper-fe), where the spec lives at
 * `docs/image-viewport.md`; keep them that way so drift is a plain `diff`. `scripts/verify-image-viewport.mjs`
 * asserts the guarantees the spec makes.
 *
 * Storefront code only ever decodes - `encodeImageViewport` is here for parity, not for use.
 * To render, use `shared/components/viewport-image.tsx`.
 */
export type { ImageViewport } from './types'
export { resolveViewportLayout } from './viewport-layout'
export type { ResolveViewportLayoutParams, ViewportLayout } from './viewport-layout'
export {
  clampImageViewport,
  decodeImageViewport,
  encodeImageViewport,
  FULL_FRAME_VIEWPORT,
  IMAGE_VIEWPORT_FRAGMENT_KEY,
  IMAGE_VIEWPORT_PRECISION,
  IMAGE_VIEWPORT_VERSION,
  isFullFrameViewport
} from './viewport-url'
