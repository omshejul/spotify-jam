import { containsInappropriateContent } from '@/app/lib/contentFilter'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { connectToDatabase } from '../../lib/mongodb'

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const locations = await db.collection('locations').find().toArray()
    
    return NextResponse.json(locations)
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