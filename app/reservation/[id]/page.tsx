'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Clock, CheckCircle, XCircle, ShoppingBag, AlertTriangle, 
  CreditCard, ArrowLeft, Shield, Truck, Heart, 
  Zap, Timer, Lock
} from 'lucide-react'

export default function ReservationPage() {
  const { id } = useParams()
  const router = useRouter()
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [percentageLeft, setPercentageLeft] = useState(100)

  useEffect(() => {
    const expiry = new Date()
    expiry.setMinutes(expiry.getMinutes() + 10)
    setExpiresAt(expiry)
  }, [id])

  useEffect(() => {
    if (!expiresAt) return
    
    const interval = setInterval(() => {
      const now = Date.now()
      const diff = expiresAt.getTime() - now
      const total = 10 * 60 * 1000
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
        alert('✅ Order confirmed! You will receive a confirmation email shortly.')
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
  const minutes = timeLeft.split(':')[0]
  const seconds = timeLeft.split(':')[1]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to shop</span>
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Reservation Card */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Status Header */}
              <div className={`p-8 text-center ${
                isExpired 
                  ? 'bg-gradient-to-r from-red-500 to-red-600' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600'
              }`}>
                {isExpired ? (
                  <>
                    <AlertTriangle className="w-16 h-16 text-white mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white">Reservation Expired</h2>
                    <p className="text-white/80 mt-2">Your hold time has run out</p>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Timer className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Complete Your Purchase</h2>
                    <p className="text-white/80 mt-2">Your item is reserved exclusively for you</p>
                  </>
                )}
              </div>

              {/* Timer Section */}
              {!isExpired && (
                <div className="p-8 text-center border-b border-gray-100">
                  <div className="relative inline-block">
                    <svg className="w-48 h-48 transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="84"
                        stroke="#e5e7eb"
                        strokeWidth="12"
                        fill="none"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="84"
                        stroke="url(#gradient)"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 84}`}
                        strokeDashoffset={`${2 * Math.PI * 84 * (1 - percentageLeft / 100)}`}
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
                      <span className="text-5xl font-bold text-gray-900">{minutes}</span>
                      <span className="text-2xl font-bold text-gray-900">:{seconds}</span>
                      <span className="text-xs text-gray-500 mt-2">minutes remaining</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Lock className="w-4 h-4" />
                      <span>Exclusive hold</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-300 rounded-full" />
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Zap className="w-4 h-4" />
                      <span>Real-time stock</span>
                    </div>
                  </div>
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
                          <span>Confirm Order</span>
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
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>Continue Shopping</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Order Summary */}
          {!isExpired && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Order Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹2,999</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-blue-600">₹2,999</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 text-sm">Secure Reservation</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Your payment info is secure. You'll only be charged when you confirm.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Free Express Shipping</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Expected delivery: 2-3 business days
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
