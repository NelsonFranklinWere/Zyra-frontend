'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, Printer } from 'lucide-react'
import { CVData } from './types'
import { Button } from '@/components/ui/button'
import html2pdf from 'html2pdf.js'

interface CVPreviewProps {
  cvData: CVData
}

export function CVPreview({ cvData }: CVPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null)

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  const handleExportPDF = async () => {
    if (!previewRef.current) return

    try {
      const element = previewRef.current
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `${cvData.profile.fullName || 'CV'}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      }

      await html2pdf().set(opt).from(element).save()
    } catch (error) {
      console.error('Failed to export PDF:', error)
      alert('Failed to export PDF. Please try again.')
    }
  }

  const handleExportWord = () => {
    if (!previewRef.current) return

    try {
      const content = previewRef.current.innerHTML
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${cvData.profile.fullName || 'CV'}</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 210mm; margin: 0 auto; padding: 20mm; }
              h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
              h2 { color: #1e40af; margin-top: 20px; margin-bottom: 10px; }
              .section { margin-bottom: 20px; }
              .contact-info { margin-bottom: 15px; }
              ul { margin: 5px 0; padding-left: 20px; }
              .skill-tag { display: inline-block; background: #e5e7eb; padding: 2px 8px; border-radius: 4px; margin: 2px; }
            </style>
          </head>
          <body>
            ${content}
          </body>
        </html>
      `

      const blob = new Blob([html], { type: 'application/msword' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${cvData.profile.fullName || 'CV'}.doc`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export Word:', error)
      alert('Failed to export Word document. Please try again.')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Export Actions */}
      <div className="flex flex-wrap items-center gap-3 glass-card p-4 rounded-xl border border-white/10">
        <Button
          onClick={handleExportPDF}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
        <Button
          onClick={handleExportWord}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <FileText className="w-4 h-4 mr-2" />
          Export Word
        </Button>
        <Button
          onClick={handlePrint}
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
        >
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
      </div>

      {/* Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-2xl overflow-hidden"
      >
        <div
          ref={previewRef}
          className="p-8 md:p-12 text-gray-900"
          style={{ minHeight: '297mm' }}
        >
          {/* Header */}
          <div className="border-b-2 border-blue-600 pb-4 mb-6">
            <h1 className="text-4xl font-bold text-blue-600 mb-2">
              {cvData.profile.fullName || 'Your Name'}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {cvData.profile.email && (
                <span>{cvData.profile.email}</span>
              )}
              {cvData.profile.phoneNumber && (
                <span>{cvData.profile.phoneNumber}</span>
              )}
              {cvData.profile.location && (
                <span>{cvData.profile.location}</span>
              )}
              {cvData.profile.linkedin && (
                <span>
                  <a href={cvData.profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    LinkedIn
                  </a>
                </span>
              )}
              {cvData.profile.portfolio && (
                <span>
                  <a href={cvData.profile.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Portfolio
                  </a>
                </span>
              )}
            </div>
          </div>

          {/* Professional Summary */}
          {(cvData.cv_assets?.summary_options?.[0] || cvData.profile.aboutMe) && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-blue-800 mb-2">Professional Summary</h2>
              <p className="text-gray-700 leading-relaxed">
                {cvData.cv_assets?.summary_options?.[0] || cvData.profile.aboutMe}
              </p>
              {cvData.cv_assets?.summary_options?.[0] && (
                <p className="text-xs text-gray-500 mt-2 italic">✨ AI-Enhanced Summary</p>
              )}
            </div>
          )}

          {/* Experience */}
          {cvData.experience.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-blue-800 mb-3">Work Experience</h2>
              <div className="space-y-4">
                {cvData.experience.map((exp, idx) => (
                  <div key={idx} className="mb-4">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{exp.jobTitle}</h3>
                        <p className="text-gray-700 font-medium">{exp.company}</p>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        {exp.startDate && formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                      </div>
                    </div>
                    {exp.location && (
                      <p className="text-sm text-gray-600 mb-2">{exp.location}</p>
                    )}
                    {exp.industry && (
                      <p className="text-sm text-gray-600 mb-2">{exp.industry}</p>
                    )}
                    {exp.employmentType && (
                      <p className="text-sm text-gray-600 mb-2">{exp.employmentType}</p>
                    )}
                    {exp.responsibilities && (
                      <div className="mb-2">
                        <h4 className="text-sm font-semibold text-gray-800 mb-1">Responsibilities:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                          {Array.isArray(exp.responsibilities) 
                            ? exp.responsibilities.map((resp: string, i: number) => (
                                <li key={i}>{resp.trim().replace(/^[-•]\s*/, '')}</li>
                              ))
                            : exp.responsibilities.split('\n').filter((line: string) => line.trim()).map((line: string, i: number) => (
                                <li key={i}>{line.trim().replace(/^[-•]\s*/, '')}</li>
                              ))
                          }
                        </ul>
                      </div>
                    )}
                    {exp.achievements && (
                      <div className="mb-2">
                        <h4 className="text-sm font-semibold text-gray-800 mb-1">Key Achievements:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                          {Array.isArray(exp.achievements)
                            ? exp.achievements.map((ach: string | { text: string; metric: string }, i: number) => (
                                <li key={i}>{typeof ach === 'string' ? ach.trim().replace(/^[-•]\s*/, '') : ach.text || ach.metric || ''}</li>
                              ))
                            : typeof exp.achievements === 'string' 
                              ? exp.achievements.split('\n').filter((line: string) => line.trim()).map((line: string, i: number) => (
                                  <li key={i}>{line.trim().replace(/^[-•]\s*/, '')}</li>
                                ))
                              : null
                          }
                        </ul>
                      </div>
                    )}
                    {exp.toolsTechnologies && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 mb-1">Tools & Technologies:</h4>
                        <p className="text-sm text-gray-700">{exp.toolsTechnologies}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {cvData.education.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-blue-800 mb-3">Education</h2>
              <div className="space-y-3">
                {cvData.education.map((edu, idx) => (
                  <div key={idx} className="mb-3">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{edu.course}</h3>
                        <p className="text-gray-700 font-medium">{edu.institution}</p>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        {edu.startYear} - {edu.endYear}
                      </div>
                    </div>
                    {edu.qualification && (
                      <p className="text-sm text-gray-600">{edu.qualification}</p>
                    )}
                    {edu.gpa && (
                      <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>
                    )}
                    {edu.honors && (
                      <p className="text-sm text-gray-600">Honors: {edu.honors}</p>
                    )}
                    {edu.achievements && (
                      <p className="text-sm text-gray-700 mt-1">{edu.achievements}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {cvData.skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-blue-800 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {cvData.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-800"
                  >
                    {skill.name}
                    {skill.proficiency && ` (${skill.proficiency})`}
                    {skill.confidence_percent && (
                      <span className="ml-1 text-xs text-gray-500">
                        ({Math.round(skill.confidence_percent)}% confidence)
                      </span>
                    )}
                  </span>
                ))}
              </div>
              {cvData.ai_insights && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">✨ AI Career Insights</h4>
                  {cvData.ai_insights.dominantPath && (
                    <p className="text-xs text-blue-800 mb-1">
                      <strong>Career Path:</strong> {cvData.ai_insights.dominantPath}
                    </p>
                  )}
                  {cvData.ai_insights.skillStrength && (
                    <div className="text-xs text-blue-800 mb-1">
                      <strong>Skill Strengths:</strong>
                      <div className="ml-2 mt-1">
                        {cvData.ai_insights.skillStrength.frontend > 0 && (
                          <span className="mr-2">Frontend: {cvData.ai_insights.skillStrength.frontend}%</span>
                        )}
                        {cvData.ai_insights.skillStrength.backend > 0 && (
                          <span className="mr-2">Backend: {cvData.ai_insights.skillStrength.backend}%</span>
                        )}
                        {cvData.ai_insights.skillStrength.data > 0 && (
                          <span className="mr-2">Data: {cvData.ai_insights.skillStrength.data}%</span>
                        )}
                      </div>
                    </div>
                  )}
                  {cvData.ai_insights.suggestedImprovements && cvData.ai_insights.suggestedImprovements.length > 0 && (
                    <div className="text-xs text-blue-800 mt-2">
                      <strong>Suggested Improvements:</strong>
                      <ul className="list-disc list-inside ml-2 mt-1">
                        {cvData.ai_insights.suggestedImprovements.slice(0, 3).map((improvement, idx) => (
                          <li key={idx}>{improvement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {/* Grouped by category */}
              {cvData.skills.some(s => s.category) && (
                <div className="mt-4 space-y-3">
                  {['Technical', 'Analytical', 'Soft Skill'].map(category => {
                    const categorySkills = cvData.skills.filter(s => s.category === category)
                    if (categorySkills.length === 0) return null
                    return (
                      <div key={category}>
                        <h4 className="text-sm font-semibold text-gray-800 mb-1">{category}:</h4>
                        <div className="flex flex-wrap gap-2">
                          {categorySkills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-50 rounded text-sm text-gray-700"
                            >
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Projects */}
          {cvData.projects.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-blue-800 mb-3">Projects</h2>
              <div className="space-y-4">
                {cvData.projects.map((project, idx) => (
                  <div key={idx} className="mb-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Project
                        </a>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-gray-700 mb-2">{project.description}</p>
                    )}
                    {project.role && (
                      <p className="text-sm text-gray-600 mb-2"><strong>Role:</strong> {project.role}</p>
                    )}
                    {project.techStack && project.techStack.length > 0 && (
                      <div className="mb-2">
                        <strong className="text-sm text-gray-800">Technologies: </strong>
                        <span className="text-sm text-gray-700">
                          {project.techStack.join(', ')}
                        </span>
                      </div>
                    )}
                    {project.outcome && (
                      <p className="text-sm text-gray-700 italic">{project.outcome}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {cvData.certifications.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-blue-800 mb-3">Certifications</h2>
              <div className="space-y-2">
                {cvData.certifications.map((cert, idx) => (
                  <div key={idx} className="mb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">{cert.name}</h3>
                        <p className="text-sm text-gray-700">{cert.organization}</p>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        {cert.issueDate && formatDate(cert.issueDate)}
                        {cert.expiryDate && ` - ${formatDate(cert.expiryDate)}`}
                      </div>
                    </div>
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View Credential
                      </a>
                    )}
                    {cert.relatedSkill && (
                      <p className="text-sm text-gray-600">Domain: {cert.relatedSkill}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {cvData.languages.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-blue-800 mb-3">Languages</h2>
              <div className="flex flex-wrap gap-4">
                {cvData.languages.map((lang, idx) => (
                  <div key={idx} className="text-gray-700">
                    <strong>{lang.name}:</strong> {lang.proficiency}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* References */}
          {cvData.references.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-blue-800 mb-3">References</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cvData.references.map((ref, idx) => (
                  <div key={idx} className="text-gray-700">
                    <h3 className="font-semibold text-gray-900">{ref.name}</h3>
                    <p className="text-sm">{ref.role}</p>
                    <p className="text-sm">{ref.organization}</p>
                    <p className="text-sm text-gray-600">{ref.contact}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          [data-print="preview"] * {
            visibility: visible;
          }
          [data-print="preview"] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}





