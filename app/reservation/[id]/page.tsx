'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ReservationPage() {
  const { id } = useParams()
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    const expiry = new Date()
    expiry.setMinutes(expiry.getMinutes() + 10)
    
    const interval = setInterval(() => {
      const diff = expiry.getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft('Expired')
        setExpired(true)
        clearInterval(interval)
      } else {
        const mins = Math.floor(diff / 60000)
        const secs = Math.floor((diff % 60000) / 1000)
        setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`)
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

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
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={expired ? styles.headerExpired : styles.headerActive}>
          <div style={styles.iconContainer}>
            <span style={styles.icon}>⏰</span>
          </div>
          <h1 style={styles.title}>
            {expired ? 'Reservation Expired' : 'Complete Your Purchase'}
          </h1>
          <p style={styles.subtitle}>
            {expired 
              ? 'Your hold time has run out' 
              : 'Your item is reserved exclusively for you'}
          </p>
        </div>

        {!expired && (
          <div style={styles.timerContainer}>
            <div style={styles.timerCircle}>
              <span style={styles.timerText}>{timeLeft || '10:00'}</span>
              <span style={styles.timerLabel}>minutes remaining</span>
            </div>
          </div>
        )}

        <div style={styles.actions}>
          {!expired ? (
            <>
              <button
                onClick={confirmPurchase}
                disabled={loading}
                style={styles.confirmButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#059669'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#10b981'
                }}
              >
                {loading ? 'Processing...' : '✓ Confirm Purchase'}
              </button>
              
              <button
                onClick={cancel}
                disabled={loading}
                style={styles.cancelButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb'
                }}
              >
                Cancel Reservation
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push('/')}
              style={styles.backButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1d4ed8'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb'
              }}
            >
              ← Back to Products
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    maxWidth: '500px',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '20px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.02)',
    overflow: 'hidden',
  },
  headerActive: {
    backgroundColor: '#2563eb',
    padding: '40px 24px',
    textAlign: 'center' as 'center',
  },
  headerExpired: {
    backgroundColor: '#dc2626',
    padding: '40px 24px',
    textAlign: 'center' as 'center',
  },
  iconContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: '64px',
    height: '64px',
    borderRadius: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  icon: {
    fontSize: '32px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'white',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.8)',
    marginTop: '8px',
  },
  timerContainer: {
    padding: '48px 24px',
    textAlign: 'center' as 'center',
    borderBottom: '1px solid #e5e7eb',
  },
  timerCircle: {
    width: '200px',
    height: '200px',
    borderRadius: '100px',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
  },
  timerText: {
    fontSize: '48px',
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'monospace',
  },
  timerLabel: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
  },
  actions: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '12px',
  },
  confirmButton: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '14px 24px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  cancelButton: {
    backgroundColor: '#f9fafb',
    color: '#374151',
    border: '1px solid #e5e7eb',
    padding: '14px 24px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  backButton: {
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '14px 24px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
}
