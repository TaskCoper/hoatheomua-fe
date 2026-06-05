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
      <div className='mt-8 mb-12 space-y-2 overflow-hidden px-4 sm:mt-10 sm:mb-16 sm:space-y-4 lg:space-y-6'>
        <div className='mx-auto w-full max-w-7xl space-y-2 sm:space-y-4 lg:space-y-6'>
          <div className='flex items-center justify-center gap-2 sm:gap-3 lg:gap-4'>
            <SparkleDivider
              className='hidden min-w-0 max-w-96 flex-1 sm:flex'
              iconClassName='size-4 sm:size-5 lg:size-7'
              color='#516c6c'
            />

            <h1 className='shrink-0 text-center font-title text-2xl font-bold sm:text-3xl lg:text-4xl'>
              Bó Hoa Đặc Trưng
            </h1>

            <SparkleDivider
              className='hidden min-w-0 max-w-96 flex-1 sm:flex'
              iconClassName='size-4 sm:size-5 lg:size-7'
              direction='rtl'
              color='#516c6c'
            />
          </div>

          <p className='mx-auto max-w-[50rem] text-center text-sm leading-relaxed text-foreground/80 sm:text-base'>
            Được cắm thủ công tỉ mỉ bởi những nghệ nhân chuyên nghiệp với các loài hoa tươi mới nhất, mỗi bó hoa của
            chúng tôi đều mang đến vẻ đẹp, hương thơm và ấn tượng khó quên cho mọi dịp.
          </p>
        </div>
      </div>

      <section className='relative left-1/2 w-screen -translate-x-1/2 bg-background'>
        <div className='mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-5 lg:grid-cols-[22rem_1fr] lg:gap-20'>
          <div className='space-y-2 pt-1 text-sm text-muted-foreground sm:space-y-3 sm:text-base lg:space-y-4'>
            {SIGNATURE_FLOWERS.map((flower, index) => {
              const isActive = index === 2

              return (
                <button
                  key={flower}
                  type='button'
                  className={[
                    'block max-w-full rounded-xl px-3 py-2 text-left transition-colors',
                    isActive
                      ? 'bg-card font-bold text-primary shadow-[0_0.45rem_1.4rem_rgb(81_108_108_/_12%)]'
                      : 'hover:text-primary'
                  ].join(' ')}
                >
                  {flower}
                </button>
              )
            })}
          </div>

          <div className='grid gap-8 sm:grid-cols-2 sm:gap-10 xl:grid-cols-3 xl:gap-x-14 xl:gap-y-14'>
            {SIGNATURE_BOUQUETS.map((bouquet, index) => (
              <article
                key={bouquet.id}
                className={[
                  'relative flex h-60 flex-col justify-between rounded-2xl bg-card p-4 shadow-[0_0.8rem_2rem_rgb(81_108_108_/_7%)] sm:h-66 sm:p-5',
                  index === 0 ? 'ring-1 ring-primary' : ''
                ].join(' ')}
              >
                <div className='flex flex-1 items-center justify-center'>
                  <Image
                    src={flowerImage}
                    alt=''
                    className={`h-32 w-auto object-contain sm:h-40 ${bouquet.imageClassName}`}
                    loading='lazy'
                  />
                </div>

                <div className='flex items-end justify-between gap-4'>
                  <div className='min-w-0'>
                    <h2 className='truncate text-base font-bold leading-tight text-foreground sm:text-lg'>
                      {bouquet.name}
                    </h2>
                    <p className='text-xs font-medium text-foreground'>{bouquet.price}</p>
                  </div>

                  <button
                    type='button'
                    className='grid size-8 shrink-0 place-items-center rounded-full border border-foreground bg-card text-foreground transition-colors hover:bg-primary hover:text-primary-foreground sm:size-9'
                    aria-label={`Thêm ${bouquet.name} vào giỏ`}
                  >
                    <HugeiconsIcon icon={ShoppingBasket02Icon} className='size-4' />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
