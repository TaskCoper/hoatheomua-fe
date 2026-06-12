import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import flowerImage from '@/public/images/flower.png'
import pedalsRight from '@/public/images/pedals-right.png'
import { ArrowUp01Icon, FavouriteIcon, Mail01Icon, QuoteUpIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'

const groups = [
  {
    title: 'Loại công việc',
    items: [
      { label: 'Toàn thời gian', count: 18, checked: true },
      { label: 'Bán thời gian', count: 6, checked: false },
      { label: 'Thực tập', count: 5, checked: false },
      { label: 'Freelance', count: 3, checked: false }
    ]
  },
  {
    title: 'Cấp bậc',
    items: [
      { label: 'Thực tập sinh', count: 6, checked: false },
      { label: 'Nhân viên', count: 15, checked: true },
      { label: 'Chuyên viên', count: 7, checked: false },
      { label: 'Quản lý', count: 3, checked: false }
    ]
  },
  {
    title: 'Địa điểm',
    items: [
      { label: 'TP. Hồ Chí Minh', count: 16, checked: true },
      { label: 'Hà Nội', count: 8, checked: false },
      { label: 'Đà Nẵng', count: 3, checked: false }
    ]
  }
]

export default function RecruitmentSidebar() {
  return (
    <aside className='w-full space-y-4 xl:sticky xl:top-6'>
      <Card className='w-full gap-5 border border-primary/10 bg-card py-5 shadow-sm shadow-primary/5 transition-shadow delay-100 duration-500 ease-out hover:shadow-md hover:shadow-primary/5'>
        <CardHeader className='grid-cols-[auto_1fr] items-start gap-3 px-5'>
          {/* <div className='grid size-12 shrink-0 place-items-center rounded-3xl bg-secondary/30 text-primary'>
            <HugeiconsIcon icon={Mail01Icon} strokeWidth={1.8} className='size-5' />
          </div> */}
          <div className='space-y-2'>
            <CardTitle className='text-lg font-semibold leading-tight text-primary'>
              Nhận thông báo tuyển dụng
            </CardTitle>
            <CardDescription className='leading-6'>Đừng bỏ lỡ cơ hội phù hợp với bạn.</CardDescription>
          </div>
        </CardHeader>

        <CardContent className='w-full space-y-3 px-5'>
          <div className='space-y-2'>
            <Input
              id='recruitment-email'
              type='email'
              placeholder='Nhập email của bạn'
              className='h-11 border border-border bg-background px-4 transition-colors delay-75 duration-500 ease-out hover:border-primary/25 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/15'
            />
          </div>
          <Button
            type='button'
            className='h-11 w-full transform-gpu transition-all duration-500 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'
          >
            <HugeiconsIcon icon={Mail01Icon} strokeWidth={1.8} className='size-4' />
            Đăng ký nhận tin
          </Button>
        </CardContent>
      </Card>

      <Card className='w-full gap-0 border border-primary/10 bg-card py-5 shadow-sm shadow-primary/5 transition-shadow delay-100 duration-500 ease-out hover:shadow-md hover:shadow-primary/5'>
        <CardContent className='w-full px-5'>
          {groups.map((group, groupIndex) => (
            <div key={group.title}>
              {groupIndex > 0 ? <DecorativeSidebarSeparator className='my-5' /> : null}
              <div className='mb-4 flex items-center justify-between gap-3'>
                <h3 className='text-sm font-semibold text-primary'>{group.title}</h3>
                <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={1.8} className='size-4 text-muted-foreground' />
              </div>

              <div className='space-y-3'>
                {group.items.map((item, itemIndex) => {
                  const checkboxId = `recruitment-filter-${groupIndex}-${itemIndex}`

                  return (
                    <Label
                      key={item.label}
                      htmlFor={checkboxId}
                      className='group -mx-2 flex cursor-pointer items-center gap-3 rounded-2xl px-2 py-1 text-sm font-normal leading-5 text-foreground transition-colors delay-75 duration-500 ease-out hover:bg-primary/5 focus-within:bg-primary/5'
                    >
                      <Checkbox id={checkboxId} defaultChecked={item.checked} aria-label={item.label} />
                      <span className='min-w-0 flex-1'>{item.label}</span>
                      <Badge
                        variant='secondary'
                        className='h-6 min-w-7 justify-center bg-secondary/30 text-muted-foreground transition-colors delay-75 duration-500 ease-out group-hover:bg-secondary/40'
                      >
                        {item.count}
                      </Badge>
                    </Label>
                  )
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className='relative w-full transform-gpu gap-4 overflow-hidden border border-primary/10 bg-primary/5 py-6 text-center shadow-sm shadow-primary/5 transition-all duration-700 ease-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/10'>
        <div className='pointer-events-none absolute -bottom-12 -left-12 z-0 size-40 opacity-25 blur-sm' aria-hidden='true'>
          <Image src={flowerImage} alt='' fill sizes='160px' className='object-contain' />
        </div>
        <div className='pointer-events-none absolute -right-8 -top-12 z-0 h-40 w-28 opacity-30 blur-sm' aria-hidden='true'>
          <Image src={pedalsRight} alt='' fill sizes='112px' className='object-contain' />
        </div>
        <div className='pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-card/80 via-card/45 to-card/20' aria-hidden='true' />
        <HugeiconsIcon
          icon={QuoteUpIcon}
          strokeWidth={1.4}
          className='absolute -right-2 -top-2 z-0 size-16 text-primary/10'
          aria-hidden='true'
        />
        <CardContent className='relative z-10 w-full px-6'>
          <p className='font-title text-base italic leading-7 text-primary'>
            “Mỗi đóa hoa là một câu chuyện. Mỗi con người là một mảnh ghép làm nên điều đẹp đẽ.”
          </p>
          <div className='mx-auto mt-5 flex size-9 items-center justify-center rounded-full border border-primary/20 bg-background/60 text-primary'>
            <HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.8} className='size-4' aria-hidden='true' />
          </div>
        </CardContent>
      </Card>
    </aside>
  )
}

function DecorativeSidebarSeparator({ className }: { className?: string }) {
  return (
    <div className={['relative', className].filter(Boolean).join(' ')}>
      <Separator className='bg-primary/10' />
      <span className='absolute left-1/2 top-1/2 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-primary/10 bg-card text-primary shadow-sm'>
        <HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.8} className='size-3.5' aria-hidden='true' />
      </span>
    </div>
  )
}
