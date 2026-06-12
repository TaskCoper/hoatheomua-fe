import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Briefcase01Icon, Building02Icon, Money03Icon, Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

const filters = [
  {
    id: 'recruitment-branch',
    label: 'Chi nhánh',
    placeholder: 'Tất cả chi nhánh',
    values: ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng'],
    icon: Building02Icon
  },
  {
    id: 'recruitment-employment-type',
    label: 'Hình thức làm việc',
    placeholder: 'Tất cả hình thức',
    values: ['Toàn thời gian', 'Bán thời gian', 'Freelance'],
    icon: Briefcase01Icon
  },
  {
    id: 'recruitment-salary',
    label: 'Mức lương',
    placeholder: 'Tất cả mức lương',
    values: ['8 - 12 triệu', '12 - 18 triệu', 'Trên 18 triệu'],
    icon: Money03Icon
  }
]

export default function FilterSection() {
  return (
    <Card className='w-full gap-0 rounded-3xl border border-primary/10 bg-card/95 py-0 shadow-sm shadow-primary/5 transition-shadow delay-100 duration-500 ease-out hover:shadow-md hover:shadow-primary/5'>
      <CardContent className='grid w-full grid-cols-1 gap-2 p-3 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_1fr_auto]'>
        <div className='flex h-12 w-full min-w-0 items-center gap-2.5 rounded-2xl border border-border bg-background px-3 transition-all delay-75 duration-500 ease-out hover:border-primary/25 hover:bg-primary/5 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-ring/15'>
          <span className='flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
            <HugeiconsIcon icon={Search01Icon} strokeWidth={1.8} className='size-4' />
          </span>

          <div className='grid min-w-0 flex-1 gap-1'>
            <Label htmlFor='recruitment-position' className='h-4 text-xs font-semibold leading-4 text-foreground'>
              Vị trí
            </Label>

            <Input
              id='recruitment-position'
              placeholder='Tìm theo vị trí'
              className='h-5 rounded-none border-0 bg-transparent p-0 text-sm leading-5 shadow-none placeholder:text-muted-foreground focus-visible:border-0 focus-visible:ring-0'
            />
          </div>
        </div>

        {filters.map((filter) => (
          <div
            key={filter.label}
            className='flex h-12 w-full min-w-0 items-center gap-2.5 overflow-hidden rounded-2xl border border-border bg-background px-3 transition-all delay-75 duration-500 ease-out hover:border-primary/25 hover:bg-primary/5 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-ring/15'
          >
            <span className='flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
              <HugeiconsIcon icon={filter.icon} strokeWidth={1.8} className='size-4' />
            </span>

            <div className='grid min-w-0 max-w-full flex-1 gap-0.5 overflow-hidden'>
              <Label htmlFor={filter.id} className='h-4 truncate text-xs font-semibold leading-4 text-foreground'>
                {filter.label}
              </Label>

              <Select>
                <SelectTrigger
                  id={filter.id}
                  className='!h-5 !min-h-0 !w-full min-w-0 !justify-start gap-1.5 overflow-hidden rounded-none border-0 bg-transparent !p-0 text-sm leading-5 text-muted-foreground shadow-none whitespace-nowrap focus-visible:border-0 focus-visible:ring-0 data-[size=default]:!h-5 data-[size=sm]:!h-5 *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:truncate [&_svg]:ml-1 [&_svg]:size-4 [&_svg]:shrink-0'
                >
                  <SelectValue placeholder={filter.placeholder} />
                </SelectTrigger>

                <SelectContent className='border border-primary/10'>
                  {filter.values.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}

        <Button
          type='button'
          className='h-12 w-full transform-gpu rounded-2xl px-5 text-sm transition-all duration-500 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] xl:w-auto xl:min-w-28'
        >
          <HugeiconsIcon icon={Search01Icon} strokeWidth={1.8} className='size-4' />
          Tìm việc
        </Button>
      </CardContent>
    </Card>
  )
}
