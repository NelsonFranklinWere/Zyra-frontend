/**
 * Input Suggestions System
 * Tracks and suggests user inputs based on previous entries
 */

import { cache, CACHE_KEYS } from './cache'

// Re-export CACHE_KEYS for convenience
export { CACHE_KEYS }

interface Suggestion {
  value: string
  count: number
  lastUsed: number
}

interface SuggestionsMap {
  [key: string]: Suggestion[]
}

class InputSuggestionsManager {
  private readonly MAX_SUGGESTIONS = 20
  private readonly MAX_AGE = 90 * 24 * 60 * 60 * 1000 // 90 days

  /**
   * Add a new input value to suggestions
   */
  add(key: string, value: string): void {
    if (!value || value.trim().length === 0) return

    const normalizedValue = value.trim()
    const suggestions = this.getSuggestions(key)

    // Find existing suggestion
    const existingIndex = suggestions.findIndex(
      s => s.value.toLowerCase() === normalizedValue.toLowerCase()
    )

    if (existingIndex >= 0) {
      // Update existing
      suggestions[existingIndex].count++
      suggestions[existingIndex].lastUsed = Date.now()
    } else {
      // Add new
      suggestions.push({
        value: normalizedValue,
        count: 1,
        lastUsed: Date.now(),
      })
    }

    // Sort by count (desc) then by lastUsed (desc)
    suggestions.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      return b.lastUsed - a.lastUsed
    })

    // Keep only top suggestions
    const trimmed = suggestions.slice(0, this.MAX_SUGGESTIONS)
    this.saveSuggestions(key, trimmed)
  }

  /**
   * Get suggestions for a key
   */
  getSuggestions(key: string, limit: number = 10): Suggestion[] {
    const suggestions = this.loadSuggestions(key)
    
    // Filter out old suggestions
    const now = Date.now()
    const filtered = suggestions.filter(
      s => now - s.lastUsed < this.MAX_AGE
    )

    // Sort by relevance (count + recency)
    filtered.sort((a, b) => {
      const aScore = a.count * 2 + (now - a.lastUsed < 30 * 24 * 60 * 60 * 1000 ? 5 : 0)
      const bScore = b.count * 2 + (now - b.lastUsed < 30 * 24 * 60 * 60 * 1000 ? 5 : 0)
      return bScore - aScore
    })

    return filtered.slice(0, limit)
  }

  /**
   * Get suggestions that match a query
   */
  search(key: string, query: string, limit: number = 10): string[] {
    if (!query || query.trim().length === 0) {
      return this.getSuggestions(key, limit).map(s => s.value)
    }

    const suggestions = this.getSuggestions(key, this.MAX_SUGGESTIONS)
    const lowerQuery = query.toLowerCase()

    // Filter and rank matches
    const matches = suggestions
      .filter(s => s.value.toLowerCase().includes(lowerQuery))
      .sort((a, b) => {
        // Prioritize exact starts
        const aStarts = a.value.toLowerCase().startsWith(lowerQuery) ? 10 : 0
        const bStarts = b.value.toLowerCase().startsWith(lowerQuery) ? 10 : 0
        
        if (aStarts !== bStarts) return bStarts - aStarts
        
        // Then by count
        if (b.count !== a.count) return b.count - a.count
        
        // Then by recency
        return b.lastUsed - a.lastUsed
      })
      .slice(0, limit)
      .map(s => s.value)

    return matches
  }

  /**
   * Clear suggestions for a key
   */
  clear(key: string): void {
    cache.remove(key)
  }

  /**
   * Clear all suggestions
   */
  clearAll(): void {
    Object.values(CACHE_KEYS)
      .filter(key => key.startsWith('suggestions_'))
      .forEach(key => this.clear(key))
  }

  private loadSuggestions(key: string): Suggestion[] {
    const data = cache.get<Suggestion[]>(key)
    return data || []
  }

  private saveSuggestions(key: string, suggestions: Suggestion[]): void {
    cache.set(key, suggestions, {
      expiresIn: this.MAX_AGE,
    })
  }
}

// Singleton instance
export const inputSuggestions = new InputSuggestionsManager()

// Pre-populate with common suggestions
const COMMON_SUGGESTIONS = {
  [CACHE_KEYS.SUGGESTIONS_JOB_TITLES]: [
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Analyst',
    'Data Scientist',
    'DevOps Engineer',
    'Product Manager',
    'UI/UX Designer',
    'Project Manager',
    'Software Developer',
    'Web Developer',
    'Mobile Developer',
    'System Administrator',
    'Network Engineer',
    'IT Support Specialist',
    'Business Analyst',
    'Quality Assurance Engineer',
    'Technical Writer',
    'Solutions Architect',
  ],
  [CACHE_KEYS.SUGGESTIONS_SKILLS]: [
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'Python',
    'Java',
    'SQL',
    'Git',
    'Docker',
    'AWS',
    'Linux',
    'HTML',
    'CSS',
    'MongoDB',
    'PostgreSQL',
    'REST API',
    'GraphQL',
    'Agile',
    'Scrum',
    'Project Management',
  ],
  [CACHE_KEYS.SUGGESTIONS_LOCATIONS]: [
    'Nairobi, Kenya',
    'Mombasa, Kenya',
    'Kisumu, Kenya',
    'Kampala, Uganda',
    'Dar es Salaam, Tanzania',
    'Lagos, Nigeria',
    'Accra, Ghana',
    'Cairo, Egypt',
    'Johannesburg, South Africa',
    'Cape Town, South Africa',
  ],
}

// Initialize common suggestions if cache is empty
if (typeof window !== 'undefined') {
  Object.entries(COMMON_SUGGESTIONS).forEach(([key, values]) => {
    if (!cache.has(key)) {
      const suggestions: Suggestion[] = values.map(value => ({
        value,
        count: 1,
        lastUsed: Date.now(),
      }))
      cache.set(key, suggestions, { expiresIn: 365 * 24 * 60 * 60 * 1000 }) // 1 year
    }
  })
}

