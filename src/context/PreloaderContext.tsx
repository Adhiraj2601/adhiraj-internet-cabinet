/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react'

interface PreloaderContextValue {
  heroEntered: boolean
  triggerHeroEntrance: () => void
}

const PreloaderContext = createContext<PreloaderContextValue>({
  heroEntered: false,
  triggerHeroEntrance: () => {},
})

export function PreloaderProvider({ children }: { children: React.ReactNode }) {
  const [heroEntered, setHeroEntered] = useState(false)
  const triggerHeroEntrance = useCallback(() => setHeroEntered(true), [])

  return (
    <PreloaderContext.Provider
      value={{
        heroEntered,
        triggerHeroEntrance,
      }}
    >
      {children}
    </PreloaderContext.Provider>
  )
}

export const usePreloaderContext = () => useContext(PreloaderContext)
