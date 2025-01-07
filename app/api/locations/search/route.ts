import { connectToDatabase } from '@/app/lib/mongodb'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const query = searchParams.get('q')

        if (!query) {
            return NextResponse.json({ locations: [] })
        }

        const { db } = await connectToDatabase()
        
        const locations = await db.collection('locations')
            .find({
                name: { $regex: query, $options: 'i' }
            })
            .sort({ updatedAt: -1 })
            .toArray()

        return NextResponse.json({ locations })
    } catch (error) {
        console.error('Search Error:', error)
        return NextResponse.json({ error: 'Failed to search locations' }, { status: 500 })
    }
} 