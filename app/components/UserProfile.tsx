'use client'

import { signOut, useSession } from "next-auth/react"
import Image from "next/image"

export default function UserProfile() {
  const { data: session } = useSession()

  return (
    <div className="flex items-center p-6 justify-between w-full rounded-2xl border border-solid border-black/[.08] dark:border-white/[.145]">
      <div className="flex items-center gap-4">
        {session?.user?.image && (
          <Image
            src={session.user.image}
            alt="Profile picture"
            width={48}
            height={48}
            className="rounded-full"
            priority
          />
        )}
        <div className="flex flex-col items-start">
          <h2 className="text-xl font-semibold">{session?.user?.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {session?.user?.email}
          </p>
        </div>
      </div>
      <button
        className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
        onClick={() => signOut()}
      >
        Sign Out
      </button>
    </div>
  )
} 