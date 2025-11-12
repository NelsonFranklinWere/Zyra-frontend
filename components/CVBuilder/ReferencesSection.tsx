'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserCheck, Building2, Mail, Phone, Plus, Trash2, HelpCircle } from 'lucide-react'
import { Reference } from './types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface ReferencesSectionProps {
  data: Reference[]
  onChange: (data: Reference[]) => void
}

const fieldTooltips = {
  name: 'Enter the full name of your referee',
  role: 'Their role or relationship to you (e.g., Supervisor, Lecturer, Manager)',
  organization: 'The organization or company they are associated with',
  contact: 'Their contact information (email or phone number)',
}

const createEmptyReference = (): Reference => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  name: '',
  role: '',
  organization: '',
  contact: '',
})

export function ReferencesSection({ data, onChange }: ReferencesSectionProps) {
  // References are optional, so don't auto-create first entry
  // User can add when ready

  const handleAddReference = () => {
    onChange([...data, createEmptyReference()])
  }

  const handleRemoveReference = (id: string) => {
    onChange(data.filter(ref => ref.id !== id))
  }

  const handleChange = (id: string, field: keyof Reference, value: string) => {
    const updated = data.map(ref =>
      ref.id === id ? { ...ref, [field]: value } : ref
    )
    onChange(updated)
  }

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        <Card className="bg-transparent border-white/10">
          <CardHeader>
            <CardTitle className="text-3xl font-cyber font-bold gradient-text">
              References
            </CardTitle>
            <CardDescription className="text-base text-zyra-text-secondary">
              Add professional references who can vouch for your work. This adds credibility and trust to your CV.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {data.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                <UserCheck className="w-12 h-12 text-zyra-text-secondary mx-auto mb-4" />
                <p className="text-zyra-text-secondary mb-4">No references added yet</p>
                <Button
                  onClick={handleAddReference}
                  variant="outline"
                  className="bg-zyra-electric-violet/20 text-zyra-electric-violet hover:bg-zyra-electric-violet/30 border-zyra-electric-violet/30"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Reference
                </Button>
              </div>
            ) : (
              <>
                <AnimatePresence mode="popLayout">
                  {data.map((reference, index) => (
                    <motion.div
                      key={reference.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-6 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          <UserCheck className="w-5 h-5 text-zyra-cyan-blue" />
                          Reference Entry {index + 1}
                        </h3>
                        <Button
                          onClick={() => handleRemoveReference(reference.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Referee Name */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`name-${reference.id}`} className="text-sm font-medium text-white">
                              Referee Name
                            </Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button type="button" className="inline-flex items-center justify-center">
                                  <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <p className="text-sm">{fieldTooltips.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="relative">
                            <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zyra-text-secondary z-10" />
                            <Input
                              id={`name-${reference.id}`}
                              value={reference.name}
                              onChange={(e) => handleChange(reference.id, 'name', e.target.value)}
                              placeholder="Your referee name"
                              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary focus-visible:border-zyra-cyan-blue focus-visible:ring-zyra-cyan-blue/20"
                            />
                          </div>
                        </motion.div>

                        {/* Role / Relationship */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 + 0.05 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`role-${reference.id}`} className="text-sm font-medium text-white">
                              Role / Relationship
                            </Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button type="button" className="inline-flex items-center justify-center">
                                  <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <p className="text-sm">{fieldTooltips.role}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Input
                            id={`role-${reference.id}`}
                            value={reference.role}
                            onChange={(e) => handleChange(reference.id, 'role', e.target.value)}
                            placeholder="Your referee role or relationship"
                            className="bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary focus-visible:border-zyra-cyan-blue focus-visible:ring-zyra-cyan-blue/20"
                          />
                        </motion.div>

                        {/* Organization */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 + 0.1 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`organization-${reference.id}`} className="text-sm font-medium text-white">
                              Organization
                            </Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button type="button" className="inline-flex items-center justify-center">
                                  <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <p className="text-sm">{fieldTooltips.organization}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zyra-text-secondary z-10" />
                            <Input
                              id={`organization-${reference.id}`}
                              value={reference.organization}
                              onChange={(e) => handleChange(reference.id, 'organization', e.target.value)}
                              placeholder="Your referee organization"
                              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary focus-visible:border-zyra-cyan-blue focus-visible:ring-zyra-cyan-blue/20"
                            />
                          </div>
                        </motion.div>

                        {/* Contact Info */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 + 0.15 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`contact-${reference.id}`} className="text-sm font-medium text-white">
                              Contact Info
                            </Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button type="button" className="inline-flex items-center justify-center">
                                  <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <p className="text-sm">{fieldTooltips.contact}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zyra-text-secondary z-10" />
                            <Input
                              id={`contact-${reference.id}`}
                              value={reference.contact}
                              onChange={(e) => handleChange(reference.id, 'contact', e.target.value)}
                              placeholder="Your referee contact (email or phone)"
                              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary focus-visible:border-zyra-cyan-blue focus-visible:ring-zyra-cyan-blue/20"
                            />
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Add Reference Button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: data.length * 0.1 }}
                >
                  <Button
                    onClick={handleAddReference}
                    variant="outline"
                    className="w-full bg-zyra-electric-violet/20 text-zyra-electric-violet hover:bg-zyra-electric-violet/30 border-zyra-electric-violet/30"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Reference
                  </Button>
                </motion.div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}

