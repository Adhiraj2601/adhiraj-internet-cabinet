import { useState, useEffect, useRef, useCallback } from 'react'

export interface TypewriterSection {
  id: string
  label?: string
  text: string
}

interface UseTypewriterOptions {
  speed?: number // ms per character, default ~9ms
  pauseBetween?: number // ms pause after finishing a section, default ~150ms
  enabled?: boolean
  onDone?: () => void
}

export function useTypewriter(
  sections: TypewriterSection[],
  { speed = 9, pauseBetween = 150, enabled = true, onDone }: UseTypewriterOptions = {}
) {
  // Map of section id -> number of visible characters
  const [typedChars, setTypedChars] = useState<Record<string, number>>({})
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const [isDone, setIsDone] = useState(false)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDoneRef = useRef(false)
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  // Check prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const skip = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    const allCompleted: Record<string, number> = {}
    sections.forEach((s) => {
      allCompleted[s.id] = s.text.length
    })
    setTypedChars(allCompleted)
    setActiveSectionId(null)
    setIsDone(true)
    isDoneRef.current = true
    onDoneRef.current?.()
  }, [sections])

  useEffect(() => {
    if (!enabled) return

    // If reduced motion, complete instantly
    if (prefersReducedMotion) {
      skip()
      return
    }

    // Reset state when sections change
    const initialChars: Record<string, number> = {}
    sections.forEach((s) => {
      initialChars[s.id] = 0
    })
    setTypedChars(initialChars)
    setIsDone(false)
    isDoneRef.current = false

    if (sections.length === 0) {
      setIsDone(true)
      isDoneRef.current = true
      onDoneRef.current?.()
      return
    }

    let secIdx = 0
    let charIdx = 0
    setActiveSectionId(sections[0].id)

    function step() {
      if (isDoneRef.current) return

      const currentSec = sections[secIdx]
      if (!currentSec) {
        setIsDone(true)
        isDoneRef.current = true
        setActiveSectionId(null)
        onDoneRef.current?.()
        return
      }

      if (charIdx < currentSec.text.length) {
        charIdx += 1
        setTypedChars((prev) => ({
          ...prev,
          [currentSec.id]: charIdx,
        }))
        timerRef.current = setTimeout(step, speed)
      } else {
        // Finished current section, pause and proceed to next section
        secIdx += 1
        charIdx = 0
        if (secIdx < sections.length) {
          setActiveSectionId(sections[secIdx].id)
          timerRef.current = setTimeout(step, pauseBetween)
        } else {
          setIsDone(true)
          isDoneRef.current = true
          setActiveSectionId(null)
          onDoneRef.current?.()
        }
      }
    }

    timerRef.current = setTimeout(step, 50)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [enabled, sections, speed, pauseBetween, prefersReducedMotion, skip])

  return {
    typedChars,
    activeSectionId,
    isDone,
    skip,
  }
}
