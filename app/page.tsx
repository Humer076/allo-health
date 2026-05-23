  'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ShoppingBag, MapPin, Clock, Zap, Shield, 
  Truck, Star, TrendingUp, Package, CheckCircle,
  AlertCircle, Layers, CreditCard, RefreshCw
} from 'lucide-react'

type WarehouseStock = {
  warehouseId: string
  warehouseName: string
  availableStock: number
  location?: string
}

type Product = {
  id: string
  name: string
  sku: string
  price: number
  category: string
  rating: number
  description: string
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
      // Add mock data for professional look
      const enrichedProducts = data.map((p: any, i: number) => ({
        ...p,
        price: i === 0 ? 2999 : 19999,
        category: i === 0 ? 'Audio' : 'Wearables',
        rating: 4.5 + (i * 0.3),
        description: i === 0 
          ? 'Premium wireless headphones with noise cancellation and 30hr battery life'
          : 'Advanced smart watch with health tracking, GPS, and 7-day battery'
      }))
      setProducts(enrichedProducts)
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl animate-pulse mx-auto mb-4 flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-500">Loading premium products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-2">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Allo Health
                </span>
                <p className="text-xs text-gray-500">Premium Inventory</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>10 min hold</span>
              </div>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <Zap className="w-4 h-4" />
                <span>Real-time</span>
              </div>
              <div className="bg-gray-100 rounded-full px-3 py-1 text-sm">
                <span className="font-medium">India</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold mb-4"
              >
                Smart Inventory
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                  Reservation System
                </span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-blue-100 mb-6 text-lg"
              >
                Reserve now, pay later. Your items are held exclusively for 10 minutes.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">10 min exclusive hold</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">No payment upfront</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                  <Truck className="w-4 h-4" />
                  <span className="text-sm">Fast delivery</span>
                </div>
              </motion.div>
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden md:block"
            >
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex justify-between mb-4">
                  <span className="text-sm">Today's Stats</span>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Active Reservations</span>
                    <span className="font-bold">142</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Available Stock</span>
                    <span className="font-bold">8,234</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Conversion Rate</span>
                    <span className="font-bold text-green-300">↑ 23%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <p className="text-gray-500 mt-1">Shop our premium collection</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              {/* Product Image Area */}
              <div className="relative h-48 bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center">
                <Package className="w-20 h-20 text-white/20" />
                <div className="absolute top-4 right-4 bg-white/90 rounded-lg px-2 py-1 text-sm font-bold text-gray-900">
                  ₹{product.price.toLocaleString()}
                </div>
                <div className="absolute top-4 left-4 flex items-center gap-1 bg-yellow-400 rounded-lg px-2 py-1 text-xs font-bold">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{product.rating}</span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.sku}</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mt-2">{product.description}</p>

                {/* Warehouse Options */}
                <div className="mt-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    SELECT DELIVERY LOCATION
                  </p>
                  
                  {product.warehouses.map((wh, idx) => {
                    const isLowStock = wh.availableStock <= 2
                    const isOutOfStock = wh.availableStock === 0
                    const isReserving = reserving === `${product.id}-${wh.warehouseId}`
                    
                    return (
                      <div
                        key={wh.warehouseId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">{wh.warehouseName}</span>
                            {isLowStock && !isOutOfStock && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                                Only {wh.availableStock} left
                              </span>
                            )}
                            {isOutOfStock && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                Out of Stock
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Truck className="w-3 h-3" />
                              <span>Free delivery</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Shield className="w-3 h-3" />
                              <span>Secure</span>
                            </div>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleReserve(product.id, wh.warehouseId)}
                          disabled={isOutOfStock || !!isReserving}
                          className={`
                            px-5 py-2 rounded-xl font-medium transition-all flex items-center gap-2
                            ${isOutOfStock 
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                            }
                          `}
                        >
                          {isReserving ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Reserving...</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4" />
                              <span>Reserve Now</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    )
                  })}
                </div>

                {/* Trust Badges */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    <span>Pay on delivery</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" />
                    <span>Easy returns</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    <span>2 year warranty</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold mb-3">Allo Health</h4>
              <p className="text-sm text-gray-400">Smart inventory for modern retail</p>
            </div>
            <div>
              <h4 className="font-bold mb-3">Support</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>FAQs</li>
                <li>Shipping</li>
                <li>Returns</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Legal</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>Terms</li>
                <li>Privacy</li>
                <li>Security</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Follow Us</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>Twitter</li>
                <li>LinkedIn</li>
                <li>Instagram</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-400">
            © 2024 Allo Health. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
