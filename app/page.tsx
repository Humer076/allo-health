'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Package, MapPin, Clock, ShoppingBag, CheckCircle, AlertCircle, Zap, Truck, Star } from 'lucide-react'

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
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReserve = async (productId: string, warehouseId: string) => {
    const key = `${productId}-${warehouseId}`
    setReserving(key)
    
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, warehouseId, quantity: 1 }),
      })
      
      if (res.status === 409) {
        alert('❌ Sorry, this item is no longer available!')
        fetchProducts()
        return
      }
      
      if (res.ok) {
        const reservation = await res.json()
        window.location.href = `/reservation/${reservation.id}`
      } else {
        alert('Something went wrong. Please try again.')
      }
    } catch (error) {
      alert('Network error. Please check your connection.')
    } finally {
      setReserving(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading amazing products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Allo Health</h1>
              <p className="text-blue-100 text-lg">Inventory & Order Fulfillment Platform</p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1 text-sm bg-white/20 rounded-full px-3 py-1">
                  <Clock className="w-4 h-4" />
                  <span>10 min reservation hold</span>
                </div>
                <div className="flex items-center gap-1 text-sm bg-white/20 rounded-full px-3 py-1">
                  <Zap className="w-4 h-4" />
                  <span>Real-time stock</span>
                </div>
              </div>
            </div>
            <ShoppingBag className="w-16 h-16 text-white/20" />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300"
            >
              {/* Product Header */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{product.name}</h2>
                    <p className="text-gray-400 text-sm mt-1">SKU: {product.sku}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-400" />
                </div>
              </div>

              {/* Warehouses */}
              <div className="p-6">
                <div className="space-y-4">
                  {product.warehouses.map((wh, idx) => {
                    const isLowStock = wh.availableStock <= 2
                    const isOutOfStock = wh.availableStock === 0
                    const isReserving = reserving === `${product.id}-${wh.warehouseId}`
                    
                    return (
                      <motion.div
                        key={wh.warehouseId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 rounded-lg p-2">
                            <Truck className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{wh.warehouseName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {isOutOfStock ? (
                                <span className="text-red-600 text-sm font-medium flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> Out of Stock
                                </span>
                              ) : isLowStock ? (
                                <span className="text-orange-600 text-sm font-medium flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> Only {wh.availableStock} left!
                                </span>
                              ) : (
                                <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" /> {wh.availableStock} available
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleReserve(product.id, wh.warehouseId)}
                          disabled={isOutOfStock || !!isReserving}
                          className={`
                            px-6 py-2 rounded-lg font-medium transition-all duration-200
                            ${isOutOfStock 
                              ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:from-blue-700 hover:to-purple-700'
                            }
                          `}
                        >
                          {isReserving ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Reserving...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>Reserve for 10 min</span>
                            </div>
                          )}
                        </motion.button>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Features */}
                <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Auto-expires in 10 min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    <span>Secure checkout</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
