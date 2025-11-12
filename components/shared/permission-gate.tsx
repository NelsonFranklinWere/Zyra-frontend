'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useSettings } from '@/contexts/settings-context'

interface PermissionGateProps {
  permission?: string
  resource?: string
  action?: string
  role?: string | string[]
  fallback?: ReactNode
  children: ReactNode
  mode?: 'hide' | 'disable'
}

export function PermissionGate({
  permission,
  resource,
  action,
  role,
  fallback = null,
  children,
  mode = 'hide'
}: PermissionGateProps) {
  const { user } = useAuth()
  const { hasPermission, canAccess } = useSettings()

  if (!user) {
    return mode === 'hide' ? null : <div className="opacity-50 pointer-events-none">{children}</div>
  }

  // Check role-based access
  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role]
    if (!allowedRoles.includes(user.role)) {
      return mode === 'hide' ? <>{fallback}</> : <div className="opacity-50 pointer-events-none">{children}</div>
    }
  }

  // Check permission-based access
  if (permission && !hasPermission(permission)) {
    return mode === 'hide' ? <>{fallback}</> : <div className="opacity-50 pointer-events-none">{children}</div>
  }

  // Check resource-based access
  if (resource && !canAccess(resource, action)) {
    return mode === 'hide' ? <>{fallback}</> : <div className="opacity-50 pointer-events-none">{children}</div>
  }

  return <>{children}</>
}

