"use client";

import { createContext, useContext, useEffect, useState } from "react"

export type ColorTheme = "default" | "blue" | "green" | "purple" | "orange"
export type DarkMode = "light" | "dark" | "system"

export interface ThemeConfig {
  darkMode: DarkMode
  colorTheme: ColorTheme
}

type ThemeProviderProps = {
  children: React.ReactNode
  defaultDarkMode?: DarkMode
  defaultColorTheme?: ColorTheme
  storageKey?: string
}

type ThemeProviderState = {
  darkMode: DarkMode
  colorTheme: ColorTheme
  setDarkMode: (mode: DarkMode) => void
  setColorTheme: (theme: ColorTheme) => void
}

const initialState: ThemeProviderState = {
  darkMode: "system",
  colorTheme: "default",
  setDarkMode: () => null,
  setColorTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultDarkMode = "system",
  defaultColorTheme = "default",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [darkMode, setDarkMode] = useState<DarkMode>(defaultDarkMode)
  const [colorTheme, setColorTheme] = useState<ColorTheme>(defaultColorTheme)
  const [mounted, setMounted] = useState(false)

  // Load theme from localStorage after mounting
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as ThemeConfig
          if (parsed.darkMode) setDarkMode(parsed.darkMode)
          if (parsed.colorTheme) setColorTheme(parsed.colorTheme)
        } catch {
          // Handle legacy single theme format
          const legacyTheme = stored as string
          if (legacyTheme === "dark" || legacyTheme === "light" || legacyTheme === "system") {
            setDarkMode(legacyTheme as DarkMode)
          } else if (legacyTheme === "blue" || legacyTheme === "green" || legacyTheme === "purple" || legacyTheme === "orange") {
            setColorTheme(legacyTheme as ColorTheme)
          }
        }
      }
      setMounted(true)
    }
  }, [storageKey])

  useEffect(() => {
    if (typeof window === 'undefined' || !mounted) return
    
    const root = window.document.documentElement

    // Remove all theme classes
    root.classList.remove("light", "dark", "default", "blue", "green", "purple", "orange")

    // Apply dark mode
    let resolvedDarkMode = darkMode
    if (darkMode === "system") {
      resolvedDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    root.classList.add(resolvedDarkMode)

    // Apply color theme
    if (colorTheme !== "default") {
      root.classList.add(colorTheme)
    }
  }, [darkMode, colorTheme, mounted])

  const value = {
    darkMode,
    colorTheme,
    setDarkMode: (newDarkMode: DarkMode) => {
      if (typeof window !== 'undefined') {
        const config: ThemeConfig = { darkMode: newDarkMode, colorTheme }
        localStorage.setItem(storageKey, JSON.stringify(config))
      }
      setDarkMode(newDarkMode)
    },
    setColorTheme: (newColorTheme: ColorTheme) => {
      if (typeof window !== 'undefined') {
        const config: ThemeConfig = { darkMode, colorTheme: newColorTheme }
        localStorage.setItem(storageKey, JSON.stringify(config))
      }
      setColorTheme(newColorTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}