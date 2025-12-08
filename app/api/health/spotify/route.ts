import { connectToDatabase } from '@/app/lib/mongodb'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    await db.collection('locations').findOne(
      {},
      {
        projection: { _id: 1 },
        maxTimeMS: 5_000,
      }
    )

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Spotify health check failed:', error)

    return NextResponse.json(
      { status: 'unavailable' },
      { status: 503 }
    )
  }
}
