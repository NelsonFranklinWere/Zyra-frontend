// CV Builder Types
export interface PersonalInfo {
  fullName: string
  email: string
  phoneNumber: string
  location: string
  linkedin: string
  portfolio: string
  aboutMe: string
  title?: string // Professional title (e.g., 'Full-Stack Developer')
  github?: string // GitHub profile
}

export interface Education {
  id: string
  institution: string
  course: string
  qualification: string // Diploma, Bachelor's, Certificate, etc.
  startYear: string
  endYear: string
  gpa: string // Optional
  honors: string // Optional
  achievements: string // Optional - Key Achievements or Projects
}

export interface Achievement {
  text: string
  metric: string
  confidence: 'manual' | 'estimated'
}

export interface Experience {
  id: string
  jobTitle: string
  company: string
  location: string
  industry: string // Optional - Education, Tech, Banking, etc.
  employmentType: 'Full-time' | 'Internship' | 'Part-time' | 'Contract' | '' // Optional
  startDate: string
  endDate: string
  // Support both string (legacy UI) and array formats (AI enhanced)
  responsibilities: string | string[]
  achievements: string | Achievement[]
  toolsTechnologies: string | string[]
  teamSize?: string // Team size information
}

export interface Skill {
  id: string
  name: string
  category: 'technical' | 'soft' | 'analytical' | 'Technical' | 'Analytical' | 'Soft Skill' | ''
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'beginner' | 'intermediate' | 'advanced' | ''
  yearsOfExperience: number // Changed to number for confidence calculation
  relevance?: string // Auto-suggested by AI based on job goals
  confidence_percent?: number // 0-100% confidence score from AI
}

export interface Project {
  id: string
  title: string
  description: string // Brief overview of problem + what was built
  role: string // Role / Contribution
  techStack: string[] // Technologies Used (tag input)
  outcome: string // Optional - Outcome or Results (e.g., "Deployed to 1,000+ users")
  link: string // GitHub / Live Demo Link
}

export interface Certification {
  id: string
  name: string
  organization: string // Issuing Organization
  issueDate: string
  expiryDate: string // if applicable
  credentialUrl: string // Optional
  relatedSkill: string // Optional - Related Skill or Domain (e.g., AWS, Google Cloud, Agile)
}

export interface Language {
  id: string
  name: string
  proficiency: 'Basic' | 'Intermediate' | 'Fluent' | 'Native'
}

export interface CareerGoals {
  desiredRoles: string[]
  workType: 'remote' | 'onsite' | 'hybrid'
  availability: string
  salaryExpectation?: string
}

export interface MissingSkill {
  skill: string
  reason: string
  confidence: number
}

export interface SkillStrength {
  frontend: number
  backend: number
  data: number
  devops?: number
  mobile?: number
  cloud?: number
}

export interface AIInsights {
  dominantPath: 'Software Engineering' | 'Data Analytics' | 'IT Support' | 'Other'
  skillStrength: SkillStrength
  missingSkills: MissingSkill[]
  suggestedImprovements: string[]
  ats_keywords: string[]
  summaryOptions?: string[]
  experienceBullets?: string[][]
  projectHeadlines?: string[]
  talkingPoints?: string[]
}

export interface Reference {
  id: string
  name: string
  role: string
  contact: string
  organization: string
  consent?: boolean // Permission to contact
}

export interface Document {
  type: 'degree' | 'certificate' | 'id'
  url?: string
  notes?: string
}

export interface CVMeta {
  timestamp?: string
  consent: boolean
  template?: 'modern' | 'classic' | 'compact'
}

export interface CVData {
  profile: PersonalInfo & { summary?: string }
  goals?: CareerGoals
  education: Education[]
  experience: Experience[]
  skills: Skill[]
  projects: Project[]
  certifications: Certification[]
  languages: Language[]
  references: Reference[]
  documents?: Document[]
  ai_insights?: AIInsights
  cv_assets?: {
    summary_options?: string[]
    experience_bullets?: string[][]
    project_headlines?: string[]
    talking_points?: string[]
  }
  meta?: CVMeta
}

export type CVStep = 
  | 'personal'
  | 'education'
  | 'experience'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'languages'
  | 'references'
  | 'review'
  | 'ai-interview' // New AI-guided interview step

export interface StepConfig {
  id: CVStep
  title: string
  description: string
  icon: string
}

