'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ReservationPage() {
  const { id } = useParams()
  const router = useRouter()
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/reservations/${id}`)
      .then(res => res.json())
      .then(data => {
        setExpiresAt(new Date(data.expiresAt))
      })
      .catch(() => {
        const fakeExpiry = new Date()
        fakeExpiry.setMinutes(fakeExpiry.getMinutes() + 10)
        setExpiresAt(fakeExpiry)
      })
  }, [id])

  useEffect(() => {
    if (!expiresAt) return
    const interval = setInterval(() => {
      const diff = expiresAt.getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft('Expired')
        clearInterval(interval)
      } else {
        const mins = Math.floor(diff / 60000)
        const secs = Math.floor((diff % 60000) / 1000)
        setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  const confirmPurchase = async () => {
    setLoading(true)
    const res = await fetch(`/api/reservations/${id}/confirm`, { method: 'POST' })
    if (res.status === 410) {
      alert('❌ Reservation expired')
      router.push('/')
    } else if (res.ok) {
      alert('✅ Purchase confirmed!')
      router.push('/')
    } else {
      alert('Error confirming')
    }
    setLoading(false)
  }

  const cancel = async () => {
    setLoading(true)
    await fetch(`/api/reservations/${id}/release`, { method: 'POST' })
    alert('Cancelled')
    router.push('/')
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">📝 Reservation</h1>
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <p className="text-lg">Time remaining:</p>
        <p className="font-mono text-3xl font-bold text-center my-3">{timeLeft || 'Loading...'}</p>
      </div>
      <div className="mt-6 space-x-4 flex justify-center">
        <button
          onClick={confirmPurchase}
          disabled={loading || timeLeft === 'Expired'}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
        >
          💳 Confirm Purchase
        </button>
        <button
          onClick={cancel}
          disabled={loading}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
        >
          ❌ Cancel
        </button>
      </div>
    </div>
  )
}