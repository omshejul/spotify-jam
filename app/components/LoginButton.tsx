'use client'

import { signIn } from "next-auth/react"
import { FiEdit } from 'react-icons/fi'

export default function LoginButton() {
  return (
    <button
      onClick={() => signIn('google')}
      className="rounded-2xl backdrop-blur border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
    >
      <FiEdit className="mr-2" /> Sign to Edit
    </button>
  )
} 