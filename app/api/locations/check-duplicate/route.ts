import { connectToDatabase } from '@/app/lib/mongodb'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { name } = await request.json()
        const { db } = await connectToDatabase()

        const existingLocation = await db.collection('locations').findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        })

        return NextResponse.json({ exists: !!existingLocation })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to check location' }, { status: 500 })
    }
} 