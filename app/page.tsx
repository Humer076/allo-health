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

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
  }, [])

  const handleReserve = async (productId: string, warehouseId: string) => {
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, warehouseId, quantity: 1 }),
    })
    if (res.status === 409) {
      alert('❌ Not enough stock available')
      return
    }
    if (res.ok) {
      const reservation = await res.json()
      window.location.href = `/reservation/${reservation.id}`
    } else {
      alert('Error creating reservation')
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">🛍️ Products</h1>
      {products.map(product => (
        <div key={product.id} className="border p-4 mb-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold">{product.name}</h2>
          <p className="text-gray-600">SKU: {product.sku}</p>
          <div className="mt-3">
            {product.warehouses.map(wh => (
              <div key={wh.warehouseId} className="flex justify-between items-center mt-2 p-2 bg-gray-50 rounded">
                <span>
                  📦 {wh.warehouseName}: <strong>{wh.availableStock}</strong> available
                </span>
                <button
                  onClick={() => handleReserve(product.id, wh.warehouseId)}
                  disabled={wh.availableStock < 1}
                  className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Reserve
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </main>
  )
}