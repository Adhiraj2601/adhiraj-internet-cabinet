import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Project } from '../../content/projects'
import { Arrow } from '../ui/Arrow'
import { SectionLabel } from '../ui/SectionLabel'

interface ProjectCardProps {
  project: Project
  index: number
  layout: 'text-left' | 'text-right' | 'full-width' | 'large-text'
}

function ProjectCardTextLeft({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false)

  return (
    <article
      className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center py-10 md:py-16"
      style={{ borderTop: '1px solid var(--border)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Text */}
      <div className="order-2 md:order-1 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="text-[0.7rem] font-semibold tracking-[0.2em] text-muted">{project.number}</span>
          <SectionLabel>{project.category}</SectionLabel>
        </div>
        <h3
          className="font-bold tracking-tight leading-tight"
          style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
        >
          {project.title}
        </h3>
        <p className="text-[0.95rem] leading-relaxed max-w-md" style={{ color: 'var(--muted)' }}>
          {project.description}
        </p>
        <div className="flex items-center gap-6 mt-2">
          <span className="text-[0.7rem] tracking-widest text-muted">{project.year}</span>
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[0.75rem] font-semibold tracking-widest hover:text-accent transition-colors duration-200"
            >
              <motion.span animate={{ x: hovered ? 2 : 0 }} transition={{ duration: 0.2 }}>↗ LIVE</motion.span>
            </a>
          )}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[0.75rem] font-semibold tracking-widest hover:text-accent transition-colors duration-200"
            >
              <motion.span animate={{ x: hovered ? 2 : 0 }} transition={{ duration: 0.2, delay: 0.03 }}>↗ GITHUB</motion.span>
            </a>
          )}
        </div>
      </div>

      {/* Image — fully visible, uncropped */}
      <div className="order-1 md:order-2">
        <motion.div
          className="overflow-hidden border border-token/60 bg-[rgba(23,23,23,0.02)] p-2 sm:p-3 rounded-sm flex items-center justify-center shadow-xs"
          animate={{ scale: hovered ? 1.015 : 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {project.image ? (
            <img
              src={project.image}
              alt={project.title}
              width={600}
              height={400}
              className="w-full h-auto max-h-[500px] object-contain rounded-xs"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-64 flex items-center justify-center">
              <span className="text-muted text-[0.7rem] tracking-widest uppercase font-medium">{project.category}</span>
            </div>
          )}
        </motion.div>
      </div>
    </article>
  )
}

function ProjectCardTextRight({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false)

  return (
    <article
      className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center py-10 md:py-16"
      style={{ borderTop: '1px solid var(--border)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image — fully visible, uncropped */}
      <div>
        <motion.div
          className="overflow-hidden border border-token/60 bg-[rgba(23,23,23,0.02)] p-2 sm:p-3 rounded-sm flex items-center justify-center shadow-xs"
          animate={{ scale: hovered ? 1.015 : 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {project.image ? (
            <img
              src={project.image}
              alt={project.title}
              width={600}
              height={400}
              className="w-full h-auto max-h-[500px] object-contain rounded-xs"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-64 flex items-center justify-center">
              <span className="text-muted text-[0.7rem] tracking-widest uppercase font-medium">{project.category}</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Text */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="text-[0.7rem] font-semibold tracking-[0.2em] text-muted">{project.number}</span>
          <SectionLabel>{project.category}</SectionLabel>
        </div>
        <h3
          className="font-bold tracking-tight leading-tight"
          style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
        >
          {project.title}
        </h3>
        <p className="text-[0.95rem] leading-relaxed max-w-md" style={{ color: 'var(--muted)' }}>
          {project.description}
        </p>
        <div className="flex items-center gap-6 mt-2">
          <span className="text-[0.7rem] tracking-widest text-muted">{project.year}</span>
          {project.live && (
            <a href={project.live} target="_blank" rel="noopener noreferrer"
              className="text-[0.75rem] font-semibold tracking-widest hover:text-accent transition-colors duration-200">
              <motion.span animate={{ x: hovered ? 2 : 0 }} transition={{ duration: 0.2 }}>↗ LIVE</motion.span>
            </a>
          )}
          {project.github && (
            <a href={project.github} target="_blank" rel="noopener noreferrer"
              className="text-[0.75rem] font-semibold tracking-widest hover:text-accent transition-colors duration-200">
              <motion.span animate={{ x: hovered ? 2 : 0 }} transition={{ duration: 0.2, delay: 0.03 }}>↗ GITHUB</motion.span>
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

function ProjectCardFullWidth({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false)

  return (
    <article
      className="py-10 md:py-16"
      style={{ borderTop: '1px solid var(--border)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <span className="text-[0.7rem] font-semibold tracking-[0.2em] text-muted">{project.number}</span>
          <SectionLabel>{project.category}</SectionLabel>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-[0.7rem] tracking-widest text-muted">{project.year}</span>
          {project.github && (
            <a href={project.github} target="_blank" rel="noopener noreferrer"
              className="text-[0.75rem] font-semibold tracking-widest hover:text-accent transition-colors duration-200">
              ↗ GITHUB
            </a>
          )}
        </div>
      </div>

      {/* Image — fully visible, uncropped */}
      <motion.div
        className="overflow-hidden mb-6 border border-token/60 bg-[rgba(23,23,23,0.02)] p-2 sm:p-4 rounded-sm flex items-center justify-center shadow-xs"
        animate={{ scale: hovered ? 1.01 : 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {project.image ? (
          <img
            src={project.image}
            alt={project.title}
            width={800}
            height={500}
            className="w-full h-auto max-h-[750px] object-contain rounded-xs"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-64 flex items-center justify-center">
            <span className="text-muted text-[0.7rem] tracking-widest uppercase font-medium">{project.category}</span>
          </div>
        )}
      </motion.div>

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <h3 className="font-bold tracking-tight leading-tight" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
          {project.title}
        </h3>
        <p className="text-[0.95rem] leading-relaxed max-w-sm" style={{ color: 'var(--muted)' }}>
          {project.description}
        </p>
      </div>
    </article>
  )
}

function ProjectCardLargeText({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false)

  return (
    <article
      className="py-10 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-center"
      style={{ borderTop: '1px solid var(--border)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image — fully visible, uncropped */}
      <div className="md:col-span-5 lg:col-span-4">
        <motion.div
          className="overflow-hidden border border-token/60 bg-[rgba(23,23,23,0.02)] p-2 rounded-sm flex items-center justify-center shadow-xs"
          animate={{ scale: hovered ? 1.02 : 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {project.image ? (
            <img
              src={project.image}
              alt={project.title}
              width={600}
              height={400}
              className="w-full h-auto max-h-[420px] object-contain rounded-xs"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-48 flex items-center justify-center">
              <span className="text-muted text-[0.65rem] tracking-widest uppercase font-medium text-center px-2">{project.category}</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Oversized text */}
      <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-3">
        <div className="flex items-center gap-4 mb-1">
          <span className="text-[0.7rem] font-semibold tracking-[0.2em] text-muted">{project.number}</span>
          <SectionLabel>{project.category}</SectionLabel>
          <span className="text-[0.7rem] tracking-widest text-muted ml-auto">{project.year}</span>
        </div>
        <h3
          className="font-bold tracking-tight leading-none"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 5.5rem)' }}
        >
          {project.title}
        </h3>
        <p className="text-[0.95rem] leading-relaxed max-w-lg mt-2" style={{ color: 'var(--muted)' }}>
          {project.description}
        </p>
        <div className="flex items-center gap-5 mt-2">
          {project.github && (
            <a href={project.github} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[0.75rem] font-semibold tracking-widest hover:text-accent transition-colors duration-200">
              <motion.span animate={{ x: hovered ? 2 : 0 }} transition={{ duration: 0.2 }}>↗ GITHUB</motion.span>
            </a>
          )}
          <motion.div animate={{ x: hovered ? 4 : 0 }} transition={{ duration: 0.2 }}>
            <Arrow size={14} className="text-muted" />
          </motion.div>
        </div>
      </div>
    </article>
  )
}

export function ProjectCard({ project, index: _index, layout }: ProjectCardProps) {
  const layouts = {
    'text-left': <ProjectCardTextLeft project={project} />,
    'text-right': <ProjectCardTextRight project={project} />,
    'full-width': <ProjectCardFullWidth project={project} />,
    'large-text': <ProjectCardLargeText project={project} />,
  }

  return layouts[layout]
}
