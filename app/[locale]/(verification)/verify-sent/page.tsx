import VerifySentContent from '@/components/verfiy-sent-content'

export default async function EmailPendingPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams

  return <VerifySentContent email={email} />
}
