import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const stocks = await prisma.stock.findMany({
    include: {
      product: true,
      warehouse: true,
    },
  })

  const productsMap = new Map()

  stocks.forEach((stock) => {
    const available = stock.total - stock.reserved
    if (!productsMap.has(stock.productId)) {
      productsMap.set(stock.productId, {
        id: stock.product.id,
        name: stock.product.name,
        sku: stock.product.sku,
        warehouses: [],
      })
    }
    productsMap.get(stock.productId).warehouses.push({
      warehouseId: stock.warehouse.id,
      warehouseName: stock.warehouse.name,
      availableStock: available,
    })
  })

  return NextResponse.json(Array.from(productsMap.values()))
}