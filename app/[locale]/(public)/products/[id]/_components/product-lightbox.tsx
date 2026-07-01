'use client'

import Lightbox, { type SlideImage } from 'yet-another-react-lightbox'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'

import 'yet-another-react-lightbox/plugins/thumbnails.css'
import 'yet-another-react-lightbox/styles.css'

interface ProductLightboxProps {
  open: boolean
  close: () => void
  index: number
  slides: SlideImage[]
  onView: (index: number) => void
  finite: boolean
}

export default function ProductLightbox({ open, close, index, slides, onView, finite }: ProductLightboxProps) {
  return (
    <Lightbox
      open={open}
      close={close}
      index={index}
      on={{ view: ({ index: viewIndex }) => onView(viewIndex) }}
      slides={slides}
      plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]}
      carousel={{ finite }}
      thumbnails={{ position: 'bottom', showToggle: true }}
      zoom={{ maxZoomPixelRatio: 3, scrollToZoom: true }}
    />
  )
}
