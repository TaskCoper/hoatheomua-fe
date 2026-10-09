import type { ReactNode } from 'react'

type LegalDocumentProps = {
  appName: string
  title: string
  description: string
  children: ReactNode
}

export default function LegalDocument({ appName, title, description, children }: LegalDocumentProps) {
  return (
    <article className='mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-18'>
      <header className='border-b border-border/80 pb-8 sm:pb-10'>
        <p className='text-xs font-semibold uppercase tracking-[0.18em] text-primary/75'>{appName}</p>
        <h1 className='mt-3 text-balance font-title text-3xl font-bold leading-tight text-primary sm:text-4xl'>
          {title}
        </h1>
        <p className='mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base'>{description}</p>
      </header>

      <div className='mt-8 space-y-6 text-sm leading-7 text-foreground/90 sm:mt-10 sm:space-y-8 sm:text-base'>
        {children}
      </div>
    </article>
  )
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className='rounded-2xl bg-card p-5 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/7%)] ring-1 ring-foreground/5 sm:rounded-3xl sm:p-7'>
      <h2 className='font-title text-xl font-bold leading-tight text-primary sm:text-2xl'>{title}</h2>
      <div className='mt-4 space-y-3'>{children}</div>
    </section>
  )
}

export function LegalList({ children, ordered = false }: { children: ReactNode; ordered?: boolean }) {
  const List = ordered ? 'ol' : 'ul'

  return <List className={ordered ? 'list-decimal space-y-2 pl-5' : 'list-disc space-y-2 pl-5'}>{children}</List>
}
