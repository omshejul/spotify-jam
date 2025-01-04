'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FiEdit, FiLoader, FiSave, FiX } from 'react-icons/fi'

interface EditJamLinkProps {
    locationId: string
    jamLink: string
    createdBy: string
}

export default function EditJamLink({ locationId, jamLink }: EditJamLinkProps) {
    const router = useRouter()
    const { data: session } = useSession()
    const [isEditing, setIsEditing] = useState(false)
    const [editedLink, setEditedLink] = useState(jamLink)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleUpdateJamLink = async () => {
        if (!session?.user?.email || !session.user.name) return

        setIsSubmitting(true)
        try {
            const response = await fetch(`/api/locations/${locationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jamLink: editedLink,
                    updatedBy: session.user.email,
                    updatedByName: session.user.name,
                }),
            })

            if (response.ok) {
                await response.json()
                setIsEditing(false)
                router.refresh()
            }
        } catch (error) {
            console.error('Failed to update Jam link:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!session?.user) {
        return null
    }

    return (
        <div className="mt-2">
            {isEditing ? (
                <div className="flex gap-2 items-center">
                    <input
                        type="url"
                        value={editedLink}
                        onChange={(e) => setEditedLink(e.target.value)}
                        className="flex-1 p-3 px-4 border rounded-2xl dark:bg-black dark:border-gray-700"
                        disabled={isSubmitting}
                    />
                    <button
                        onClick={handleUpdateJamLink}
                        disabled={isSubmitting}
                        className="px-4 py-2 dark:text-white border-2 border-solid border-black/[.08] dark:border-white/[.145] rounded-2xl hover:bg-green-500 transition-colors duration-300 ease-in-out"
                    >
                        {isSubmitting ? (
                            <FiLoader className="w-5 h-5 animate-spin" />
                        ) : (
                            <FiSave />
                        )}
                    </button>
                    <button
                        onClick={() => {
                            setIsEditing(false)
                            setEditedLink(jamLink)
                        }}
                        disabled={isSubmitting}
                        className="px-4 py-2 dark:text-white border-2 border-solid border-black/[.08] dark:border-white/[.145] rounded-2xl hover:bg-red-500 transition-colors duration-300 ease-in-out"
                    >
                        <FiX />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 dark:text-white border-2 border-solid border-black/[.08] dark:border-white/[.145] rounded-2xl hover:bg-sky-500 transition-colors duration-300 ease-in-out"
                >
                    <FiEdit />
                </button>
            )}
        </div>
    )
} 