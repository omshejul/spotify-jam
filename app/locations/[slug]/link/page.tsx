import { connectToDatabase } from '@/app/lib/mongodb'
import { redirect } from 'next/navigation'

export default async function LinkRedirect({ params }: { params: { slug: string } }) {
    const { db } = await connectToDatabase()
    const location = await db.collection('locations').findOne({
        name: { $regex: new RegExp('^' + params.slug.replace(/-/g, ' ') + '$', 'i') }
    })

    if (!location?.jamLink) {
        // If no jam link found, try redirecting to location page
        const locationExists = await db.collection('locations').findOne({
            name: { $regex: new RegExp('^' + params.slug.replace(/-/g, ' ') + '$', 'i') }
        })

        if (!locationExists) {
            // If location doesn't exist, redirect to home
            redirect('/')
        }

        // If location exists but no jam link, redirect to location page
        redirect(`/locations/${params.slug}`)
    }

    redirect(location.jamLink)
} 