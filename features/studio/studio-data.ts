import type { StudioBouquetIngredient, StudioMockup, StudioStep } from '@/features/studio/types'

export const STUDIO_RIBBON_LABELS = ['RUY BĂNG']
export const STUDIO_WRAP_LABELS = ['GIẤY']

export const studioPriceFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
})

export const formatStudioPrice = (amount: number) => studioPriceFormatter.format(Math.round(amount))

export const STUDIO_WHOLE_QUANTITY_STEP = 1
export const STUDIO_DECIMAL_QUANTITY_STEP = 0.1

export const studioQuantityFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 })

export const roundStudioQuantity = (value: number) => Math.round(value * 1000) / 1000

export const formatStudioQuantity = (value: number) => studioQuantityFormatter.format(roundStudioQuantity(value))

export const formatStudioIngredientCounts = (ingredients: StudioBouquetIngredient[]) =>
  ingredients
    .map((item) =>
      item.extraQuantity > 0
        ? `${item.ingredient.name} +${formatStudioQuantity(item.extraQuantity)}`
        : item.ingredient.name
    )
    .join(' · ')

export const studioMockups: StudioMockup[] = [
  {
    id: 'sunday-home',
    name: 'Sunday at Home',
    description: 'Quiet light falling across a linen-covered table.',
    moods: ['Soft daylight', 'Calm', 'Intimate'],
    imageUrl: '/images/custom/custom-flower.png',
    story:
      'Inspired by slow Sunday mornings in a sunlit Saigon apartment-rumpled linen, a favorite ceramic vase and flowers gathered just after breakfast.',
    examples: [
      {
        imageUrl: '/images/custom/custom-flower.png',
        creator: 'Linh Nguyễn',
        avatar: '/images/about/avatar-1.png',
        title: 'For Mum, with love'
      },
      {
        imageUrl: '/images/5.webp',
        creator: 'Minh Anh',
        avatar: '/images/about/avatar-2.png',
        title: 'A quiet celebration'
      },
      { imageUrl: '/images/11.webp', creator: 'Thảo Vy', avatar: '/images/about/avatar-3.png', title: 'Sunday light' }
    ]
  },
  {
    id: 'garden-morning',
    name: 'Garden Morning',
    description: 'A fresh botanical setting with an easy morning glow.',
    moods: ['Fresh greens', 'Airy', 'Organic'],
    imageUrl: '/images/ContactFlower.png',
    story:
      'A garden just after watering, when leaves are deepest green and every petal catches the first clear light of the day.',
    examples: [
      { imageUrl: '/images/8.webp', creator: 'Ngọc Hân', avatar: '/images/about/avatar-2.png', title: 'First light' },
      { imageUrl: '/images/6.webp', creator: 'Mai Chi', avatar: '/images/about/avatar-3.png', title: 'Green wishes' },
      { imageUrl: '/images/9.webp', creator: 'Hà My', avatar: '/images/about/avatar-1.png', title: 'Morning garden' }
    ]
  },
  {
    id: 'atelier-light',
    name: 'Atelier Light',
    description: 'Warm studio textures composed like an editorial still life.',
    moods: ['Warm linen', 'Textural', 'Editorial'],
    imageUrl: '/images/about/studio-flatlay.png',
    story:
      'Drawn from the florist’s worktable: warm linen, honest tools and directional light that gives every stem an editorial presence.',
    examples: [
      {
        imageUrl: '/images/3.webp',
        creator: 'Bảo Trân',
        avatar: '/images/about/avatar-3.png',
        title: 'The arrangement'
      },
      {
        imageUrl: '/images/7.webp',
        creator: 'Khánh Linh',
        avatar: '/images/about/avatar-1.png',
        title: 'Studio study'
      },
      { imageUrl: '/images/10.webp', creator: 'Yến Nhi', avatar: '/images/about/avatar-2.png', title: 'Soft focus' }
    ]
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    description: 'Late afternoon sun stretching long across the room.',
    moods: ['Warm gold', 'Nostalgic', 'Low light'],
    imageUrl: '/images/2.webp',
    story:
      'The last honest hour of daylight, when everything turns amber and even a simple bouquet looks like it was lit on purpose.',
    examples: [
      { imageUrl: '/images/2.webp', creator: 'Phương Uyên', avatar: '/images/about/avatar-1.png', title: 'Late light' },
      { imageUrl: '/images/6.webp', creator: 'Diệu Anh', avatar: '/images/about/avatar-2.png', title: 'Amber hour' },
      { imageUrl: '/images/9.webp', creator: 'Tuệ Lâm', avatar: '/images/about/avatar-3.png', title: 'Before dusk' }
    ]
  },
  {
    id: 'cafe-corner',
    name: 'Café Corner',
    description: 'A marble table, a cold brew and flowers between conversations.',
    moods: ['Everyday', 'Urban', 'Candid'],
    imageUrl: '/images/3.webp',
    story:
      'The corner table you always try to get - flowers set down next to a half-finished drink, caught mid-afternoon on the way to somewhere else.',
    examples: [
      { imageUrl: '/images/3.webp', creator: 'Gia Hân', avatar: '/images/about/avatar-2.png', title: 'Table for two' },
      { imageUrl: '/images/11.webp', creator: 'Nhật Minh', avatar: '/images/about/avatar-1.png', title: 'Cold brew' },
      { imageUrl: '/images/5.webp', creator: 'Thu Trang', avatar: '/images/about/avatar-3.png', title: 'On the way' }
    ]
  },
  {
    id: 'birthday-table',
    name: 'Birthday Table',
    description: 'Candles, confetti and a bouquet at the centre of it all.',
    moods: ['Celebratory', 'Playful', 'Bright'],
    imageUrl: '/images/5.webp',
    story:
      'The moment before everyone sings - a cluttered, happy table where the flowers hold the middle and nobody minds the mess.',
    examples: [
      { imageUrl: '/images/8.webp', creator: 'Quỳnh Như', avatar: '/images/about/avatar-3.png', title: 'Make a wish' },
      { imageUrl: '/images/2.webp', creator: 'Anh Thư', avatar: '/images/about/avatar-1.png', title: 'One more year' },
      {
        imageUrl: '/images/10.webp',
        creator: 'Kim Ngân',
        avatar: '/images/about/avatar-2.png',
        title: 'The centrepiece'
      }
    ]
  },
  {
    id: 'tet-red',
    name: 'Tết Red',
    description: 'Lacquer red and gold, dressed for the first days of spring.',
    moods: ['Festive', 'Rich red', 'Traditional'],
    imageUrl: '/images/6.webp',
    story:
      'Tết at home: red envelopes on the sideboard, kumquat by the door and flowers chosen to last the whole visiting week.',
    examples: [
      { imageUrl: '/images/6.webp', creator: 'Hoài Thương', avatar: '/images/about/avatar-1.png', title: 'Năm mới' },
      {
        imageUrl: '/images/9.webp',
        creator: 'Bích Ngọc',
        avatar: '/images/about/avatar-2.png',
        title: 'First morning'
      },
      { imageUrl: '/images/3.webp', creator: 'Tú Anh', avatar: '/images/about/avatar-3.png', title: 'Lucky red' }
    ]
  },
  {
    id: 'teachers-day',
    name: 'Teachers’ Day',
    description: 'A classroom desk, chalk dust and flowers handed over shyly.',
    moods: ['Grateful', 'Simple', 'Daytime'],
    imageUrl: '/images/7.webp',
    story:
      'The twentieth of November, when every desk carries a bouquet and the room smells like paper, chalk and fresh stems.',
    examples: [
      { imageUrl: '/images/5.webp', creator: 'Lan Chi', avatar: '/images/about/avatar-2.png', title: 'Thank you, cô' },
      { imageUrl: '/images/7.webp', creator: 'Đức Huy', avatar: '/images/about/avatar-3.png', title: 'Front row' },
      {
        imageUrl: '/images/11.webp',
        creator: 'Mỹ Duyên',
        avatar: '/images/about/avatar-1.png',
        title: 'Chalk and roses'
      }
    ]
  },
  {
    id: 'womens-day',
    name: 'Women’s Day',
    description: 'Soft pinks arranged for someone who deserves the fuss.',
    moods: ['Tender', 'Blush', 'Generous'],
    imageUrl: '/images/8.webp',
    story:
      'Flowers bought on the way home and handed over without a speech, because the eighth of March never needed one.',
    examples: [
      { imageUrl: '/images/9.webp', creator: 'Hồng Nhung', avatar: '/images/about/avatar-1.png', title: 'For her' },
      { imageUrl: '/images/2.webp', creator: 'Thanh Trúc', avatar: '/images/about/avatar-3.png', title: 'No occasion' },
      {
        imageUrl: '/images/6.webp',
        creator: 'Vân Khánh',
        avatar: '/images/about/avatar-2.png',
        title: 'Eighth of March'
      }
    ]
  },
  {
    id: 'vietnamese-womens-day',
    name: 'Ngày 20/10',
    description: 'A warm Vietnamese living room, dressed for the women at home.',
    moods: ['Homely', 'Warm', 'Family'],
    imageUrl: '/images/9.webp',
    story:
      'The twentieth of October in a Vietnamese living room - tea already poured, flowers set beside the family photographs.',
    examples: [
      { imageUrl: '/images/10.webp', creator: 'Ngọc Diệp', avatar: '/images/about/avatar-2.png', title: 'For mẹ' },
      { imageUrl: '/images/8.webp', creator: 'Hải Yến', avatar: '/images/about/avatar-1.png', title: 'Living room' },
      { imageUrl: '/images/3.webp', creator: 'Trâm Anh', avatar: '/images/about/avatar-3.png', title: 'Twenty-tenth' }
    ]
  },
  {
    id: 'seasonal-window',
    name: 'Seasonal Window',
    description: 'Cool window light and whatever the season is giving.',
    moods: ['Seasonal', 'Cool light', 'Understated'],
    imageUrl: '/images/10.webp',
    story:
      'A north-facing window that flatters everything: no direct sun, just even light and the stems the market had that week.',
    examples: [
      { imageUrl: '/images/7.webp', creator: 'Minh Thư', avatar: '/images/about/avatar-3.png', title: 'This week' },
      {
        imageUrl: '/images/5.webp',
        creator: 'Kiều Trang',
        avatar: '/images/about/avatar-1.png',
        title: 'By the glass'
      },
      { imageUrl: '/images/11.webp', creator: 'An Nhiên', avatar: '/images/about/avatar-2.png', title: 'In season' }
    ]
  },
  {
    id: 'hanoi-wash',
    name: 'Hanoi Wash',
    description: 'Washed ochre walls and the softness of northern light.',
    moods: ['Muted ochre', 'Nostalgic', 'Architectural'],
    imageUrl: '/images/11.webp',
    story:
      'Old quarter walls in faded yellow, shutters half closed, and light that arrives softened by a hundred years of paint.',
    examples: [
      {
        imageUrl: '/images/11.webp',
        creator: 'Phương Thảo',
        avatar: '/images/about/avatar-1.png',
        title: 'Old quarter'
      },
      { imageUrl: '/images/9.webp', creator: 'Hữu Nam', avatar: '/images/about/avatar-2.png', title: 'Yellow wall' },
      { imageUrl: '/images/2.webp', creator: 'Lê Vy', avatar: '/images/about/avatar-3.png', title: 'Northern light' }
    ]
  },
  {
    id: 'evening-glow',
    name: 'Evening Glow',
    description: 'Lamplight, deep shadows and flowers after dark.',
    moods: ['Moody', 'Lamplit', 'Quiet'],
    imageUrl: '/images/5.webp',
    story:
      'One lamp on in an otherwise dark room, the bouquet catching the edge of it while everything else falls away.',
    examples: [
      { imageUrl: '/images/5.webp', creator: 'Tường Vi', avatar: '/images/about/avatar-2.png', title: 'After dark' },
      { imageUrl: '/images/3.webp', creator: 'Duy Khang', avatar: '/images/about/avatar-3.png', title: 'One lamp' },
      { imageUrl: '/images/8.webp', creator: 'Cẩm Tú', avatar: '/images/about/avatar-1.png', title: 'Late night' }
    ]
  },
  {
    id: 'paper-twine',
    name: 'Paper & Twine',
    description: 'Kraft paper, hand-tied twine, nothing else in the frame.',
    moods: ['Minimal', 'Craft', 'Neutral'],
    imageUrl: '/images/6.webp',
    story:
      'Stripped back to the wrap itself: brown paper creased by hand, twine tied twice, and the flowers doing all the talking.',
    examples: [
      { imageUrl: '/images/6.webp', creator: 'Hạ Vy', avatar: '/images/about/avatar-1.png', title: 'Hand-tied' },
      { imageUrl: '/images/10.webp', creator: 'Bảo Ngọc', avatar: '/images/about/avatar-2.png', title: 'Brown paper' },
      { imageUrl: '/images/7.webp', creator: 'Thiên Kim', avatar: '/images/about/avatar-3.png', title: 'Twice tied' }
    ]
  },
  {
    id: 'balcony-breeze',
    name: 'Balcony Breeze',
    description: 'City air, potted plants and a rail full of afternoon.',
    moods: ['Open air', 'Leafy', 'Relaxed'],
    imageUrl: '/images/8.webp',
    story:
      'A narrow balcony crowded with pots, laundry drying somewhere behind, and flowers propped against the rail to catch the breeze.',
    examples: [
      { imageUrl: '/images/8.webp', creator: 'Ánh Dương', avatar: '/images/about/avatar-3.png', title: 'On the rail' },
      { imageUrl: '/images/2.webp', creator: 'Nhã Uyên', avatar: '/images/about/avatar-1.png', title: 'City air' },
      { imageUrl: '/images/6.webp', creator: 'Quốc Bảo', avatar: '/images/about/avatar-2.png', title: 'Among the pots' }
    ]
  },
  {
    id: 'studio-noir',
    name: 'Studio Noir',
    description: 'A dark backdrop and one hard light, editorial and exact.',
    moods: ['High contrast', 'Dramatic', 'Editorial'],
    imageUrl: '/images/7.webp',
    story:
      'Black seamless, a single hard source and no props at all - the version you would print full-bleed on a cover.',
    examples: [
      { imageUrl: '/images/7.webp', creator: 'Vũ Hà', avatar: '/images/about/avatar-2.png', title: 'Hard light' },
      { imageUrl: '/images/11.webp', creator: 'Thùy Dương', avatar: '/images/about/avatar-3.png', title: 'Seamless' },
      { imageUrl: '/images/9.webp', creator: 'Đăng Khoa', avatar: '/images/about/avatar-1.png', title: 'Cover shot' }
    ]
  }
]

export const STUDIO_GENERATION_STAGE_KEYS = ['preparing', 'lighting', 'composing', 'finishing'] as const

export const STUDIO_GENERATION_STAGE_INTERVAL = 350
export const STUDIO_GENERATION_PENDING_STAGE = STUDIO_GENERATION_STAGE_KEYS.length - 1
export const STUDIO_GENERATION_DONE_STAGE = STUDIO_GENERATION_STAGE_KEYS.length

export const STUDIO_DETAIL_KEYS = ['size', 'wrapping', 'freshness', 'handover'] as const

export const STUDIO_STEP_KEYS = [
  { step: 1, key: 'ingredients' },
  { step: 2, key: 'compose' },
  { step: 3, key: 'mockup' },
  { step: 4, key: 'preview' },
  { step: 5, key: 'result' }
] as const

export const STUDIO_LAST_STEP: StudioStep = 5

/**
 * A session that already has a result only reopens what a regenerate can change, so its rail
 * is three stops instead of five - the flowers and the finishing are fixed by then.
 */
export const STUDIO_SESSION_STEP_KEYS = [
  { step: 1, key: 'style' },
  { step: 2, key: 'mockup' },
  { step: 3, key: 'result' }
] as const

export const STUDIO_SESSION_STYLE_STEP: StudioStep = 1
export const STUDIO_SESSION_SCENE_STEP: StudioStep = 2
export const STUDIO_SESSION_LAST_STEP: StudioStep = 3

export type StudioStepKey = (typeof STUDIO_STEP_KEYS)[number]['key'] | (typeof STUDIO_SESSION_STEP_KEYS)[number]['key']
