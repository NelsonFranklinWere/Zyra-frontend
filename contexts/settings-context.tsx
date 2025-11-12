'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './auth-context'
import apiClient from '@/lib/api-client'
import toast from 'react-hot-toast'

interface NotificationPreferences {
  email: boolean
  push: boolean
  sms: boolean
  automation: boolean
  ai: boolean
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications: NotificationPreferences
  privacy?: {
    profileVisibility: 'public' | 'private' | 'contacts'
    showEmail: boolean
    showPhone: boolean
  }
}

interface SettingsContextType {
  preferences: UserPreferences | null
  isLoading: boolean
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>
  updateNotificationPreference: (key: keyof NotificationPreferences, value: boolean) => Promise<void>
  setTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>
  setLanguage: (language: string) => Promise<void>
  refreshPreferences: () => Promise<void>
  hasPermission: (permission: string) => boolean
  canAccess: (resource: string, action?: string) => boolean
}

const defaultPreferences: UserPreferences = {
  theme: 'dark',
  language: 'en',
  notifications: {
    email: true,
    push: true,
    sms: false,
    automation: true,
    ai: true
  },
  privacy: {
    profileVisibility: 'private',
    showEmail: false,
    showPhone: false
  }
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load preferences from API
  const loadPreferences = async () => {
    if (!user) {
      setPreferences(defaultPreferences)
      setIsLoading(false)
      return
    }

    try {
      const result = await apiClient.getProfile()
      if (result.success && result.data?.preferences) {
        const prefs = result.data.preferences
        setPreferences({
          theme: prefs.theme || defaultPreferences.theme,
          language: prefs.language || defaultPreferences.language,
          notifications: {
            ...defaultPreferences.notifications,
            ...(prefs.notifications || {})
          },
          privacy: {
            ...defaultPreferences.privacy,
            ...(prefs.privacy || {})
          }
        })
      } else {
        setPreferences(defaultPreferences)
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
      setPreferences(defaultPreferences)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPreferences()
  }, [user])

  // Update preferences
  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) return

    const newPreferences = {
      ...preferences,
      ...updates
    } as UserPreferences

    try {
      const result = await apiClient.updateProfile({
        preferences: {
          theme: newPreferences.theme,
          language: newPreferences.language,
          notifications: newPreferences.notifications,
          privacy: newPreferences.privacy
        }
      })

      if (result.success) {
        setPreferences(newPreferences)
        
        // Log settings change (for telemetry)
        if (typeof window !== 'undefined') {
          console.log('Settings updated', {
            category: 'settings',
            changed: Object.keys(updates),
            timestamp: new Date().toISOString()
          })
        }
        
        toast.success('Settings saved successfully')
      } else {
        toast.error(result.message || 'Failed to save settings')
      }
    } catch (error: any) {
      console.error('Error updating preferences:', error)
      toast.error(error.message || 'Failed to save settings')
    }
  }

  // Update single notification preference
  const updateNotificationPreference = async (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    if (!preferences) return

    await updatePreferences({
      notifications: {
        ...preferences.notifications,
        [key]: value
      }
    })
  }

  // Set theme
  const setTheme = async (theme: 'light' | 'dark' | 'system') => {
    await updatePreferences({ theme })
    // Apply theme to document
    if (theme !== 'system') {
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(theme)
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(prefersDark ? 'dark' : 'light')
    }
  }

  // Set language
  const setLanguage = async (language: string) => {
    await updatePreferences({ language })
    // Future: Apply language to app
  }

  // Refresh preferences
  const refreshPreferences = async () => {
    setIsLoading(true)
    await loadPreferences()
  }

  // Permission checks based on user role
  const hasPermission = (permission: string): boolean => {
    if (!user) return false

    const rolePermissions: Record<string, string[]> = {
      super_admin: ['*'], // All permissions
      admin: [
        'manage_users',
        'manage_automations',
        'view_analytics',
        'manage_settings',
        'manage_integrations'
      ],
      manager: [
        'view_analytics',
        'manage_automations',
        'view_users'
      ],
      user: [
        'view_own_data',
        'create_automations',
        'manage_own_profile'
      ]
    }

    const userPermissions = rolePermissions[user.role] || rolePermissions.user
    
    // Super admin has all permissions
    if (userPermissions.includes('*')) return true
    
    return userPermissions.includes(permission)
  }

  // Check resource access
  const canAccess = (resource: string, action?: string): boolean => {
    if (!user) return false

    // Super admin can access everything
    if (user.role === 'super_admin') return true

    const permission = action ? `${resource}.${action}` : resource
    return hasPermission(permission) || hasPermission(`${resource}.*`)
  }

  return (
    <SettingsContext.Provider
      value={{
        preferences,
        isLoading,
        updatePreferences,
        updateNotificationPreference,
        setTheme,
        setLanguage,
        refreshPreferences,
        hasPermission,
        canAccess
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

