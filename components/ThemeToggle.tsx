'use client'

import { useTheme } from '@/lib/theme-context'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  
  // Only access theme after component is mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800">
        <div className="h-5 w-5" /> {/* Placeholder to maintain layout */}
      </div>
    )
  }

  return <ThemeToggleContent />
}

function ThemeToggleContent() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <MoonIcon className="h-5 w-5 text-gray-600" />
      ) : (
        <SunIcon className="h-5 w-5 text-yellow-500" />
      )}
    </button>
  )
} 