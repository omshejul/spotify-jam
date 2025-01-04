'use client'

interface TimeDisplayProps {
    date: Date
}

export default function TimeDisplay({ date }: TimeDisplayProps) {
    return (
        <span>
            {new Date(date).toLocaleDateString()}{' '}
            at{' '}
            {new Date(date).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            })}
        </span>
    )
} 