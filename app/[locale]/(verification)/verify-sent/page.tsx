'use client'

import { useSearchParams } from 'next/navigation'

export default function EmailResendPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  return <div>EmailResendPage - {email}</div>
}
