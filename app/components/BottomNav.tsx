'use client'

import { useSession } from 'next-auth/react'
import { FiLoader } from 'react-icons/fi'
import LoginButton from './LoginButton'
import UserProfile from './UserProfile'

export default function BottomNav() {
    const { data: session, status } = useSession()

    if (status === 'loading') {
        return (
            <div className="flex mt-2 w-full justify-center gap-4 items-center">
                <div className="p-3 rounded-2xl border border-solid border-black/[.08] dark:border-white/[.145]">
                    <FiLoader className="w-5 h-5 animate-spin" />
                </div>
            </div>
        )
    }

    return (
        <div className="flex mt-2 w-full justify-center gap-4 items-center">
            {session ? (
                <UserProfile />
            ) : (
                <LoginButton/>
            )}
        </div>
    )
} 