import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectToDatabase } from '../../../lib/mongodb'
import { ObjectId } from 'mongodb'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jamLink, updatedBy, updatedByName } = await request.json()
    const { db } = await connectToDatabase()
    
    const result = await db.collection('locations').findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          jamLink,
          updatedBy,
          updatedByName,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    )

    if (!result) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    
    // Only allow deletion by the creator
    const location = await db.collection('locations').findOne({ 
      _id: new ObjectId(id)
    })

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    if (location.createdBy !== session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await db.collection('locations').deleteOne({ _id: new ObjectId(id) })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 })
  }
} 