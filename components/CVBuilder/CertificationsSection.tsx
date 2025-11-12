'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, Building2, Calendar, Link2, Tag, Plus, Trash2, HelpCircle, Sparkles } from 'lucide-react'
import { Certification } from './types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface CertificationsSectionProps {
  data: Certification[]
  onChange: (data: Certification[]) => void
}

const generateMonthYearOptions = () => {
  const options = []
  const currentDate = new Date()
  const startYear = currentDate.getFullYear() - 20
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  
  for (let year = currentDate.getFullYear(); year >= startYear; year--) {
    for (let month = 11; month >= 0; month--) {
      options.push(`${months[month]} ${year}`)
    }
  }
  return options
}

const MONTH_YEAR_OPTIONS = generateMonthYearOptions()

const fieldTooltips = {
  name: 'Enter the full name of the certification',
  organization: 'The organization that issued the certification',
  issueDate: 'The date when you received this certification',
  expiryDate: 'The expiration date (if applicable, leave blank if it doesn\'t expire)',
  credentialUrl: 'URL to verify your credential online (optional)',
  relatedSkill: 'Related skill or domain (e.g., AWS, Google Cloud, Agile, PMP)',
}

const createEmptyCertification = (): Certification => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  name: '',
  organization: '',
  issueDate: '',
  expiryDate: '',
  credentialUrl: '',
  relatedSkill: '',
})

export function CertificationsSection({ data, onChange }: CertificationsSectionProps) {
  const [errors, setErrors] = useState<Record<string, Partial<Record<keyof Certification, string>>>>({})

  useEffect(() => {
    if (data.length === 0) {
      onChange([createEmptyCertification()])
    }
  }, [data.length, onChange])

  const handleAddCertification = () => {
    onChange([...data, createEmptyCertification()])
  }

  const handleRemoveCertification = (id: string) => {
    onChange(data.filter(cert => cert.id !== id))
    const newErrors = { ...errors }
    delete newErrors[id]
    setErrors(newErrors)
  }

  const handleChange = (id: string, field: keyof Certification, value: string) => {
    const updated = data.map(cert =>
      cert.id === id ? { ...cert, [field]: value } : cert
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
              Certifications
            </CardTitle>
            <CardDescription className="text-base text-zyra-text-secondary">
              Add professional certifications that validate your skills and specialized knowledge.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <AnimatePresence mode="popLayout">
              {data.map((certification, index) => (
                <motion.div
                  key={certification.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-zyra-cyan-blue" />
                      Certification Entry {index + 1}
                    </h3>
                    {data.length > 1 && (
                      <Button
                        onClick={() => handleRemoveCertification(certification.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Certification Name */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`name-${certification.id}`} className="text-sm font-medium text-white">
                          Certification Name <span className="text-red-400">*</span>
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
                        <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zyra-text-secondary z-10" />
                        <Input
                          id={`name-${certification.id}`}
                          value={certification.name}
                          onChange={(e) => handleChange(certification.id, 'name', e.target.value)}
                          placeholder="Your certification name"
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary focus-visible:border-zyra-cyan-blue focus-visible:ring-zyra-cyan-blue/20"
                        />
                      </div>
                    </motion.div>

                    {/* Issuing Organization */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.05 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`organization-${certification.id}`} className="text-sm font-medium text-white">
                          Issuing Organization <span className="text-red-400">*</span>
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
                          id={`organization-${certification.id}`}
                          value={certification.organization}
                          onChange={(e) => handleChange(certification.id, 'organization', e.target.value)}
                          placeholder="Your issuing organization"
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary focus-visible:border-zyra-cyan-blue focus-visible:ring-zyra-cyan-blue/20"
                        />
                      </div>
                    </motion.div>

                    {/* Issue Date */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`issueDate-${certification.id}`} className="text-sm font-medium text-white">
                          Issue Date <span className="text-red-400">*</span>
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex items-center justify-center">
                              <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-sm">{fieldTooltips.issueDate}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zyra-text-secondary z-10" />
                        <Select
                          value={certification.issueDate || undefined}
                          onValueChange={(value) => handleChange(certification.id, 'issueDate', value)}
                        >
                          <SelectTrigger
                            className="pl-10 bg-white/5 border-white/10 text-white focus:border-zyra-cyan-blue focus:ring-zyra-cyan-blue/20"
                          >
                            <SelectValue placeholder="Your issue date" />
                          </SelectTrigger>
                          <SelectContent className="bg-zyra-dark border-white/10 max-h-[200px]">
                            {MONTH_YEAR_OPTIONS.map((date) => (
                              <SelectItem key={date} value={date} className="text-white focus:bg-zyra-electric-violet/20">
                                {date}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </motion.div>

                    {/* Expiry Date */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.15 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`expiryDate-${certification.id}`} className="text-sm font-medium text-white">
                          Expiry Date
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex items-center justify-center">
                              <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-sm">{fieldTooltips.expiryDate}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zyra-text-secondary z-10" />
                        <Select
                          value={certification.expiryDate === '' ? 'no-expiry' : (certification.expiryDate || undefined)}
                          onValueChange={(value) => handleChange(certification.id, 'expiryDate', value === 'no-expiry' ? '' : value)}
                        >
                          <SelectTrigger
                            className="pl-10 bg-white/5 border-white/10 text-white focus:border-zyra-cyan-blue focus:ring-zyra-cyan-blue/20"
                          >
                            <SelectValue placeholder="Your expiry date (if applicable)" />
                          </SelectTrigger>
                          <SelectContent className="bg-zyra-dark border-white/10 max-h-[200px]">
                            <SelectItem value="no-expiry" className="text-white focus:bg-zyra-electric-violet/20">
                              No Expiry
                            </SelectItem>
                            {MONTH_YEAR_OPTIONS.map((date) => (
                              <SelectItem key={date} value={date} className="text-white focus:bg-zyra-electric-violet/20">
                                {date}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </motion.div>

                    {/* Credential URL */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`credentialUrl-${certification.id}`} className="text-sm font-medium text-white">
                          Credential URL
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex items-center justify-center">
                              <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-sm">{fieldTooltips.credentialUrl}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="relative">
                        <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zyra-text-secondary z-10" />
                        <Input
                          id={`credentialUrl-${certification.id}`}
                          value={certification.credentialUrl}
                          onChange={(e) => handleChange(certification.id, 'credentialUrl', e.target.value)}
                          placeholder="Your credential verification URL"
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary focus-visible:border-zyra-cyan-blue focus-visible:ring-zyra-cyan-blue/20"
                        />
                      </div>
                    </motion.div>

                    {/* Related Skill */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.25 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`relatedSkill-${certification.id}`} className="text-sm font-medium text-white">
                            Related Skill or Domain
                          </Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="inline-flex items-center justify-center">
                                <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="text-sm">{fieldTooltips.relatedSkill}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-zyra-electric-violet/20 text-zyra-electric-violet hover:bg-zyra-electric-violet/30 border-zyra-electric-violet/30"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI Suggest
                        </Button>
                      </div>
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zyra-text-secondary z-10" />
                        <Input
                          id={`relatedSkill-${certification.id}`}
                          value={certification.relatedSkill}
                          onChange={(e) => handleChange(certification.id, 'relatedSkill', e.target.value)}
                          placeholder="Your related skill or domain"
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary focus-visible:border-zyra-cyan-blue focus-visible:ring-zyra-cyan-blue/20"
                        />
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add Certification Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: data.length * 0.1 }}
            >
              <Button
                onClick={handleAddCertification}
                variant="outline"
                className="w-full bg-zyra-electric-violet/20 text-zyra-electric-violet hover:bg-zyra-electric-violet/30 border-zyra-electric-violet/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Certification
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}

