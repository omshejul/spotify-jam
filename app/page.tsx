'use client'

import { useSession } from "next-auth/react"
import { FiLoader } from 'react-icons/fi'
import JamLocations from "./components/JamLocations"
import LoginButton from "./components/LoginButton"
import UserProfile from "./components/UserProfile"

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
    <div className="flex flex-col min-h-svh">
      <main className="flex-1 p-4 container mx-auto max-w-2xl">
        <JamLocations />
      </main>
      
      <div className="sticky bottom-0 w-full  py-4">
        <div className="container mx-auto max-w-2xl px-4 flex justify-center">
          {session ? <UserProfile /> : <LoginButton />}
        </div>
      </div>
    </div>
  )
}
