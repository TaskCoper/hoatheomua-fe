import { IS_UNDER_DEVELOPMENT } from '@/shared/feature-flags'

/**
 * Reserves the height of the fixed header so the page below it does not start
 * underneath. Includes the 2.5rem development stripe while that is up.
 */
export default function HeaderSpacer() {
  return (
    <div
      aria-hidden='true'
      className={IS_UNDER_DEVELOPMENT ? 'h-[6.5rem] sm:h-[7rem] lg:h-[7.5rem]' : 'h-16 sm:h-[4.5rem] lg:h-20'}
    />
  )
}
