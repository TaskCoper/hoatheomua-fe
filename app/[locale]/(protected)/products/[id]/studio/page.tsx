import StudioClient from '@/features/studio/components/studio-client'

export default async function StudioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <StudioClient productId={id} />
}
