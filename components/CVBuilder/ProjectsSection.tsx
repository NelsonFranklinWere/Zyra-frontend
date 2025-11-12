'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderKanban, Code2, Link2, TrendingUp, Plus, Trash2, HelpCircle, X, Sparkles } from 'lucide-react'
import { Project } from './types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ProjectsSectionProps {
  data: Project[]
  onChange: (data: Project[]) => void
}

const fieldTooltips = {
  title: 'Enter a descriptive project title',
  description: 'Brief overview of the problem you solved and what you built. This is required because AI uses project descriptions to understand your strengths, problem-solving abilities, and technical expertise for better profiling.',
  role: 'Describe your specific role and contribution to this project',
  techStack: 'List all technologies, frameworks, and tools used (press Enter after each)',
  outcome: 'Optional: Include results, impact, or metrics (e.g., "Deployed to 1,000+ users")',
  link: 'GitHub repository URL, live demo link, or portfolio link',
}

const createEmptyProject = (): Project => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  title: '',
  description: '',
  role: '',
  techStack: [],
  outcome: '',
  link: '',
})

export function ProjectsSection({ data, onChange }: ProjectsSectionProps) {
  const [errors, setErrors] = useState<Record<string, Partial<Record<keyof Project, string>>>>({})
  const [techTagInput, setTechTagInput] = useState<Record<string, string>>({})

  // Allow projects to be completely empty - don't auto-create empty project
  // Users can skip projects entirely if they want
  // useEffect(() => {
  //   if (data.length === 0) {
  //     onChange([createEmptyProject()])
  //   }
  // }, [data.length, onChange])

  const handleAddProject = () => {
    onChange([...data, createEmptyProject()])
  }

  const handleRemoveProject = (id: string) => {
    const updated = data.filter(proj => proj.id !== id)
    onChange(updated)
    const newErrors = { ...errors }
    delete newErrors[id]
    setErrors(newErrors)
    const newTechInput = { ...techTagInput }
    delete newTechInput[id]
    setTechTagInput(newTechInput)
    
    // Allow removing all projects - empty array is OK
  }

  const handleChange = (id: string, field: keyof Project, value: string | string[]) => {
    const updated = data.map(proj =>
      proj.id === id ? { ...proj, [field]: value } : proj
    )
    onChange(updated)
  }

  const handleAddTechTag = (id: string, tag: string) => {
    if (tag.trim() && !data.find(p => p.id === id)?.techStack.includes(tag.trim())) {
      const project = data.find(p => p.id === id)
      if (project) {
        handleChange(id, 'techStack', [...project.techStack, tag.trim()])
        setTechTagInput({ ...techTagInput, [id]: '' })
      }
    }
  }

  const handleRemoveTechTag = (id: string, tagToRemove: string) => {
    const project = data.find(p => p.id === id)
    if (project) {
      handleChange(id, 'techStack', project.techStack.filter(tag => tag !== tagToRemove))
    }
  }

  const handleTechTagKeyDown = (id: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && techTagInput[id]?.trim()) {
      e.preventDefault()
      handleAddTechTag(id, techTagInput[id])
    }
  }

  const handleBlur = (id: string, field: keyof Project, value: string) => {
    let error = ''
    
    // Description is required for AI profiling - it helps AI understand candidate strengths
    if (field === 'description') {
      const project = data.find(p => p.id === id)
      // If project has title or technologies, description becomes required
      if ((project?.title?.trim() || project?.techStack?.length > 0) && !value.trim()) {
        error = 'Project description is required (AI uses this for profiling and understanding your strengths)'
      } else if (value.trim() && value.trim().length < 20) {
        error = 'Description must be at least 20 characters (AI needs enough detail to understand your work)'
      }
    }
    
    if (error) {
      setErrors({
        ...errors,
        [id]: { ...errors[id], [field]: error }
      })
    } else {
      // Clear error if validation passes
      if (errors[id]?.[field]) {
        setErrors({
          ...errors,
          [id]: { ...errors[id], [field]: undefined }
        })
      }
    }
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
              Projects
            </CardTitle>
            <CardDescription className="text-base text-zyra-text-secondary">
              Showcase your hands-on experience and portfolio depth with real-world projects.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {data.length === 0 ? (
              <div className="text-center py-8 text-zyra-text-secondary">
                <FolderKanban className="w-12 h-12 mx-auto mb-4 text-zyra-text-secondary opacity-50" />
                <p className="mb-4 text-lg">No projects added yet</p>
                <p className="mb-6 text-sm opacity-75">Projects are optional - you can skip this section or add projects later</p>
                <Button
                  onClick={handleAddProject}
                  variant="outline"
                  className="bg-zyra-electric-violet/20 text-zyra-electric-violet hover:bg-zyra-electric-violet/30 border-zyra-electric-violet/30"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
                </Button>
              </div>
            ) : (
              <>
                <AnimatePresence mode="popLayout">
                  {data.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <FolderKanban className="w-5 h-5 text-zyra-cyan-blue" />
                      Project Entry {index + 1}
                    </h3>
                    {/* Allow removing even if only one project - projects are optional */}
                    <Button
                      onClick={() => handleRemoveProject(project.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Project Title */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-2 md:col-span-2"
                    >
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`title-${project.id}`} className="text-sm font-medium text-white">
                          Project Title <span className="text-red-400">*</span>
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex items-center justify-center">
                              <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-sm">{fieldTooltips.title}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id={`title-${project.id}`}
                        value={project.title}
                        onChange={(e) => handleChange(project.id, 'title', e.target.value)}
                        onBlur={(e) => handleBlur(project.id, 'title', e.target.value)}
                        placeholder="Your project title"
                        className={cn(
                          'bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary',
                          'focus-visible:border-zyra-cyan-blue focus-visible:ring-zyra-cyan-blue/20',
                          errors[project.id]?.title && 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20'
                        )}
                      />
                      {errors[project.id]?.title && (
                        <p className="text-sm text-red-400">{errors[project.id].title}</p>
                      )}
                    </motion.div>

                    {/* Description */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.05 }}
                      className="space-y-2 md:col-span-2"
                    >
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`description-${project.id}`} className="text-sm font-medium text-white">
                          Description <span className="text-red-400">*</span>
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex items-center justify-center">
                              <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-sm">
                              {fieldTooltips.description}
                              <br />
                              <span className="text-zyra-cyan-blue font-semibold mt-1 block">
                                Required: AI uses this to understand your strengths and experience
                              </span>
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Textarea
                        id={`description-${project.id}`}
                        value={project.description}
                        onChange={(e) => handleChange(project.id, 'description', e.target.value)}
                        onBlur={(e) => handleBlur(project.id, 'description', e.target.value)}
                        placeholder="Brief overview of the problem you solved and what you built. AI uses this to understand your strengths and experience. (Minimum 20 characters)"
                        rows={4}
                        className={cn(
                          'bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary',
                          'focus-visible:border-zyra-cyan-blue focus-visible:ring-zyra-cyan-blue/20',
                          errors[project.id]?.description && 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20'
                        )}
                      />
                      {errors[project.id]?.description && (
                        <p className="text-sm text-red-400">{errors[project.id].description}</p>
                      )}
                    </motion.div>

                    {/* Role / Contribution */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.1 }}
                      className="space-y-2 md:col-span-2"
                    >
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`role-${project.id}`} className="text-sm font-medium text-white">
                          Role / Contribution
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
                        id={`role-${project.id}`}
                        value={project.role}
                        onChange={(e) => handleChange(project.id, 'role', e.target.value)}
                        placeholder="Your role and contribution"
                        className="bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary focus-visible:border-zyra-cyan-blue focus-visible:ring-zyra-cyan-blue/20"
                      />
                    </motion.div>

                    {/* Technologies Used (Tag Input) */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.15 }}
                      className="space-y-2 md:col-span-2"
                    >
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`techStack-${project.id}`} className="text-sm font-medium text-white">
                          Technologies Used
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex items-center justify-center">
                              <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-sm">{fieldTooltips.techStack}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="relative">
                        <Code2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zyra-text-secondary z-10" />
                        <Input
                          id={`techStack-${project.id}`}
                          value={techTagInput[project.id] || ''}
                          onChange={(e) => setTechTagInput({ ...techTagInput, [project.id]: e.target.value })}
                          onKeyDown={(e) => handleTechTagKeyDown(project.id, e)}
                          placeholder="Your technology (press Enter to add)"
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary focus-visible:border-zyra-cyan-blue focus-visible:ring-zyra-cyan-blue/20"
                        />
                      </div>
                      {project.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {project.techStack.map((tech) => (
                            <Badge
                              key={tech}
                              variant="outline"
                              className="bg-zyra-electric-violet/20 text-zyra-cyan-blue border-zyra-electric-violet/30 px-3 py-1"
                            >
                              {tech}
                              <button
                                onClick={() => handleRemoveTechTag(project.id, tech)}
                                className="ml-2 hover:text-red-400"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </motion.div>

                    {/* Outcome / Results */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`outcome-${project.id}`} className="text-sm font-medium text-white">
                          Outcome / Results
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex items-center justify-center">
                              <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-sm">{fieldTooltips.outcome}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id={`outcome-${project.id}`}
                        value={project.outcome}
                        onChange={(e) => handleChange(project.id, 'outcome', e.target.value)}
                        placeholder="Your project outcome or results"
                        className="bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary focus-visible:border-zyra-cyan-blue focus-visible:ring-zyra-cyan-blue/20"
                      />
                    </motion.div>

                    {/* GitHub / Live Demo Link */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.25 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`link-${project.id}`} className="text-sm font-medium text-white">
                          GitHub / Live Demo Link
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex items-center justify-center">
                              <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-sm">{fieldTooltips.link}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="relative">
                        <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zyra-text-secondary z-10" />
                        <Input
                          id={`link-${project.id}`}
                          value={project.link}
                          onChange={(e) => handleChange(project.id, 'link', e.target.value)}
                          placeholder="Your project link"
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary focus-visible:border-zyra-cyan-blue focus-visible:ring-zyra-cyan-blue/20"
                        />
                      </div>
                    </motion.div>
                  </div>
                  </motion.div>
                ))}
                </AnimatePresence>

                {/* Add Project Button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: data.length * 0.1 }}
                >
                  <Button
                    onClick={handleAddProject}
                    variant="outline"
                    className="w-full bg-zyra-electric-violet/20 text-zyra-electric-violet hover:bg-zyra-electric-violet/30 border-zyra-electric-violet/30"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Project
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

