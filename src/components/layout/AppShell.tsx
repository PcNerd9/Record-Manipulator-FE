/**
 * App Shell Component
 * Main application layout wrapper
 */

import { ReactNode } from 'react'
import { Navbar } from './Navbar'

export interface AppShellProps {
  children: ReactNode
  showNavbar?: boolean
}

/**
 * App Shell
 * Provides the main layout structure for the application
 */
export function AppShell({ children, showNavbar = true }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-app)]">
      {showNavbar && <Navbar />}
      <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto w-full max-w-[1400px]">{children}</div>
      </main>
      <footer className="border-t border-slate-200 bg-white/75 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-3 text-center text-xs font-medium tracking-wide text-slate-500 md:px-6">
          Dataset Manipulator Platform
        </div>
      </footer>
    </div>
  )
}
