'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FiEdit, FiExternalLink, FiLoader, FiPlusCircle, FiSave, FiSearch, FiTrash, FiX } from 'react-icons/fi'
import { JamLocation } from '../types/types'
import AddLocationModal from './AddLocationModal'
import TimeDisplay from './TimeDisplay'

export default function JamLocations() {
    const { data: session } = useSession()
    const [locations, setLocations] = useState<JamLocation[]>([])
    // const [newLocation, setNewLocation] = useState({ name: '', jamLink: '' })
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false) // Added to track form submission state
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const router = useRouter()
    const [loadingLocation, setLoadingLocation] = useState<string | null>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [deletingId, setDeletingId] = useState<string | null>(null)

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await fetch('/api/locations')
                if (response.ok) {
                    const data = await response.json()
                    setLocations(data)
                }
            } catch (error) {
                console.error('Failed to fetch locations:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchLocations()
    }, [])

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (session?.user) {
                const response = await fetch('/api/auth/check-admin')
                const data = await response.json()
                setIsAdmin(data.isAdmin)
            }
        }
        checkAdminStatus()
    }, [session])

    if (isLoading) {
        return (
            <div className="w-full max-w-2xl flex items-center justify-center min-h-[200px]">
                <FiLoader className="w-6 h-6 animate-spin text-gray-500" />
            </div>
        )
    }

    const handleAddLocation = async (name: string, jamLink: string) => {
        if (!session?.user?.email || !session.user.name) return

        setError(null)
        setIsSubmitting(true)

        try {
            const response = await fetch('/api/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    jamLink,
                    createdBy: session.user.email,
                    createdByName: session.user.name,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to add location')
            }

            setLocations([...locations, data])
            setIsModalOpen(false)
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to add location')
            console.error('Failed to add location:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdateJamLink = async (locationId: string, newJamLink: string) => {
        if (!session?.user?.email || !session.user.name) return

        try {
            const response = await fetch(`/api/locations/${locationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jamLink: newJamLink,
                    updatedBy: session.user.email,
                    updatedByName: session.user.name,
                }),
            })

            if (response.ok) {
                const updatedLocation = await response.json()
                setLocations(locations.map(loc =>
                    loc._id === locationId ? updatedLocation : loc
                ))
                setEditingId(null)
            }
        } catch (error) {
            console.error('Failed to update Jam link:', error)
        }
    }

    const handleDeleteLocation = async (locationId: string) => {
        if (!session?.user?.email) return

        if (!confirm('Are you sure you want to delete this location?')) return

        setDeletingId(locationId)
        try {
            const response = await fetch(`/api/locations/${locationId}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                setLocations(locations.filter(loc => loc._id !== locationId))
            }
        } catch (error) {
            console.error('Failed to delete location:', error)
        } finally {
            setDeletingId(null)
        }
    }

    const handleLocationClick = (locationName: string) => {
        setLoadingLocation(locationName)
        router.push(`/locations/${locationName.toLowerCase().replace(/\s+/g, '-')}`)
    }

    const canDelete = (createdBy: string) => {
        if (!session?.user?.email) return false
        return session.user.email === createdBy || isAdmin
    }

    const filteredLocations = locations.filter(location => 
        location.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <>
            <div className="w-full max-w-2xl space-y-6">
                {session?.user && (
                    <>
                        {error && (
                            <div className="p-4 text-red-700 bg-red-100 rounded-2xl">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full p-3 px-4 text-green-500 border border-solid border-black/[.08] dark:border-white/[.145] rounded-2xl hover:bg-green-100 hover:dark:bg-green-900 flex items-center justify-center space-x-2"
                        >
                            <FiPlusCircle className="mr-2" /> Add Location
                        </button>
                    </>
                )}

                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search locations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-3 px-4 pr-10 border border-solid border-black/[.08] dark:border-white/[.145] rounded-2xl dark:bg-black"
                    />
                    <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                <div className="space-y-4">
                    {filteredLocations.length === 0 ? (
                        <div className="text-center p-4 text-gray-500">
                            No locations found
                        </div>
                    ) : (
                        filteredLocations.map((location) => (
                            <div
                                key={location._id}
                                className="p-4 border rounded-2xl border-solid border-black/[.08] dark:border-white/[.145] space-y-2"
                            >
                                <button 
                                    onClick={() => handleLocationClick(location.name)}
                                    className="hover:text-blue-500 transition-colors flex items-center gap-2"
                                    disabled={loadingLocation === location.name}
                                >
                                    <h3 className="text-lg font-semibold">{location.name}</h3>
                                    {loadingLocation === location.name && (
                                        <FiLoader className="w-4 h-4 animate-spin" />
                                    )}
                                </button>
                                <div className="flex justify-between gap-2">
                                    {editingId !== location._id ? (
                                        <a
                                            href={location.jamLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center p-3 px-4 rounded-2xl border border-solid border-black/[.08] dark:border-white/[.145] text-blue-500 hover:text-blue-700"
                                        >
                                            {location.jamLink.length > 25 ? `${location.jamLink.replace('https://', '').substring(0, 25)}...` : location.jamLink.replace('https://', '')} <FiExternalLink />
                                        </a>
                                    ) : (
                                        <div className="flex gap-2 items-center justify-between w-full">
                                            <input
                                                type="url"
                                                value={location.jamLink}
                                                onChange={(e) => {
                                                    const newLocations = locations.map(loc =>
                                                        loc._id === location._id ? { ...loc, jamLink: e.target.value } : loc
                                                    )
                                                    setLocations(newLocations)
                                                }}
                                                className="flex-1 p-3 px-4 border rounded-2xl dark:bg-black dark:border-gray-700"
                                            />
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="px-4 py-2 dark:text-white border-2 border-solid border-black/[.08] dark:border-white/[.145] rounded-2xl hover:bg-red-500 transition-colors duration-300 ease-in-out"
                                            >
                                                <FiX />
                                            </button>
                                        </div>
                                    )}
                                    {session?.user && (
                                        <div className="flex gap-2">
                                            {editingId === location._id ? (
                                                <button
                                                    onClick={() => handleUpdateJamLink(location._id, location.jamLink)}
                                                    className="px-4 py-2 dark:text-white border-2 border-solid border-black/[.08] dark:border-white/[.145] rounded-2xl hover:bg-green-500 transition-colors duration-300 ease-in-out"
                                                >
                                                    <FiSave />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setEditingId(location._id)}
                                                    className="px-4 py-2 dark:text-white border-2 border-solid border-black/[.08] dark:border-white/[.145] rounded-2xl hover:bg-sky-500 transition-colors duration-300 ease-in-out"
                                                >
                                                    <FiEdit />
                                                </button>
                                            )}
                                            {canDelete(location.createdBy) && (
                                                <button
                                                    onClick={() => handleDeleteLocation(location._id)}
                                                    disabled={deletingId === location._id}
                                                    className="px-4 py-2 dark:text-white border-2 border-solid border-black/[.08] dark:border-white/[.145] rounded-2xl hover:bg-red-500 transition-colors duration-300 ease-in-out"
                                                >
                                                    {deletingId === location._id ? (
                                                        <FiLoader className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <FiTrash />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500">
                                    Last updated by {location.updatedByName} on{' '}
                                    <TimeDisplay date={new Date(location.updatedAt)} />
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <AddLocationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddLocation}
                isSubmitting={isSubmitting}
            />
        </>
    )
}