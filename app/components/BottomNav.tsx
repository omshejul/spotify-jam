'use client'

import { signIn, useSession } from 'next-auth/react'
import UserProfile from './UserProfile'
import LoginButton from './LoginButton'

export default function BottomNav() {
    const { data: session } = useSession()

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