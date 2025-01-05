import BottomNav from '@/app/components/BottomNav'
import EditJamLink from '@/app/components/EditJamLink'
import TimeDisplay from '@/app/components/TimeDisplay'
import Tooltip from '@/app/components/Tooltip'
import { connectToDatabase } from '@/app/lib/mongodb'
import { ObjectId } from 'mongodb'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import QRCode from 'qrcode'
import { FiExternalLink } from 'react-icons/fi'

interface Location {
    _id: ObjectId
    name: string
    jamLink: string
    createdBy: string
    createdByName: string
    updatedBy: string
    updatedByName: string
    updatedAt: Date
}

type PageProps = {
    params: Promise<{ slug: string }>
}

async function getLocationBySlug(slug: string) {
    const { db } = await connectToDatabase()
    const location = await db.collection('locations').findOne({
        name: { $regex: new RegExp('^' + slug.replace(/-/g, ' ') + '$', 'i') }
    })
    return location as Location | null
}

async function generateQR(text: string) {
    try {
        const darkOptions = {
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        }
        return await QRCode.toDataURL(text, darkOptions)
    } catch (err) {
        console.error('Error generating QR code:', err)
        return null
    }
}

export default async function LocationPage({ params }: PageProps) {
    const { slug } = await params
    const location = await getLocationBySlug(slug)

    if (!location) {
        notFound()
    }

    const locationData = {
        ...location,
        _id: location._id.toString(),
        updatedAt: new Date(location.updatedAt)
    }

    const qrCodeDataUrl = await generateQR(locationData.jamLink)

    return (<div className="flex flex-col items-center justify-between min-h-svh p-6">
        <div className="container mx-auto max-w-2xl">
            <div className="bg-white dark:bg-black p-6 rounded-2xl border border-solid border-black/[.08] dark:border-white/[.145]">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold">{locationData.name}</h1>
                    <Tooltip />
                </div>

                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Jam Link</h2>
                        <div className="flex flex-col">
                            <a
                                href={locationData.jamLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700 flex items-center gap-2"
                            >
                                {locationData.jamLink} <FiExternalLink />
                            </a>
                            <EditJamLink
                                locationId={locationData._id}
                                jamLink={locationData.jamLink}
                                createdBy={locationData.createdBy}
                            />
                        </div>
                    </div>

                    {qrCodeDataUrl && (
                        <div>
                            <h2 className="text-xl font-semibold mb-2">QR Code</h2>
                            <div className="flex flex-col justify-center items-center">
                                <div className="bg-white dark:bg-black">
                                    <Image
                                        src={qrCodeDataUrl}
                                        alt="QR Code for jam link"
                                        width={192}
                                        height={192}
                                        className="dark:invert"
                                    />
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    Scan to join the jam
                                </p>
                            </div>
                        </div>
                    )}

                    {/* <div>
                        <h2 className="text-xl font-semibold mb-2">Created By</h2>
                        <p>{location.createdByName}</p>
                    </div> */}

                    <div>
                        <h2 className="text-xl font-semibold mb-2">Last Updated</h2>
                        <p>
                            By {locationData.updatedByName} on{' '}
                            <TimeDisplay date={locationData.updatedAt} />
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <div className="grid place-items-center w-full container mx-auto max-w-2xl">
            <BottomNav />
        </div>
    </div>)
} 