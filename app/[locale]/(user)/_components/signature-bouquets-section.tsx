import flowerImage from '@/public/images/flower.png'
import { ShoppingBasket02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import { SparkleDivider } from './sparkle-dividier'

const SIGNATURE_FLOWERS = [
  'Peony — Paeonia lactiflora',
  'Orchid — Phalaenopsis Amabilis',
  'Calla Lily — Zantedeschia aethiopica',
  'Lily of the Valley — Convallaria Majalis',
  'Bird of Paradise — Strelitzia Reginae',
  'Hyacinth — Hyacinthus Orientalis',
  'Tulip (Premium Varieties) — Tulipa gesneriana',
  'Garden Rose (David Austin) — Rosa × Hybrida',
  'Anemone — Anemone Coronaria'
]

const SIGNATURE_BOUQUETS = [
  { id: 1, name: 'Hồng Cổ Điển', price: '550.000đ/Bó', imageClassName: 'scale-105 rotate-[-6deg]' },
  { id: 2, name: 'Hồng Phấn', price: '550.000đ/Bó', imageClassName: 'scale-110 rotate-[8deg]' },
  { id: 3, name: 'Đào Bung Nở', price: '550.000đ/Bó', imageClassName: 'scale-95 rotate-[2deg]' },
  { id: 4, name: 'Berry Ngọt Ngào', price: '550.000đ/Bó', imageClassName: 'scale-100 rotate-[-2deg]' },
  { id: 5, name: 'Hồng Pastel', price: '550.000đ/Bó', imageClassName: 'scale-105 rotate-[5deg]' },
  { id: 6, name: 'Hoa Dại', price: '550.000đ/Bó', imageClassName: 'scale-100 rotate-[-8deg]' }
]

export default function SignatureBouquetsSection() {
  return (
    <>
      <div className='my-4 sm:my-6 md:my-8 lg:my-10 space-y-2 overflow-hidden px-4'>
        <div className='mx-auto w-full max-w-7xl space-y-0.5 sm:space-y-1 md:space-y-1.5 lg:space-y-2'>
          <div className='flex items-center justify-start sm:justify-center gap-3'>
            <SparkleDivider
              className='min-w-0 max-w-96 flex-1 hidden sm:flex'
              iconClassName='sm:size-5 md:size-6 lg:size-7'
              color='#516c6c'
            />

            <h1 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold'>
              Bó Hoa Đặc Trưng
            </h1>

            <SparkleDivider
              className='min-w-0 max-w-96 flex-1 hidden sm:flex'
              iconClassName='sm:size-5 md:size-6 lg:size-7'
              direction='rtl'
              color='#516c6c'
            />
          </div>

          <p className='leading-relaxed mx-auto max-w-full sm:max-w-140 md:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground/80'>
            Được cắm thủ công tỉ mỉ bởi những nghệ nhân chuyên nghiệp với các loài hoa tươi mới nhất, mỗi bó hoa của
            chúng tôi đều mang đến vẻ đẹp, hương thơm và ấn tượng khó quên cho mọi dịp.
          </p>
        </div>
      </div>

      <section className='relative left-1/2 -translate-x-1/2 bg-background'>
        <div className='mx-auto grid w-full max-w-7xl gap-4 px-4 lg:grid-cols-12'>
          <div className='flex flex-col gap-2 items-center lg:items-start text-sm text-muted-foreground lg:col-span-5'>
            {SIGNATURE_FLOWERS.map((flower, index) => {
              const isActive = index === 2

              return (
                <button
                  key={flower}
                  type='button'
                  className={[
                    'block w-full sm:w-fit rounded-xl px-3 py-2 text-center lg:text-left text-xs sm:text-sm transition-colors',
                    isActive
                      ? 'bg-card font-bold text-primary shadow-[0_0.45rem_1.4rem_rgb(81_108_108/12%)]'
                      : 'hover:text-primary'
                  ].join(' ')}
                >
                  {flower}
                </button>
              )
            })}
          </div>

          <div className='grid gap-4 sm:gap-6 md:gap-8 lg:gap-10 grid-cols-2 lg:col-span-7 xl:grid-cols-3'>
            {SIGNATURE_BOUQUETS.map((bouquet, index) => {
              const isActive = index === 0

              return (
                <article key={bouquet.id} className={['relative h-60', isActive ? 'rounded-[1.75rem]' : ''].join(' ')}>
                  {isActive ? (
                    <div
                      aria-hidden='true'
                      className='pointer-events-none absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-[1.9rem] border border-primary'
                    />
                  ) : null}

                  <div
                    className={[
                      'relative z-10 flex h-full flex-col justify-between rounded-[1.75rem] bg-card p-4 shadow-[0_0.8rem_2rem_rgb(81_108_108_/_7%)]',
                      isActive ? 'rounded-[1.75rem] bg-white shadow-[0_1rem_2.5rem_rgb(81_108_108_/_16%)]' : ''
                    ].join(' ')}
                  >
                    <div className='flex flex-1 items-center justify-center'>
                      <Image
                        src={flowerImage}
                        alt=''
                        className={`h-32 w-auto object-contain ${bouquet.imageClassName}`}
                        loading='lazy'
                      />
                    </div>

                    <div className='flex items-end justify-between gap-4'>
                      <div className='min-w-0'>
                        <h2 className='truncate text-base font-bold leading-tight text-foreground'>{bouquet.name}</h2>
                        <p className='text-xs font-medium text-foreground'>{bouquet.price}</p>
                      </div>

                      <button
                        type='button'
                        className='grid size-8 shrink-0 place-items-center rounded-full border border-foreground bg-card text-foreground transition-colors hover:bg-primary hover:text-primary-foreground'
                        aria-label={`Thêm ${bouquet.name} vào giỏ`}
                      >
                        <HugeiconsIcon icon={ShoppingBasket02Icon} className='size-4' />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
