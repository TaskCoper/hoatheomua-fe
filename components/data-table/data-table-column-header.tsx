import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import type { I18nKey } from '@/lib/i18n/types'
import { cn } from '@/shared/utils'
import { Cancel01Icon, ChevronDownIcon, ChevronUpIcon, EyeOffIcon, UnfoldMoreIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { Column } from '@tanstack/react-table'

interface DataTableColumnHeaderProps<TData, TValue> extends React.ComponentProps<typeof DropdownMenuTrigger> {
  column: Column<TData, TValue>
  label: I18nKey
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  label,
  className,
  ...props
}: DataTableColumnHeaderProps<TData, TValue>) {
  const { t } = useTranslation()

  if (!column.getCanSort() && !column.getCanHide()) {
    return <div className={cn(className)}>{t(label)}</div>
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          '-ml-1.5 flex h-8 items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-accent focus:outline-none focus:ring-1 focus:ring-ring data-[state=open]:bg-accent [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground',
          className
        )}
        {...props}
      >
        {t(label)}
        {column.getCanSort() &&
          (column.getIsSorted() === 'desc' ? (
            <HugeiconsIcon icon={ChevronDownIcon} />
          ) : column.getIsSorted() === 'asc' ? (
            <HugeiconsIcon icon={ChevronUpIcon} />
          ) : (
            <HugeiconsIcon icon={UnfoldMoreIcon} />
          ))}
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='min-w-28'>
        {column.getCanSort() && (
          <>
            <DropdownMenuCheckboxItem
              className='relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground'
              checked={column.getIsSorted() === 'asc'}
              onClick={() => column.toggleSorting(false)}
            >
              <HugeiconsIcon icon={ChevronUpIcon} />
              {t('dataTable.column.asc')}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              className='relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground'
              checked={column.getIsSorted() === 'desc'}
              onClick={() => column.toggleSorting(true)}
            >
              <HugeiconsIcon icon={ChevronDownIcon} />
              {t('dataTable.column.desc')}
            </DropdownMenuCheckboxItem>
            {column.getIsSorted() && (
              <DropdownMenuItem className='pl-2 [&_svg]:text-muted-foreground' onClick={() => column.clearSorting()}>
                <HugeiconsIcon icon={Cancel01Icon} />
                {t('dataTable.column.reset')}
              </DropdownMenuItem>
            )}
          </>
        )}
        {column.getCanHide() && (
          <DropdownMenuCheckboxItem
            className='relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground'
            checked={!column.getIsVisible()}
            onClick={() => column.toggleVisibility(false)}
          >
            <HugeiconsIcon icon={EyeOffIcon} />
            {t('dataTable.column.hide')}
          </DropdownMenuCheckboxItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
