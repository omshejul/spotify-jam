'use client'

import { useState } from 'react'
import { FiInfo } from 'react-icons/fi'
import ContactAdminModal from './ContactAdminModal'

interface TooltipProps {
    content?: string
}

export default function Tooltip({ content }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [isContactModalOpen, setIsContactModalOpen] = useState(false)
    const defaultTooltipText = [
        "Welcome to Spotify Jams! 🎵",
        "",
        "This is where you can:",
        "• Save and share your Spotify Jam sessions",
        "• Let anyone join your queue and add songs",
        "• Keep jam links up-to-date (anyone can edit if a link breaks)",
        "",
        "🎵 Jam Etiquette:",
        "• Take turns adding songs",
        "• Respect others' music choices",
        "• Keep the vibe going!",
        "",
        "Need help? Contact admin below 👇",
        "",
        "[Contact Admin]"
    ].join('\n')

    const tooltipText = content || defaultTooltipText

    return (
        <div className="relative inline-block">
            <button
                onClick={() => setIsVisible(!isVisible)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full focus:outline-none"
                type="button"
                aria-label="Show information"
            >
                <FiInfo className="w-5 h-5" />
            </button>
            {isVisible && (
                <>
                    <div 
                        className="fixed inset-0" 
                        onClick={() => setIsVisible(false)}
                    />
                    <div className="absolute z-50 w-72 p-4 text-sm bg-white dark:bg-black border border-solid border-black/[.08] dark:border-white/[.145] rounded-2xl right-0 top-8 shadow-lg whitespace-pre-line">
                        {tooltipText.split('[Contact Admin]')[0]}
                        <button
                            onClick={() => {
                                setIsContactModalOpen(true)
                                setIsVisible(false)
                            }}
                            className="mt-2 w-full p-2 text-blue-500 border border-solid border-black/[.08] dark:border-white/[.145] rounded-xl hover:bg-blue-100 hover:dark:bg-blue-900/20 transition-colors"
                        >
                            Contact Admin
                        </button>
                    </div>
                </>
            )}
            <ContactAdminModal 
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
            />
        </div>
    )
} 