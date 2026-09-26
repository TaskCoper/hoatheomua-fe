import { Skeleton } from '@/components/ui/skeleton'

// Mirrors the StudioDesigner shell (header rail + preview/form columns) so the
// wait reads as the studio settling in rather than a blank page holding a spinner.
export default function StudioSkeleton({ label, steps = 5 }: { label: string; steps?: number }) {
  return (
    <div
      role='status'
      aria-live='polite'
      aria-busy='true'
      className='flex min-h-dvh flex-col overflow-x-hidden bg-background'
    >
      <span className='sr-only'>{label}</span>

      <header className='relative z-40 flex h-18 shrink-0 items-center border-b border-secondary/40 bg-background/85 px-2 backdrop-blur-md sm:px-4 lg:h-20 lg:px-6'>
        <Skeleton className='h-10 w-24 rounded-xl lg:h-12 lg:w-28' />

        <div
          aria-hidden='true'
          className='absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center sm:flex'
        >
          {Array.from({ length: steps }).map((_, index) => (
            <div key={index} className='flex items-center'>
              <div className='flex items-center gap-2 px-1.5 sm:px-2.5'>
                <Skeleton className='size-6 rounded-full' />
                <Skeleton className='hidden h-3 w-16 rounded-full md:block' />
              </div>
              {index < steps - 1 ? <span className='mx-0.5 h-px w-3 bg-border sm:w-5' /> : null}
            </div>
          ))}
        </div>

        <div className='flex flex-1 items-center justify-end gap-1'>
          <Skeleton className='size-10 rounded-full xl:w-24' />
          <Skeleton className='size-10 rounded-full xl:w-28' />
          <span aria-hidden='true' className='mx-1 h-6 w-px bg-border' />
          <Skeleton className='size-10 rounded-full xl:w-20' />
        </div>
      </header>

      <main
        aria-hidden='true'
        className='grid flex-1 lg:min-h-[calc(100dvh-5rem)] lg:grid-cols-[minmax(30rem,5fr)_minmax(0,6fr)]'
      >
        <div className='relative min-h-[21rem] overflow-hidden bg-secondary/40 sm:min-h-[30rem] lg:order-2 lg:h-[calc(100dvh-5rem)]'>
          <Skeleton className='size-full rounded-none bg-muted/60' />
        </div>

        <section className='relative bg-background lg:order-1 lg:h-[calc(100dvh-5rem)] lg:border-r lg:border-secondary/40'>
          <div className='mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 pb-28 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pb-10 xl:px-10'>
            <div className='space-y-3'>
              <Skeleton className='h-7 w-56 rounded-full' />
              <Skeleton className='h-4 w-full max-w-md rounded-full' />
            </div>

            <Skeleton className='h-12 w-full rounded-2xl' />

            <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className='aspect-4/5 w-full rounded-3xl' />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
