'use client'

import { useSession } from "next-auth/react"
import LoginButton from "./components/LoginButton"
import UserProfile from "./components/UserProfile"
import JamLocations from "./components/JamLocations"
import { FiLoader } from 'react-icons/fi'

export default function Home() {
  const { data: session, status } = useSession()
  
  if (status === "loading") {
    return (
      <div className="grid min-h-svh place-items-center">
        <FiLoader className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="grid min-h-svh place-items-center">
      <main className="flex flex-col justify-between min-h-svh p-4 items-center gap-8 w-full max-w-2xl">
        {session ? (
          <>
            <JamLocations />
            <UserProfile />
          </>
        ) : (
          <>
            <JamLocations />
            <LoginButton />
          </>
        )}
      </main>
    </div>
  )
}
