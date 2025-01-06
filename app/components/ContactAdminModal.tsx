'use client'

import { useState } from 'react'
import { FiLoader, FiX } from 'react-icons/fi'

interface ContactAdminModalProps {
    isOpen: boolean
    onClose: () => void
}

type Status = {
    type: 'success' | 'error' | null
    message: string | null
}

export default function ContactAdminModal({ isOpen, onClose }: ContactAdminModalProps) {
    const [message, setMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [status, setStatus] = useState<Status>({ type: null, message: null })

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus({ type: null, message: null })
        setIsSubmitting(true)

        try {
            const response = await fetch('/api/contact-admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            })

            if (response.ok) {
                setStatus({ type: 'success', message: 'Message sent successfully!' })
                setMessage('')
            } else {
                setStatus({ type: 'error', message: 'Failed to send message' })
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to send message: ' + error })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-black w-full max-w-md rounded-2xl p-6 space-y-4 relative border border-solid border-black/[.08] dark:border-white/[.145]">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                    <FiX className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-semibold">Contact Admin</h2>

                {isSubmitting || status.message ? (
                    <div className="min-h-[200px] flex items-center justify-center">
                        {isSubmitting ? (
                            <FiLoader className="w-8 h-8 animate-spin text-blue-500" />
                        ) : (
                            <div className="text-center space-y-4">
                                <div className={status.type === 'error' ? 'text-red-500' : 'text-green-500'}>
                                    {status.message}
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-3 px-6 text-white bg-blue-600 rounded-2xl hover:bg-blue-700"
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <textarea
                            placeholder="Write your message here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full p-3 px-4 border border-solid border-black/[.08] dark:border-white/[.145] rounded-2xl dark:bg-black min-h-[150px]"
                            required
                        />

                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 p-3 border border-solid border-black/[.08] dark:border-white/[.145] rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 p-3 text-white bg-blue-600 rounded-2xl hover:bg-blue-700"
                            >
                                Send Message
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
} 