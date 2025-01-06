import { connectToDatabase } from '@/app/lib/mongodb'
import { redirect } from 'next/navigation'

type PageProps = {
    params: Promise<{ slug: string }>
}

export default async function LinkRedirect({ params }: PageProps) {
    const { slug } = await params
    const { db } = await connectToDatabase()
    const location = await db.collection('locations').findOne({
        name: { $regex: new RegExp('^' + slug.replace(/-/g, ' ') + '$', 'i') }
    })

    if (!location?.jamLink) {
        // If no jam link found, try redirecting to location page
        const locationExists = await db.collection('locations').findOne({
            name: { $regex: new RegExp('^' + slug.replace(/-/g, ' ') + '$', 'i') }
        })

        if (!locationExists) {
            // If location doesn't exist, redirect to home
            redirect('/')
        }

        // If location exists but no jam link, redirect to location page
        redirect(`/locations/${slug}`)
    }

    redirect(location.jamLink)
} 