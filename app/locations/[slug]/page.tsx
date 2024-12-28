import { notFound } from 'next/navigation'
import { connectToDatabase } from '@/app/lib/mongodb'
import { FiEdit, FiExternalLink } from 'react-icons/fi'
import QRCode from 'qrcode'
import Link from 'next/link'
import Image from 'next/image'

type PageProps = {
    params: Promise<{ slug: string }>
}

async function getLocationBySlug(slug: string) {
    const { db } = await connectToDatabase()
    const location = await db.collection('locations').findOne({
        name: { $regex: new RegExp('^' + slug.replace(/-/g, ' ') + '$', 'i') }
    })
    return location
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

    const qrCodeDataUrl = await generateQR(location.jamLink)

    return (<div className="flex flex-col items-center justify-between min-h-svh p-6">
        <div className="container mx-auto px-4 max-w-2xl">
            <div className="bg-white dark:bg-black p-6 rounded-2xl border border-solid border-black/[.08] dark:border-white/[.145]">
                <h1 className="text-3xl font-bold mb-4">{location.name}</h1>
                
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Jam Link</h2>
                        <a 
                            href={location.jamLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 flex items-center gap-2"
                        >
                            {location.jamLink} <FiExternalLink />
                        </a>
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
                            By {location.updatedByName} on{' '}
                            {new Date(location.updatedAt).toLocaleDateString()} at{' '}
                            {new Date(location.updatedAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            })}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <Link
            href="/"
            className="rounded-2xl border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
        >
            <FiEdit className="mr-2" /> Go home to edit
        </Link>
    </div>

    )
} 