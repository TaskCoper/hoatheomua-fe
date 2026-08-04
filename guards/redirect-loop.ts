// Detects when a guard would redirect to the same path it is currently
// mounted on, causing an infinite redirect loop. Callers should bail
// (render null / pass children through) when this returns true.
export function isRedirectLoop(currentPathname: string, target: string, source: string): boolean {
  if (currentPathname !== target) return false

  console.error(
    `[guards] Redirect loop detected - ${source} would redirect to "${target}" ` +
      `which equals the current path. Check the guard's redirect target.`
  )

  return true
}
