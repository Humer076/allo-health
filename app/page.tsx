'use client'

import { useEffect, useState } from 'react'

type WarehouseStock = {
  warehouseId: string
  warehouseName: string
  availableStock: number
}

type Product = {
  id: string
  name: string
  sku: string
  warehouses: WarehouseStock[]
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [reserving, setReserving] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
  }, [])

  const handleReserve = async (productId: string, warehouseId: string) => {
    const key = `${productId}-${warehouseId}`
    setReserving(key)
    
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, warehouseId, quantity: 1 }),
    })
    
    if (res.status === 409) {
      alert('❌ Not enough stock available')
      setReserving(null)
      return
    }
    
    if (res.ok) {
      const reservation = await res.json()
      window.location.href = `/reservation/${reservation.id}`
    } else {
      alert('Error creating reservation')
      setReserving(null)
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading products...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.logo}>Allo Health</h1>
            <p style={styles.tagline}>Inventory Reservation System</p>
          </div>
          <div style={styles.badge}>
            <span style={styles.badgeText}>10 min hold</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.grid}>
          {products.map((product) => (
            <div key={product.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.productName}>{product.name}</h2>
                <span style={styles.sku}>{product.sku}</span>
              </div>
              
              <div style={styles.divider}></div>
              
              {product.warehouses.map((wh) => {
                const isLowStock = wh.availableStock <= 2
                const isOutOfStock = wh.availableStock === 0
                const isReserving = reserving === `${product.id}-${wh.warehouseId}`
                
                return (
                  <div key={wh.warehouseId} style={styles.warehouseRow}>
                    <div style={styles.warehouseInfo}>
                      <span style={styles.warehouseName}>{wh.warehouseName}</span>
                      <span style={{
                        ...styles.stockBadge,
                        ...(isOutOfStock ? styles.outOfStock : (isLowStock ? styles.lowStock : styles.inStock))
                      }}>
                        {isOutOfStock ? 'Out of Stock' : `${wh.availableStock} available`}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleReserve(product.id, wh.warehouseId)}
                      disabled={isOutOfStock || !!isReserving}
                      style={{
                        ...styles.reserveButton,
                        ...(isOutOfStock ? styles.buttonDisabled : {})
                      }}
                      onMouseEnter={(e) => {
                        if (!isOutOfStock) {
                          e.currentTarget.style.backgroundColor = '#1d4ed8'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isOutOfStock) {
                          e.currentTarget.style.backgroundColor = '#2563eb'
                        }
                      }}
                    >
                      {isReserving ? (
                        <span style={styles.buttonContent}>
                          <span style={styles.spinnerSmall}></span>
                          Reserving...
                        </span>
                      ) : (
                        <span>Reserve for 10 min</span>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

// Professional CSS styles
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '24px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
  },
  tagline: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '4px',
    margin: 0,
  },
  badge: {
    backgroundColor: '#dbeafe',
    padding: '6px 12px',
    borderRadius: '20px',
  },
  badgeText: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#1e40af',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '48px 24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
    gap: '32px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
    overflow: 'hidden',
    transition: 'box-shadow 0.2s ease',
  },
  cardHeader: {
    padding: '24px',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
  },
  productName: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  sku: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
    display: 'block',
  },
  divider: {
    height: '1px',
    backgroundColor: '#e5e7eb',
  },
  warehouseRow: {
    padding: '20px 24px',
    borderBottom: '1px solid #f3f4f6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  warehouseInfo: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '6px',
  },
  warehouseName: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#374151',
  },
  stockBadge: {
    fontSize: '13px',
    fontWeight: '500',
    padding: '2px 0',
  },
  inStock: {
    color: '#059669',
  },
  lowStock: {
    color: '#d97706',
  },
  outOfStock: {
    color: '#dc2626',
  },
  reserveButton: {
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '140px',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '3px solid #e5e7eb',
    borderTopColor: '#2563eb',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  spinnerSmall: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    border: '2px solid white',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    color: '#6b7280',
    fontSize: '14px',
  },
}

// Add keyframes to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `
  document.head.appendChild(style)
}
