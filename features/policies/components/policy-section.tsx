'use client'

import type { IconSvgElement } from '@hugeicons/react'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'

export type PolicyBlock =
  | { type: 'paragraph'; text: ReactNode }
  | { type: 'list'; items: ReactNode[] }
  | { type: 'ordered'; items: ReactNode[] }
  | { type: 'note'; text: ReactNode }
  | { type: 'subheading'; text: ReactNode }

export type PolicySectionData = {
  number?: string
  icon?: IconSvgElement
  title: string
  intro?: ReactNode
  blocks?: PolicyBlock[]
}

const sectionFadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 140, damping: 18 } }
}

export default function PolicySection({ section }: { section: PolicySectionData }) {
  return (
    <motion.article
      variants={sectionFadeUp}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 240, damping: 20 }}
      className='group relative overflow-hidden rounded-2xl bg-card p-4 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 sm:rounded-3xl sm:p-6 lg:p-7'
    >
      {section.number ? (
        <span
          aria-hidden='true'
          className='pointer-events-none absolute top-1 right-2 font-title text-5xl font-bold leading-none text-secondary/35 transition-colors group-hover:text-secondary/55 sm:text-6xl lg:text-7xl'
        >
          {section.number}
        </span>
      ) : null}

      <header className='relative flex items-center gap-2.5 sm:gap-3'>
        {section.icon ? (
          <span className='grid size-9 shrink-0 place-items-center rounded-2xl bg-secondary/70 text-primary ring-1 ring-primary/10 sm:size-11'>
            <HugeiconsIcon icon={section.icon} className='size-4 sm:size-5' />
          </span>
        ) : null}

        <div className='min-w-0 space-y-0.5 sm:space-y-1'>
          {section.number ? (
            <p className='text-[0.625rem] font-semibold uppercase tracking-widest text-primary/70 sm:text-xs'>
              {section.number}
            </p>
          ) : null}
          <h2 className='text-balance font-title text-base font-bold leading-tight text-primary sm:text-lg lg:text-xl'>
            {section.title}
          </h2>
        </div>
      </header>

      {(section.intro || section.blocks?.length) && (
        <div className='relative mt-3.5 space-y-3 text-[0.8125rem] leading-relaxed text-foreground/90 sm:mt-4 sm:text-sm sm:leading-7'>
          {section.intro ? <p>{section.intro}</p> : null}

          {section.blocks?.map((block, index) => {
            switch (block.type) {
              case 'paragraph':
                return <p key={index}>{block.text}</p>
              case 'subheading':
                return (
                  <h3 key={index} className='pt-1 font-title text-sm font-bold text-primary sm:text-base'>
                    {block.text}
                  </h3>
                )
              case 'list':
                return (
                  <ul key={index} className='space-y-1.5 pl-0.5 sm:pl-1'>
                    {block.items.map((item, itemIndex) => (
                      <li key={itemIndex} className='flex gap-2 sm:gap-2.5'>
                        <span
                          aria-hidden='true'
                          className='mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-primary/70 sm:mt-2.5'
                        />
                        <span className='min-w-0 flex-1'>{item}</span>
                      </li>
                    ))}
                  </ul>
                )
              case 'ordered':
                return (
                  <ol key={index} className='space-y-1.5 pl-0.5 sm:pl-1'>
                    {block.items.map((item, itemIndex) => (
                      <li key={itemIndex} className='flex gap-2 sm:gap-2.5'>
                        <span className='mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-secondary text-[0.625rem] font-bold text-primary'>
                          {itemIndex + 1}
                        </span>
                        <span className='min-w-0 flex-1'>{item}</span>
                      </li>
                    ))}
                  </ol>
                )
              case 'note':
                return (
                  <p
                    key={index}
                    className='rounded-2xl border-l-4 border-primary/40 bg-secondary/35 px-3 py-2 text-[0.8125rem] italic text-foreground/85 sm:px-3.5 sm:py-2.5 sm:text-sm'
                  >
                    {block.text}
                  </p>
                )
              default:
                return null
            }
          })}
        </div>
      )}
    </motion.article>
  )
}
