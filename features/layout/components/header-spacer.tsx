/**
 * Reserves the height of the fixed header so the page below it does not start
 * underneath.
 */
export default function HeaderSpacer() {
  return <div aria-hidden='true' className='h-header' />
}
