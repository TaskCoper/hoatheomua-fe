'use client'

import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { useImageFrame } from '@/shared/components/viewport-image'
import { cn } from '@/shared/utils'
import { type ReactNode } from 'react'

type ViewportAvatarProps = {
  /** May carry an `#iv=` framing; it is stripped before reaching the `<img>`. */
  src: string | null | undefined
  alt: string
  /** Applied to the avatar root, which is also the box the framing is resolved against. */
  className?: string
  imageClassName?: string
  /** The `<AvatarFallback>` to show while loading, on error, or with no `src`. */
  children: ReactNode
}

/**
 * `<Avatar>` that honours the framing stored in `src` - authors crop these 1:1 in the admin, and
 * the centre of a photo is rarely the part they meant to show.
 *
 * Without a framing it renders exactly as a plain `<Avatar><AvatarImage>` pair does.
 */
export default function ViewportAvatar({ src, alt, className, imageClassName, children }: ViewportAvatarProps) {
  const { attachBox, attachImage, src: framedSrc, framed, style, onLoad } = useImageFrame(src)

  return (
    // `overflow-hidden` only when framed: the image then overflows the circle by design, and the
    // avatar root has no clipping of its own (Radix leans on the image's own rounding).
    <Avatar ref={attachBox} className={cn(className, framed && 'overflow-hidden')}>
      {framedSrc ? (
        <AvatarImage
          ref={attachImage}
          src={framedSrc}
          alt={alt}
          onLoad={onLoad}
          // Inline width/height beat the `size-full` class, so `aspect-square` is inert too.
          style={style}
          className={cn(imageClassName, framed && 'absolute max-w-none')}
        />
      ) : null}
      {children}
    </Avatar>
  )
}
