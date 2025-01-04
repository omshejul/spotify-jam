import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET() {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
        return NextResponse.json({ isAdmin: false })
    }

    const isAdmin = session.user.email === process.env.ADMIN_EMAIL
    return NextResponse.json({ isAdmin })
} 