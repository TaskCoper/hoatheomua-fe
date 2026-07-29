'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// import MultiSelectField, { type Option } from '@/components/ui/multi-select-field'
import { Slider } from '@/components/ui/slider'
import { PRICE_STEP } from '@/features/products/constants'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import { cn } from '@/shared/utils'
import { motion, type Variants } from 'motion/react'
import { useState, type ReactNode } from 'react'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
}

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
})
const formatVnd = (value: number) => vndFormatter.format(value)

export type FilterChild = { categoryId: string; label: string; children?: FilterChild[] }

/** Collect every parent (node with children) id so the accordion opens expanded. */
const collectParentIds = (nodes: FilterChild[]): string[] =>
  nodes.flatMap((node) =>
    node.children && node.children.length > 0 ? [node.categoryId, ...collectParentIds(node.children)] : []
  )

type CategoryFilterPanelProps = {
  sectionId: string
  className?: string
  /** 'vertical' renders a sidebar; 'horizontal' renders a top filter bar. */
  orientation?: 'vertical' | 'horizontal'
  hasActiveFilters: boolean
  onReset: () => void
  // name
  showName?: boolean
  nameValue?: string
  onNameChange?: (value: string) => void
  // price
  showPrice?: boolean
  priceMax?: number
  priceValue?: [number, number]
  onPriceChange?: (value: [number, number]) => void
  onPriceCommit?: (value: [number, number]) => void
  // children facets
  filterChildren?: FilterChild[]
  checkedCats?: string[]
  onToggleChild?: (categoryId: string, checked: boolean) => void
  onCatsChange?: (categoryIds: string[]) => void
}

const fieldLabelClass = 'text-xs font-medium text-foreground'

export default function CategoryFilterPanel({
  sectionId,
  className,
  orientation = 'vertical',
  hasActiveFilters,
  onReset,
  showName = false,
  nameValue = '',
  onNameChange,
  showPrice = false,
  priceMax = 0,
  priceValue = [0, 0],
  onPriceChange,
  onPriceCommit,
  filterChildren = [],
  checkedCats = [],
  onToggleChild,
  onCatsChange
}: CategoryFilterPanelProps) {
  const { t } = useTranslation()
  const isHorizontal = orientation === 'horizontal'

  const [priceInputs, setPriceInputs] = useState<[string, string]>([String(priceValue[0]), String(priceValue[1])])
  const [prevPriceValue, setPrevPriceValue] = useState(priceValue)

  if (priceValue[0] !== prevPriceValue[0] || priceValue[1] !== prevPriceValue[1]) {
    setPrevPriceValue(priceValue)
    setPriceInputs([String(priceValue[0]), String(priceValue[1])])
  }

  const handlePriceInput = (index: 0 | 1, raw: string) => {
    setPriceInputs((prev) => (index === 0 ? [raw, prev[1]] : [prev[0], raw]))
    if (!onPriceChange) return
    const parsed = Number(raw)
    if (raw === '' || Number.isNaN(parsed)) return
    const next: [number, number] = index === 0 ? [parsed, priceValue[1]] : [priceValue[0], parsed]
    onPriceChange(next)
  }

  const handlePriceBlur = () => {
    if (!onPriceChange) return
    const clampedMin = Math.min(Math.max(priceValue[0], 0), priceMax)
    const clampedMax = Math.min(Math.max(priceValue[1], 0), priceMax)
    const ordered: [number, number] = clampedMin <= clampedMax ? [clampedMin, clampedMax] : [clampedMax, clampedMin]
    setPriceInputs([String(ordered[0]), String(ordered[1])])
    onPriceChange(ordered)
    onPriceCommit?.(ordered)
  }

  const nameBlock = showName ? (
    <div className={cn('space-y-1.5', isHorizontal && 'min-w-52 flex-1')}>
      <Label htmlFor={`${sectionId}-search`} className={fieldLabelClass}>
        {t('products.filter.search')}
      </Label>
      <Input
        id={`${sectionId}-search`}
        type='search'
        value={nameValue}
        onChange={(event) => onNameChange?.(event.target.value)}
        placeholder={t('products.filter.searchPlaceholder')}
        className='rounded-full'
      />
    </div>
  ) : null

  const handleCatsChange = (next: string[]) => {
    if (onCatsChange) {
      onCatsChange(next)
      return
    }
    // Fall back to per-child toggles by diffing against the current selection.
    const before = new Set(checkedCats)
    const after = new Set(next)
    for (const id of next) if (!before.has(id)) onToggleChild?.(id, true)
    for (const id of checkedCats) if (!after.has(id)) onToggleChild?.(id, false)
  }

  // const catOptions: Option[] = filterChildren.map((child) => ({ label: child.label, value: child.categoryId }))

  const handleCatCheckedChange = (categoryId: string, checked: boolean) => {
    const next = checked ? [...checkedCats, categoryId] : checkedCats.filter((id) => id !== categoryId)
    handleCatsChange(next)
  }

  // Render a category facet. Leaf nodes are plain checkboxes; nodes with
  // filterable children become an accordion whose header keeps the parent's own
  // checkbox (so the parent stays selectable) next to an expand toggle.
  const renderCat = (node: FilterChild): ReactNode => {
    const inputId = `${sectionId}-cat-${node.categoryId}`
    const checkbox = (
      <Checkbox
        id={inputId}
        checked={checkedCats.includes(node.categoryId)}
        onCheckedChange={(checked) => handleCatCheckedChange(node.categoryId, checked === true)}
      />
    )

    if (!node.children || node.children.length === 0) {
      return (
        <label
          key={node.categoryId}
          htmlFor={inputId}
          className='flex cursor-pointer items-center gap-2 text-sm text-foreground'
        >
          {checkbox}
          {node.label}
        </label>
      )
    }

    return (
      <AccordionItem key={node.categoryId} value={node.categoryId} className='border-b-0'>
        <div className='flex items-center gap-2'>
          {checkbox}
          <div className='min-w-0 flex-1'>
            <AccordionTrigger className='py-2 text-sm font-medium text-foreground hover:text-primary sm:text-sm'>
              {node.label}
            </AccordionTrigger>
          </div>
        </div>
        <AccordionContent className='pt-0 pb-1'>
          <div className='ml-2 space-y-2 border-l border-foreground/10 pl-3'>
            {node.children.map((child) => renderCat(child))}
          </div>
        </AccordionContent>
      </AccordionItem>
    )
  }

  const catsBlock =
    filterChildren.length > 0 ? (
      <div className={cn('space-y-1.5', isHorizontal && 'min-w-[18rem] flex-1')}>
        <span className={cn('block', fieldLabelClass)}>{t('products.filter.categoriesHeading')}</span>
        <Accordion
          type='multiple'
          defaultValue={collectParentIds(filterChildren)}
          className={cn('w-full', isHorizontal ? 'flex flex-wrap gap-x-4 gap-y-2' : 'space-y-2')}
        >
          {filterChildren.map((child) => renderCat(child))}
        </Accordion>
      </div>
    ) : null

  const priceBlock = showPrice ? (
    <div className={cn('space-y-2.5', isHorizontal && 'min-w-[16rem] flex-1')}>
      <span className={cn('block', fieldLabelClass)}>{t('products.filter.priceHeading')}</span>
      <div className='grid grid-cols-2 items-end gap-2'>
        <label className='flex flex-col gap-1 text-[0.6875rem] text-muted-foreground'>
          {t('products.filter.priceFrom')}
          <Input
            type='number'
            inputMode='numeric'
            min={0}
            max={priceMax}
            value={priceInputs[0]}
            onChange={(event) => handlePriceInput(0, event.target.value)}
            onBlur={handlePriceBlur}
            className='h-9 rounded-full text-sm'
          />
        </label>
        <label className='flex flex-col gap-1 text-[0.6875rem] text-muted-foreground'>
          {t('products.filter.priceTo')}
          <Input
            type='number'
            inputMode='numeric'
            min={0}
            max={priceMax}
            value={priceInputs[1]}
            onChange={(event) => handlePriceInput(1, event.target.value)}
            onBlur={handlePriceBlur}
            className='h-9 rounded-full text-sm'
          />
        </label>
      </div>
      <Slider
        min={0}
        max={priceMax}
        step={PRICE_STEP}
        value={priceValue}
        onValueChange={(next) => {
          if (next.length === 2) onPriceChange?.([next[0], next[1]])
        }}
        onValueCommit={(next) => {
          if (next.length === 2) onPriceCommit?.([next[0], next[1]])
        }}
        aria-label={t('products.filter.priceHeading')}
      />
      <div className='flex items-center justify-between text-[0.625rem] text-muted-foreground'>
        <span>{formatVnd(priceValue[0])}</span>
        <span>{formatVnd(priceValue[1])}</span>
      </div>
    </div>
  ) : null

  const titleBlock = <h3 className='font-title text-base font-semibold text-primary'>{t('products.filter.title')}</h3>

  const resetBlock = hasActiveFilters ? (
    <button
      type='button'
      onClick={onReset}
      className='shrink-0 cursor-pointer text-xs font-medium text-primary underline-offset-2 hover:underline'
    >
      {t('products.filter.reset')}
    </button>
  ) : null

  if (isHorizontal) {
    return (
      <motion.section
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-40px' }}
        variants={fadeUp}
        aria-label={t('products.filter.title')}
        className={cn('rounded-3xl bg-card/60 p-5 ring-1 ring-foreground/5 backdrop-blur-sm sm:p-6', className)}
      >
        {/* <div className='flex items-center justify-between gap-3'>
          {titleBlock}
          {resetBlock}
        </div> */}
        <div className='mt-4 flex flex-wrap items-start gap-x-5 gap-y-4'>
          {nameBlock}
          {catsBlock}
          {priceBlock}
        </div>
      </motion.section>
    )
  }

  return (
    <motion.aside
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, margin: '-40px' }}
      variants={fadeUp}
      aria-label={t('products.filter.title')}
      className={cn(
        'h-fit rounded-3xl bg-card/60 p-5 ring-1 ring-foreground/5 backdrop-blur-sm lg:sticky lg:top-24',
        className
      )}
    >
      <div className='flex items-center justify-between gap-2'>
        {titleBlock}
        {resetBlock}
      </div>

      <div className='mt-4 space-y-5'>
        {nameBlock}
        {catsBlock}
        {priceBlock}
      </div>
    </motion.aside>
  )
}
