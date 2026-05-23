'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, CheckCircle, XCircle, ShoppingBag, AlertTriangle, CreditCard, ArrowLeft } from 'lucide-react'

export default function ReservationPage() {
  const { id } = useParams()
  const router = useRouter()
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [percentageLeft, setPercentageLeft] = useState(100)

  useEffect(() => {
    // For demo, set 10 min from now
    const expiry = new Date()
    expiry.setMinutes(expiry.getMinutes() + 10)
    setExpiresAt(expiry)
  }, [id])

  useEffect(() => {
    if (!expiresAt) return
    
    const interval = setInterval(() => {
      const now = Date.now()
      const diff = expiresAt.getTime() - now
      const total = 10 * 60 * 1000 // 10 minutes in ms
      const percent = Math.max(0, (diff / total) * 100)
      setPercentageLeft(percent)
      
      if (diff <= 0) {
        setTimeLeft('Expired')
        clearInterval(interval)
      } else {
        const mins = Math.floor(diff / 60000)
        const secs = Math.floor((diff % 60000) / 1000)
        setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`)
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [expiresAt])

  const confirmPurchase = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reservations/${id}/confirm`, { method: 'POST' })
      if (res.status === 410) {
        alert('❌ Your reservation has expired!')
        router.push('/')
      } else if (res.ok) {
        alert('✅ Purchase confirmed! Thank you for shopping with us.')
        router.push('/')
      } else {
        alert('Error confirming purchase. Please try again.')
      }
    } catch (error) {
      alert('Network error. Please check your connection.')
    }
    setLoading(false)
  }

  const cancel = async () => {
    setLoading(true)
    try {
      await fetch(`/api/reservations/${id}/release`, { method: 'POST' })
      alert('❌ Reservation cancelled. Stock has been released.')
      router.push('/')
    } catch (error) {
      alert('Error cancelling reservation.')
    }
    setLoading(false)
  }

  const isExpired = timeLeft === 'Expired'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to products</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Status Banner */}
          <div className={`p-6 text-center ${
            isExpired ? 'bg-red-50' : 'bg-gradient-to-r from-blue-600 to-purple-600'
          }`}>
            {isExpired ? (
              <>
                <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-red-600">Reservation Expired</h2>
                <p className="text-red-500 mt-2">Your hold time has run out</p>
              </>
            ) : (
              <>
                <Clock className="w-16 h-16 text-white mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-white">Reservation Active</h2>
                <p className="text-blue-100 mt-2">Complete your purchase within</p>
              </>
            )}
          </div>

          {/* Timer */}
          {!isExpired && (
            <div className="p-8 text-center border-b border-gray-100">
              <div className="relative inline-block">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - percentageLeft / 100)}`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-gray-900">{timeLeft.split(':')[0]}</span>
                  <span className="text-2xl font-bold text-gray-900">:{timeLeft.split(':')[1]}</span>
                  <span className="text-xs text-gray-500 mt-1">minutes left</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Your reservation is held exclusively for you
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="p-8 space-y-4">
            {!isExpired ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmPurchase}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Confirm Purchase</span>
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={cancel}
                  disabled={loading}
                  className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Cancel Reservation</span>
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/')}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Browse Products</span>
              </motion.button>
            )}
          </div>

          {/* Info Note */}
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                Your reservation expires automatically after 10 minutes. 
                Stock will be released back to inventory if you don't complete the purchase.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
