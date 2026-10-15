import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import userService from '../services'

export function usePhoneOtp() {
  const [resendAt, setResendAt] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const request = useMutation({
    mutationFn: userService.requestPhoneOtp,
    retry: false,
    onSuccess: (data) => {
      setResendAt(Date.now() + data.resendAfterSeconds * 1000)
      setRemaining(data.resendAfterSeconds)
    }
  })
  useEffect(() => {
    if (!resendAt) return
    const timer = setInterval(() => setRemaining(Math.max(0, Math.ceil((resendAt - Date.now()) / 1000))), 1000)
    return () => clearInterval(timer)
  }, [resendAt])
  return { ...request, remaining }
}
