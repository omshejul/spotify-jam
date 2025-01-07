'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef, useCallback } from 'react'
import { FiEdit, FiExternalLink, FiLoader, FiPlusCircle, FiSave, FiSearch, FiTrash, FiX } from 'react-icons/fi'
import { JamLocation } from '../types/types'
import AddLocationModal from './AddLocationModal'
import TimeDisplay from './TimeDisplay'

const ITEMS_PER_PAGE = 10

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
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const observerTarget = useRef(null)
    const [searchResults, setSearchResults] = useState<JamLocation[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

    useEffect(() => {
        if (!searchQuery) {
            const fetchLocations = async () => {
                try {
                    const response = await fetch(`/api/locations?page=${page}&limit=${ITEMS_PER_PAGE}`)
                    if (response.ok) {
                        const data = await response.json()
                        if (page === 1) {
                            setLocations(data.locations)
                        } else {
                            setLocations(prev => [...prev, ...data.locations])
                        }
                        setHasMore(data.hasMore)
                    }
                } catch (error) {
                    console.error('Failed to fetch locations:', error)
                } finally {
                    setIsLoading(false)
                }
            }

            fetchLocations()
        }
    }, [page, searchQuery])

    // Debounced search handler
    const debouncedSearch = useCallback((query: string) => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }

        if (!query.trim()) {
            setSearchResults([])
            setIsSearching(false)
            return
        }

        setIsSearching(true)
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const response = await fetch(`/api/locations/search?q=${encodeURIComponent(query)}`)
                if (response.ok) {
                    const data = await response.json()
                    setSearchResults(data.locations)
                }
            } catch (error) {
                console.error('Search failed:', error)
            } finally {
                setIsSearching(false)
            }
        }, 300) // 300ms delay
    }, [])

    // Update search effect
    useEffect(() => {
        debouncedSearch(searchQuery)
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
        }
    }, [searchQuery, debouncedSearch])

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    setPage(prev => prev + 1)
                }
            },
            { threshold: 1.0 }
        )

        if (observerTarget.current) {
            observer.observe(observerTarget.current)
        }

        return () => observer.disconnect()
    }, [hasMore, isLoading])

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

            setLocations([data, ...locations])
            setIsModalOpen(false)
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to add location')
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

    const displayedLocations = searchQuery ? searchResults : locations

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
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {isSearching ? (
                            <FiLoader className="w-4 h-4 animate-spin text-gray-400" />
                        ) : (
                            <FiSearch className="w-4 h-4 text-gray-400" />
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    {displayedLocations.length === 0 ? (
                        <div className="text-center p-4 text-gray-500">
                            {isSearching ? 'Searching...' : 'No locations found'}
                        </div>
                    ) : (
                        <>
                            {displayedLocations.map((location) => (
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
                                                {location.jamLink && location.jamLink.length > 25 
                                                    ? `${location.jamLink.replace('https://', '').substring(0, 25)}...` 
                                                    : location.jamLink?.replace('https://', '') || 'No link'} <FiExternalLink />
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
                            ))}
                            {!searchQuery && (
                                <div ref={observerTarget} className="h-4">
                                    {isLoading && (
                                        <div className="flex justify-center p-4">
                                            <FiLoader className="w-6 h-6 animate-spin text-gray-500" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
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