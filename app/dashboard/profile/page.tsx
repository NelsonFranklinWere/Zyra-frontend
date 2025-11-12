'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  Edit,
  Save,
  X,
  Upload,
  Camera,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import apiClient from '@/lib/api-client'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    avatarUrl: ''
  })
  const [originalData, setOriginalData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    avatarUrl: ''
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/dashboard')
    }
  }, [user, router])

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const result = await apiClient.getProfile()
        
        if (result.success && result.data) {
          const data = {
            firstName: result.data.firstName || user?.firstName || '',
            lastName: result.data.lastName || user?.lastName || '',
            email: result.data.email || user?.email || '',
            phone: result.data.phone || '',
            bio: result.data.bio || '',
            location: result.data.location || '',
            website: result.data.website || '',
            avatarUrl: result.data.avatarUrl || user?.avatarUrl || ''
          }
          setProfileData(data)
          setOriginalData(data)
        } else {
          // Fallback to user context data
          const data = {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: '',
            bio: '',
            location: '',
            website: '',
            avatarUrl: user.avatarUrl || ''
          }
          setProfileData(data)
          setOriginalData(data)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        // Fallback to user context data
        const data = {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: '',
          bio: '',
          location: '',
          website: '',
          avatarUrl: user.avatarUrl || ''
        }
        setProfileData(data)
        setOriginalData(data)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await apiClient.updateProfile(profileData)
      
      if (result.success) {
        // Update auth context
        updateUser({
          ...user,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          avatarUrl: profileData.avatarUrl
        })
        
        setOriginalData(profileData)
        setIsEditing(false)
        toast.success('Profile updated successfully!')
      } else {
        toast.error(result.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setProfileData(originalData)
    setIsEditing(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setIsUploading(true)
    try {
      const result = await apiClient.uploadAvatar(file)
      
      if (result.success && result.data?.avatarUrl) {
        setProfileData(prev => ({ ...prev, avatarUrl: result.data.avatarUrl }))
        updateUser({
          ...user!,
          avatarUrl: result.data.avatarUrl
        })
        toast.success('Avatar uploaded successfully!')
      } else {
        toast.error(result.message || 'Failed to upload avatar')
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      toast.error(error.message || 'Failed to upload avatar. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  if (!user) {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <Loader2 className="w-8 h-8 text-zyra-cyan-blue animate-spin" />
          <p className="text-zyra-text-secondary">Loading profile...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-cyber font-bold gradient-text mb-2">My Profile</h1>
          <p className="text-zyra-text-secondary">Manage your personal information and preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <motion.button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-zyra-glass-border text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </motion.button>
              <motion.button
                onClick={handleSave}
                disabled={isSaving}
                className="neon-button flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isSaving ? 1 : 1.05 }}
                whileTap={{ scale: isSaving ? 1 : 0.95 }}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </motion.button>
            </>
          ) : (
            <motion.button
              onClick={() => setIsEditing(true)}
              className="neon-button flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-2xl border border-zyra-glass-border"
      >
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-zyra-electric-violet/30 shadow-lg shadow-zyra-electric-violet/20">
                {profileData.avatarUrl ? (
                  <img
                    src={profileData.avatarUrl}
                    alt={`${profileData.firstName} ${profileData.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-zyra-electric-violet/20 to-zyra-cyan-blue/20 flex items-center justify-center">
                    <User className="w-16 h-16 text-zyra-electric-violet" />
                  </div>
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 p-2 bg-zyra-electric-violet rounded-full cursor-pointer hover:bg-zyra-electric-violet/80 transition-colors shadow-lg">
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-white" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-white mb-1">
                {profileData.firstName} {profileData.lastName}
              </h2>
              <p className="text-zyra-text-secondary text-sm">{profileData.email}</p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="flex-1 space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <User className="w-5 h-5 text-zyra-cyan-blue" />
                <span>Personal Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zyra-text-secondary mb-2">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white"
                      placeholder="Enter first name"
                    />
                  ) : (
                    <p className="px-4 py-2 bg-white/5 rounded-xl text-white">
                      {profileData.firstName || 'Not set'}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zyra-text-secondary mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white"
                      placeholder="Enter last name"
                    />
                  ) : (
                    <p className="px-4 py-2 bg-white/5 rounded-xl text-white">
                      {profileData.lastName || 'Not set'}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zyra-text-secondary mb-2 flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white"
                    placeholder="Enter email"
                  />
                ) : (
                  <p className="px-4 py-2 bg-white/5 rounded-xl text-white flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-zyra-text-secondary" />
                    <span>{profileData.email || 'Not set'}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zyra-text-secondary mb-2 flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Phone</span>
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="px-4 py-2 bg-white/5 rounded-xl text-white flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-zyra-text-secondary" />
                    <span>{profileData.phone || 'Not set'}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zyra-text-secondary mb-2 flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Location</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white"
                    placeholder="Enter location"
                  />
                ) : (
                  <p className="px-4 py-2 bg-white/5 rounded-xl text-white flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-zyra-text-secondary" />
                    <span>{profileData.location || 'Not set'}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zyra-text-secondary mb-2">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white resize-none"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="px-4 py-2 bg-white/5 rounded-xl text-white min-h-[100px]">
                    {profileData.bio || 'No bio added yet.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/settings">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="glass-card p-6 rounded-xl border border-zyra-glass-border hover:border-zyra-electric-violet/50 transition-colors cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Settings</h3>
            <p className="text-sm text-zyra-text-secondary">
              Manage your account settings and preferences
            </p>
          </motion.div>
        </Link>
        <Link href="/dashboard">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="glass-card p-6 rounded-xl border border-zyra-glass-border hover:border-zyra-cyan-blue/50 transition-colors cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Dashboard</h3>
            <p className="text-sm text-zyra-text-secondary">
              Return to your dashboard overview
            </p>
          </motion.div>
        </Link>
      </div>
    </div>
  )
}

