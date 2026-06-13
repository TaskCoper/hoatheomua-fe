import type { DataTableIcon } from '@/types/data-table.type'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import * as React from 'react'

interface DataTableIconViewProps extends Omit<React.SVGProps<SVGSVGElement>, 'strokeWidth'> {
  icon: DataTableIcon
  strokeWidth?: number
}

function isHugeiconsIcon(icon: DataTableIcon): icon is IconSvgElement {
  return Array.isArray(icon)
}

export function DataTableIconView({ icon, ...props }: DataTableIconViewProps) {
  if (isHugeiconsIcon(icon)) {
    return <HugeiconsIcon icon={icon} {...props} />
  }

  const Icon = icon

  return <Icon {...props} />
}
