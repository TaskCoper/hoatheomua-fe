import StudioSessionClient from '@/features/studio/components/studio-session-client'

export default async function StudioSessionPage({ params }: { params: Promise<{ id: string; sessionId: string }> }) {
  const { id, sessionId } = await params

  return <StudioSessionClient productId={id} sessionId={sessionId} />
}
