import { FiLoader } from 'react-icons/fi'

export default function LocationLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-svh">
            <div className="p-4 rounded-2xl border border-solid border-black/[.08] dark:border-white/[.145]">
                <FiLoader className="w-8 h-8 animate-spin" />
            </div>
        </div>
    )
} 