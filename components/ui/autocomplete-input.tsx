'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from './input'
import { inputSuggestions, CACHE_KEYS } from '@/lib/input-suggestions'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AutocompleteInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  suggestionsKey: keyof typeof CACHE_KEYS
  onValueChange?: (value: string) => void
  onSelect?: (value: string) => void
  maxSuggestions?: number
  showSuggestions?: boolean
  debounceMs?: number
}

export function AutocompleteInput({
  suggestionsKey,
  onValueChange,
  onSelect,
  maxSuggestions = 10,
  showSuggestions: controlledShowSuggestions,
  debounceMs = 300,
  className,
  value,
  onChange,
  onBlur,
  ...props
}: AutocompleteInputProps) {
  const [inputValue, setInputValue] = useState(value as string || '')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  const cacheKey = CACHE_KEYS[suggestionsKey]

  // Update suggestions based on input
  const updateSuggestions = useCallback((query: string) => {
    if (query.length === 0) {
      // Show recent suggestions when empty
      const recent = inputSuggestions.getSuggestions(cacheKey, maxSuggestions)
      setSuggestions(recent.map(s => s.value))
    } else {
      // Search suggestions
      const matches = inputSuggestions.search(cacheKey, query, maxSuggestions)
      setSuggestions(matches)
    }
  }, [cacheKey, maxSuggestions])

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setSelectedIndex(-1)
    
    // Call controlled onChange
    onChange?.(e)
    
    // Debounced suggestions update
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    debounceRef.current = setTimeout(() => {
      updateSuggestions(newValue)
      if (isFocused && newValue.length > 0) {
        setShowSuggestions(true)
      }
    }, debounceMs)
    
    // Call onValueChange
    onValueChange?.(newValue)
  }

  // Handle focus
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    updateSuggestions(inputValue)
    setShowSuggestions(true)
    props.onFocus?.(e)
  }

  // Handle blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    // Delay to allow click on suggestion
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
    onBlur?.(e)
  }

  // Handle suggestion selection
  const handleSelect = (suggestion: string) => {
    setInputValue(suggestion)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    
    // Save to suggestions
    inputSuggestions.add(cacheKey, suggestion)
    
    // Trigger onChange
    const syntheticEvent = {
      target: { value: suggestion },
    } as React.ChangeEvent<HTMLInputElement>
    onChange?.(syntheticEvent)
    onValueChange?.(suggestion)
    onSelect?.(suggestion)
    
    inputRef.current?.blur()
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      props.onKeyDown?.(e)
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
      default:
        props.onKeyDown?.(e)
    }
  }

  // Sync with controlled value
  useEffect(() => {
    if (value !== undefined && value !== inputValue) {
      setInputValue(value as string)
    }
  }, [value])

  // Update suggestions when input changes externally
  useEffect(() => {
    if (inputValue) {
      updateSuggestions(inputValue)
    }
  }, [inputValue, updateSuggestions])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displaySuggestions = controlledShowSuggestions !== undefined 
    ? controlledShowSuggestions && suggestions.length > 0
    : showSuggestions && suggestions.length > 0

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        {...props}
        ref={inputRef}
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={className}
      />
      
      <AnimatePresence>
        {displaySuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1 bg-[rgba(10,14,39,0.95)] backdrop-blur-xl border border-zyra-glass-border rounded-lg shadow-2xl overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSelect(suggestion)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'w-full px-4 py-2 text-left text-sm transition-colors',
                    'hover:bg-white/10 focus:bg-white/10',
                    selectedIndex === index && 'bg-white/10',
                    index === 0 && 'border-b border-white/5'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white">{suggestion}</span>
                    {inputValue.toLowerCase() === suggestion.toLowerCase() && (
                      <Check className="w-4 h-4 text-zyra-cyan-blue" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

