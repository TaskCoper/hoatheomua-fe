/**
 * Generates CSS @keyframes that reproduce motion's JS interpolation exactly.
 *
 * Mirrors, from motion 12.40.0:
 *  - motion-utils/easing/ease.mjs        easeInOut = cubicBezier(0.42, 0, 0.58, 1)
 *  - motion-dom/animation/generators/keyframes.mjs
 *      * defaultOffset  -> keyframes are spaced evenly across the duration
 *      * defaultEasing  -> the ease is applied PER SEGMENT, not across the whole run
 */

// --- motion's cubic-bezier solver (motion-utils/easing/cubic-bezier.mjs) ---
const calcBezier = (t, a1, a2) => (((1.0 - 3.0 * a2 + 3.0 * a1) * t + (3.0 * a2 - 6.0 * a1)) * t + 3.0 * a1) * t

const subdivide = (x, lower, upper, mX1, mX2) => {
  let currentX
  let currentT
  let i = 0
  do {
    currentT = lower + (upper - lower) / 2.0
    currentX = calcBezier(currentT, mX1, mX2) - x
    if (currentX > 0.0) upper = currentT
    else lower = currentT
  } while (Math.abs(currentX) > 1e-7 && ++i < 12)
  return currentT
}

function cubicBezier(mX1, mY1, mX2, mY2) {
  if (mX1 === mY1 && mX2 === mY2) return (t) => t
  return (t) => (t <= 0 ? 0 : t >= 1 ? 1 : calcBezier(subdivide(t, 0, 1, mX1, mX2), mY1, mY2))
}

const EASING = {
  easeInOut: cubicBezier(0.42, 0, 0.58, 1),
  easeIn: cubicBezier(0.42, 0, 1, 1),
  easeOut: cubicBezier(0, 0, 0.58, 1),
  linear: (t) => t
}

/** Value of one motion keyframe track at elapsed time `t` seconds (loops forever). */
function track(kf, duration, ease, delay = 0) {
  const easing = EASING[ease]
  return (t) => {
    let local = t - delay
    if (local < 0) return kf[0] // motion holds the first keyframe through the delay
    local %= duration
    const progress = local / duration
    const segments = kf.length - 1
    const scaled = progress * segments
    const i = Math.min(Math.floor(scaled), segments - 1)
    const within = easing(scaled - i)
    return kf[i] + (kf[i + 1] - kf[i]) * within
  }
}

const lcm = (a, b) => (a * b) / gcd(a, b)
function gcd(a, b) {
  // work in tenths so 2.6 / 0.3 style durations stay integral
  const A = Math.round(a * 10)
  const B = Math.round(b * 10)
  let x = A
  let y = B
  while (y) [x, y] = [y, x % y]
  return x / 10
}

/** Serialise one sample into a `transform:` / plain-property declaration set. */
function declarations(spec, t) {
  const transformParts = []
  const plain = []
  // motion's transformPropOrder: x, y, ... scale ... rotate
  if (spec.x || spec.y) {
    const x = spec.x ? spec.x.at(t) : 0
    const y = spec.y ? spec.y.at(t) : 0
    transformParts.push(`translate3d(${fmt(x)}px, ${fmt(y)}px, 0)`)
  }
  if (spec.scale) transformParts.push(`scale(${fmt(spec.scale.at(t))})`)
  if (spec.rotate) transformParts.push(`rotate(${fmt(spec.rotate.at(t))}deg)`)
  if (transformParts.length) plain.push(`transform: ${transformParts.join(' ')};`)
  if (spec.opacity) plain.push(`opacity: ${fmt(spec.opacity.at(t))};`)
  return plain
}

const fmt = (n) => {
  const r = Math.round(n * 1000) / 1000
  return Object.is(r, -0) ? 0 : r
}

/**
 * Adaptive sampling: keep bisecting any interval where straight-line
 * interpolation between the endpoints deviates from motion's real curve
 * by more than `tol` (px for translate, deg for rotate, 1e-3 for scale/opacity).
 */
function samplePoints(spec, period, tol) {
  const channels = Object.entries(spec).map(([name, ch]) => ({
    name,
    at: ch.at,
    offsets: ch.offsets,
    // scale/opacity are unitless; weight them so tolerance is meaningful
    weight: name === 'scale' || name === 'opacity' ? 200 : 1
  }))

  const err = (a, b, m) =>
    Math.max(
      ...channels.map((c) => {
        const lerp = c.at(a) + ((c.at(b) - c.at(a)) * (m - a)) / (b - a)
        return Math.abs(lerp - c.at(m)) * c.weight
      })
    )

  const points = new Set([0, period])
  const refine = (a, b, depth) => {
    if (depth > 9) return
    const m = (a + b) / 2
    // Check two probes, not one: on these symmetric curves the exact midpoint
    // frequently lands on the chord by coincidence, which would stop refinement
    // while the rest of the interval is still badly approximated.
    if (err(a, b, m) <= tol && err(a, b, (a + m) / 2) <= tol && err(a, b, (m + b) / 2) <= tol) return
    points.add(m)
    refine(a, m, depth + 1)
    refine(m, b, depth + 1)
  }
  // Seed with every track's keyframe boundary, repeated across the whole cycle,
  // so each track's corners survive regardless of the composite period.
  for (const ch of channels) {
    for (const o of ch.offsets ?? []) {
      for (let base = 0; base + o <= period + 1e-9; base += ch.trackDuration ?? period) {
        points.add(Math.round((base + o) * 1e6) / 1e6)
        if (!ch.trackDuration) break
      }
    }
  }
  const seeds = [...points].sort((x, y) => x - y)
  for (let i = 0; i < seeds.length - 1; i++) refine(seeds[i], seeds[i + 1], 0)
  return [...points].sort((x, y) => x - y)
}

/**
 * `exact` mode: every track shares the same duration AND keyframe count, so the
 * offsets coincide and CSS's own per-segment ease-in-out reproduces motion 1:1.
 */
function build(name, tracks, { tol = 0.05 } = {}) {
  const durations = Object.values(tracks).map((t) => t.duration)
  const counts = Object.values(tracks).map((t) => t.keyframes.length)
  const delays = Object.values(tracks).map((t) => t.delay ?? 0)
  const eases = Object.values(tracks).map((t) => t.ease)
  const sameDuration = durations.every((d) => d === durations[0])
  const sameCount = counts.every((c) => c === counts[0])
  const noDelay = delays.every((d) => d === 0)
  const sameEase = eases.every((e) => e === eases[0])

  const spec = {}
  for (const [prop, t] of Object.entries(tracks)) {
    spec[prop] = {
      at: track(t.keyframes, t.duration, t.ease, t.delay ?? 0),
      offsets: t.keyframes.map((_, i) => (i / (t.keyframes.length - 1)) * t.duration),
      trackDuration: t.duration
    }
  }

  if (sameDuration && sameCount && noDelay && sameEase) {
    const n = counts[0] - 1
    const period = durations[0]
    const lines = []
    for (let i = 0; i <= n; i++) {
      const pct = fmt((i / n) * 100)
      lines.push(`  ${pct}% {`)
      for (const d of declarations(spec, (i / n) * period)) lines.push(`    ${d}`)
      lines.push('  }')
    }
    return {
      css: `@keyframes ${name} {\n${lines.join('\n')}\n}`,
      period,
      timing: eases[0] === 'linear' ? 'linear' : 'ease-in-out',
      mode: 'exact',
      stops: n + 1,
      stopTimes: Array.from({ length: n + 1 }, (_, i) => (i / n) * period)
    }
  }

  // composite: tracks disagree on duration/count -> sample the full repeating cycle
  const period = durations.reduce((a, b) => lcm(a, b))
  const pts = samplePoints(spec, period, tol)
  const lines = []
  for (const t of pts) {
    const pct = fmt((t / period) * 100)
    lines.push(`  ${pct}% {`)
    for (const d of declarations(spec, t)) lines.push(`    ${d}`)
    lines.push('  }')
  }
  return {
    css: `@keyframes ${name} {\n${lines.join('\n')}\n}`,
    period,
    timing: 'linear',
    mode: 'sampled',
    stops: pts.length,
    stopTimes: pts
  }
}

// ---------------------------------------------------------------------------
const E = 'easeInOut'
const SPECS = {
  // orders/page.tsx L77, cart/page.tsx L215
  'bob-tilt-sm': {
    y: { keyframes: [0, -6, 0], duration: 5, ease: E },
    rotate: { keyframes: [0, -3, 0, 3, 0], duration: 5, ease: E }
  },
  // products-hero-motion L177, about-hero L105, occasion-hero L198
  'bob-tilt-lg': {
    y: { keyframes: [0, -14, 0], duration: 7, ease: E },
    rotate: { keyframes: [0, 1.2, 0, -1.2, 0], duration: 7, ease: E }
  },
  // home/hero-section L38  (y 6s vs rotate 9s -> 18s composite)
  'hero-bob': {
    y: { keyframes: [0, -8, 0], duration: 6, ease: E },
    rotate: { keyframes: [0, 0.8, 0, -0.8, 0], duration: 9, ease: E }
  },
  // product-card L85      (y 4s vs rotate 6s -> 12s composite)
  'card-bob': {
    y: { keyframes: [0, -6, 0], duration: 4, ease: E },
    rotate: { keyframes: [0, -2, 0, 2, 0], duration: 6, ease: E }
  },
  // b2b-cta L40
  'numeral-drift-cta': {
    rotate: { keyframes: [0, 12, 0, -8, 0], duration: 10, ease: E },
    scale: { keyframes: [1, 1.08, 1], duration: 10, ease: E }
  },
  // about-brand-values L162
  'numeral-drift-value': {
    rotate: { keyframes: [0, 12, 0, -4, 0], duration: 10, ease: E },
    scale: { keyframes: [1, 1.06, 1], duration: 10, ease: E }
  },
  // products-hero-motion L105, about-press L153, occasion-hero L148
  'glow-pulse': {
    opacity: { keyframes: [0.45, 0.85, 0.45], duration: 2.6, ease: E },
    scale: { keyframes: [1, 1.08, 1], duration: 2.6, ease: E }
  },
  // products-hero-motion L189, about-hero L117
  'sway-soft': { rotate: { keyframes: [0, -2, 0, 2, 0], duration: 5, ease: E } },
  // news-view L295, about-product-lines L177, b2b-services L225
  'nudge-x': { x: { keyframes: [0, 6, 0], duration: 1.4, ease: E } },
  // about-hero L164
  'stamp-wiggle': { rotate: { keyframes: [0, 12, -12, 0], duration: 4, ease: E } },
  // about-hero L192
  'quote-pop-a': {
    rotate: { keyframes: [0, -12, 0, 8, 0], duration: 5, ease: E },
    scale: { keyframes: [1, 1.1, 1, 1.05, 1], duration: 5, ease: E }
  },
  // about-testimonials L122
  'quote-pop-b': {
    rotate: { keyframes: [0, -10, 0, 8, 0], duration: 6, ease: E },
    scale: { keyframes: [1, 1.1, 1, 1.05, 1], duration: 6, ease: E }
  },
  // about-testimonials L136
  'dot-pulse': {
    scale: { keyframes: [1, 1.6, 1], duration: 1.6, ease: E },
    opacity: { keyframes: [1, 0.4, 1], duration: 1.6, ease: E }
  },
  // about-testimonials L198
  'quote-sway': { rotate: { keyframes: [0, -6, 0, 4, 0], duration: 6, ease: E } },
  // about-product-lines L138
  'flower-wiggle': { rotate: { keyframes: [0, 12, -8, 0], duration: 3, ease: E } },
  // about-press L136
  'soft-pulse': { scale: { keyframes: [1, 1.015, 1], duration: 4, ease: E } },
  // about-brand-values L227
  'corner-drift-left': {
    y: { keyframes: [0, -4, 0], duration: 9, ease: E },
    rotate: { keyframes: [0, 2, 0], duration: 9, ease: E }
  },
  // about-brand-values L239
  'corner-drift-right': {
    y: { keyframes: [0, -3, 0], duration: 11, ease: E },
    rotate: { keyframes: [0, -2, 0], duration: 11, ease: E }
  },
  // about-vision-mission L53 / L62
  'quote-float-a': {
    y: { keyframes: [0, -6, 0], duration: 8, ease: E },
    rotate: { keyframes: [0, -4, 0, 4, 0], duration: 8, ease: E }
  },
  'quote-float-b': {
    y: { keyframes: [0, 6, 0], duration: 8, ease: E },
    rotate: { keyframes: [0, 4, 0, -4, 0], duration: 8, ease: E }
  }
}

/**
 * Verification: rebuild what the browser will actually render from the emitted
 * stops (piecewise-linear for `sampled`, per-segment ease-in-out for `exact`)
 * and compare it against motion's true curve on a dense grid.
 */
function verify(tracks, result) {
  const spec = {}
  for (const [prop, t] of Object.entries(tracks)) {
    spec[prop] = { at: track(t.keyframes, t.duration, t.ease, t.delay ?? 0) }
  }
  const stops = result.stopTimes
  const segEase = result.timing === 'linear' ? EASING.linear : EASING.easeInOut
  const worst = {}
  const N = 20000
  for (let k = 0; k <= N; k++) {
    const t = (k / N) * result.period
    let i = 0
    while (i < stops.length - 2 && stops[i + 1] < t) i++
    const a = stops[i]
    const b = stops[i + 1]
    const u = b === a ? 0 : segEase((t - a) / (b - a))
    for (const [prop, ch] of Object.entries(spec)) {
      const rendered = ch.at(a) + (ch.at(b) - ch.at(a)) * u
      const d = Math.abs(rendered - ch.at(t))
      worst[prop] = Math.max(worst[prop] ?? 0, d)
    }
  }
  return worst
}

const out = []
const summary = []
for (const [name, tracks] of Object.entries(SPECS)) {
  const r = build(name, tracks)
  out.push(r.css)
  const worst = verify(tracks, r)
  const dev = Object.entries(worst)
    .map(([p, d]) => `${p}:${d < 1e-9 ? '0' : d.toExponential(1)}`)
    .join(' ')
  summary.push(
    `${name.padEnd(20)} ${r.mode.padEnd(8)} ${String(r.period).padStart(5)}s ${r.timing.padEnd(11)} stops:${String(r.stops).padStart(3)}  max-dev ${dev}`
  )
}
console.error(summary.join('\n'))
console.log(out.join('\n\n'))
