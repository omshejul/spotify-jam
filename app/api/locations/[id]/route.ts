import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { connectToDatabase } from '../../../lib/mongodb'

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
  } catch {
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
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    
    const location = await db.collection('locations').findOne({ 
      _id: new ObjectId(id)
    })

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    // Allow both creator and admin to delete
    if (location.createdBy !== session.user.email && 
        session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await db.collection('locations').deleteOne({ _id: new ObjectId(id) })
    
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 })
  }
} 