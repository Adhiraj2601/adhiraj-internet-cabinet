/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react'

interface PreloaderContextValue {
  heroEntered: boolean
  triggerHeroEntrance: () => void
  loaderDone: boolean
  setLoaderDone: () => void
}

const PreloaderContext = createContext<PreloaderContextValue>({
  heroEntered: false,
  triggerHeroEntrance: () => {},
  loaderDone: false,
  setLoaderDone: () => {},
})

export function PreloaderProvider({ children }: { children: React.ReactNode }) {
  const [heroEntered, setHeroEntered] = useState(false)
  const [loaderDone, setLoaderDoneState] = useState(false)

  const triggerHeroEntrance = useCallback(() => setHeroEntered(true), [])
  const setLoaderDone = useCallback(() => setLoaderDoneState(true), [])

  return (
    <PreloaderContext.Provider
      value={{
        heroEntered,
        triggerHeroEntrance,
        loaderDone,
        setLoaderDone,
      }}
    >
      {children}
    </PreloaderContext.Provider>
  )
}

export const usePreloaderContext = () => useContext(PreloaderContext)

