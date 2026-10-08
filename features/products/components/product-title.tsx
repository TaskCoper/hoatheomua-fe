import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export default function ProductTitle({ name }: { name: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <h2 className='truncate font-title text-sm leading-tight font-bold text-primary sm:text-base'>{name}</h2>
        </TooltipTrigger>
        <TooltipContent
          side='top'
          sideOffset={8}
          className='rounded-xl border border-secondary/80 bg-card px-3 py-2 text-xs font-medium text-primary shadow-[0_0.6rem_1.4rem_rgb(81_108_108/16%)]'
          iconClassName='bg-card fill-card text-card'
        >
          {name}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
