import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const session = await getServerSession()
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { message } = await request.json()

        // Forward to Node-RED
        const nodeRedResponse = await fetch('https://nodered.omshejul.com/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: `\`\`\`Message from ${session.user.name} (${session.user.email}):\`\`\` 

${message}`
            })
        })

        if (!nodeRedResponse.ok) {
            throw new Error('Failed to forward message')
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error sending message:', error)
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }
} 