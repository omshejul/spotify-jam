'use client'

interface TimeDisplayProps {
    date: Date
}

export default function TimeDisplay({ date }: TimeDisplayProps) {
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <span>
            {formatDate(date)}{' '}
            at{' '}
            {new Date(date).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            })}
        </span>
    )
} 