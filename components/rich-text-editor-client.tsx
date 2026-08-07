'use client'

import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'
import type { RichTextEditorProps } from './rich-text-editor'

// TipTap + ProseMirror is ~600KB of JS and pulls its own stylesheet bundle
// (styles/tiptap.scss + every tiptap-node/*.scss). Its only consumer is the job
// application dialog, so importing it statically made the /recruitment *list*
// route - which most visitors never convert from - the heaviest page on the
// site. Loading it here means the cost lands when the dialog opens instead.
const RichTextEditor = dynamic(() => import('./rich-text-editor'), {
  ssr: false,
  loading: () => <Skeleton className='min-h-60 w-full rounded-md' />
})

export default function RichTextEditorClient(props: RichTextEditorProps) {
  return <RichTextEditor {...props} />
}
