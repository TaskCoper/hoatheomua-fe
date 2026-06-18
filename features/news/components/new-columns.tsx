import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Checkbox } from '@/components/ui/checkbox'
import type { TranslationFunction } from '@/lib/i18n/dictionary-provider'
import { Link } from '@/lib/i18n/navigation'
import { SearchIcon } from '@hugeicons/core-free-icons'
import { ColumnDef } from '@tanstack/react-table'
import { NewRow } from '../types'

export const getColumns = (t: TranslationFunction): ColumnDef<NewRow>[] => {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          aria-label={t('admin.news.columns.selectAll')}
          className='translate-y-0.5'
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={t('admin.news.columns.selectRow')}
          className='translate-y-0.5'
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 30
    },
    {
      id: 'title',
      accessorKey: 'title',
      meta: {
        label: 'admin.news.columns.title',
        placeholder: 'admin.news.columns.titlePlaceholder',
        variant: 'text',
        icon: SearchIcon
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='admin.news.columns.title' />,
      cell: ({ row }) => (
        <Link href={row.original.id} className='hover:underline'>
          <p className='w-full truncate max-w-125 xl:max-w-none'>{row.original.title}</p>
        </Link>
      ),
      enableSorting: true,
      enableHiding: false,
      enableColumnFilter: true,
      size: 150
    }
  ]
}
