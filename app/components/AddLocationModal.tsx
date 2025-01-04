'use client'

import { useState } from 'react'
import { FiX } from 'react-icons/fi'

interface AddLocationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string, jamLink: string) => Promise<void>
  isSubmitting: boolean
}

export default function AddLocationModal({ isOpen, onClose, onSubmit, isSubmitting }: AddLocationModalProps) {
  const [name, setName] = useState('')
  const [jamLink, setJamLink] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      // Check for duplicate name
      const checkResponse = await fetch('/api/locations/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })

      const { exists } = await checkResponse.json()

      if (exists) {
        setError('A location with this name already exists')
        return
      }

      // If no duplicate, proceed with submission
      await onSubmit(name, jamLink)
      setName('')
      setJamLink('')
    } catch (error) {
      setError(`Failed to add location. ${error}`)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-solid border-black/[.08] dark:border-white/[.145] dark:bg-black w-full max-w-md rounded-2xl p-6 space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
        >
          <FiX className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-semibold">Add New Location</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 text-red-700 bg-red-100 dark:bg-red-900/50 rounded-2xl">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Location name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 px-4 border border-solid border-black/[.08] dark:border-white/[.145] rounded-2xl dark:bg-black"
              required
              disabled={isSubmitting}
            />
            <input
              type="url"
              placeholder="Spotify Jam link"
              value={jamLink}
              onChange={(e) => setJamLink(e.target.value)}
              className="w-full p-3 px-4 border border-solid border-black/[.08] dark:border-white/[.145] rounded-2xl dark:bg-black"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 p-3 border border-solid border-black/[.08] dark:border-white/[.145] rounded-2xl hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a]"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 p-3 text-white bg-green-600 rounded-2xl hover:bg-green-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 