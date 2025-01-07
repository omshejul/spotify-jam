import { containsInappropriateContent } from '@/app/lib/contentFilter'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { connectToDatabase } from '../../lib/mongodb'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const { db } = await connectToDatabase()
    
    const [locations, total] = await Promise.all([
        db.collection('locations')
            .find()
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray(),
        db.collection('locations').countDocuments()
    ])

    return NextResponse.json({
        locations,
        hasMore: skip + locations.length < total
    })
  } catch (error) {
    console.error('GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, jamLink } = await request.json()

    // Server-side content check
    if (containsInappropriateContent(name)) {
      return NextResponse.json(
        { error: 'Inappropriate content detected' }, 
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    
    const location = {
      name,
      jamLink,
      createdBy: session.user.email,
      createdByName: session.user.name,
      updatedBy: session.user.email,
      updatedByName: session.user.name,
      updatedAt: new Date(),
    }

    const result = await db.collection('locations').insertOne(location)
    return NextResponse.json({ ...location, _id: result.insertedId })
  } catch (error) {
    console.error('POST Error:', error)
    return NextResponse.json({ 
      error: 'Failed to create location',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 