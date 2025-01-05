import { Filter } from 'bad-words'

const filter = new Filter()

export function containsInappropriateContent(text: string): boolean {
    try {
        // Convert to lowercase and remove common URL parts for name checking
        const cleanText = text.toLowerCase()
            .replace(/https?:\/\//g, '')
            .replace(/www\./g, '')
            .replace(/spotify\.com/g, '')
        
        // Check if the text contains profanity
        return filter.isProfane(cleanText)
    } catch (error) {
        console.error('Error checking content:', error)
        return false
    }
}

export function sanitizeContent(text: string): string {
    try {
        return filter.clean(text)
    } catch (error) {
        console.error('Error sanitizing content:', error)
        return text
    }
} 