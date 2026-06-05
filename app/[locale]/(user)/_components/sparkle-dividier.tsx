import { CSSProperties, useId } from 'react'
import { twMerge } from 'tailwind-merge'

type SparkleDividerProps = {
  color?: CSSProperties['color']
  direction?: 'ltr' | 'rtl'
  className?: string
  iconClassName?: string
}

export function SparkleDivider({
  color = '#9F294A',
  direction = 'ltr',
  className,
  iconClassName
}: SparkleDividerProps) {
  const gradientId = useId().replace(/:/g, '')
  const isRtl = direction === 'rtl'

  const sparkle = (
    <svg
      className={twMerge('h-12 w-12 shrink-0 rotate-28', iconClassName)}
      viewBox='0 0 48 48'
      fill='none'
      aria-hidden='true'
    >
      <path
        d='
          M25 1
          C24.4 12.3 22.2 17.1 17.9 19.6
          C14.8 21.5 9.7 22.6 1 23.7
          C9.5 25.2 14.5 26.8 17.6 29.6
          C21.5 33 23.1 38.2 24.2 47
          C25.9 38.8 27.8 33.4 31.2 30.1
          C34.5 26.9 39.3 25.2 47 23.7
          C39.4 22.5 34.6 20.9 31.5 18.1
          C27.9 14.9 26.2 9.7 25 1
          Z
        '
        fill='currentColor'
      />
    </svg>
  )

  const dashedLine = (
    <svg
      className='h-2 min-w-0 flex-1 overflow-visible'
      viewBox='0 0 1000 8'
      preserveAspectRatio='none'
      aria-hidden='true'
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1={isRtl ? '1000' : '0'}
          y1='0'
          x2={isRtl ? '0' : '1000'}
          y2='0'
          gradientUnits='userSpaceOnUse'
        >
          <stop offset='0%' stopColor='currentColor' stopOpacity='0.04' />
          <stop offset='18%' stopColor='currentColor' stopOpacity='0.18' />
          <stop offset='42%' stopColor='currentColor' stopOpacity='0.4' />
          <stop offset='68%' stopColor='currentColor' stopOpacity='0.67' />
          <stop offset='88%' stopColor='currentColor' stopOpacity='0.88' />
          <stop offset='100%' stopColor='currentColor' stopOpacity='1' />
        </linearGradient>
      </defs>

      <path
        d='M0 4 H1000'
        stroke={`url(#${gradientId})`}
        strokeWidth='2'
        strokeDasharray='12 11'
        strokeLinecap='butt'
      />
    </svg>
  )

  return (
    <div className={twMerge('flex h-12 w-full items-center gap-0.75', className)} style={{ color }}>
      {isRtl ? (
        <>
          {sparkle}
          {dashedLine}
        </>
      ) : (
        <>
          {dashedLine}
          {sparkle}
        </>
      )}
    </div>
  )
}
