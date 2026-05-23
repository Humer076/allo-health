import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const now = new Date()

  const expiredReservations = await prisma.reservation.findMany({
    where: {
      status: 'pending',
      expiresAt: { lt: now },
    },
  })

  for (const res of expiredReservations) {
    await prisma.$transaction([
      prisma.stock.update({
        where: {
          productId_warehouseId: {
            productId: res.productId,
            warehouseId: res.warehouseId,
          },
        },
        data: {
          reserved: { decrement: res.quantity },
        },
      }),
      prisma.reservation.update({
        where: { id: res.id },
        data: { status: 'released' },
      }),
    ])
  }

  return NextResponse.json({ released: expiredReservations.length })
}