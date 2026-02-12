/**
 * Sidebar Component
 * Optional sidebar navigation
 */

import { ReactNode } from 'react'

export interface SidebarItem {
  label: string
  href: string
  icon?: ReactNode
  active?: boolean
}

export interface SidebarProps {
  items?: SidebarItem[]
  children?: ReactNode
  isOpen?: boolean
  onClose?: () => void
}

/**
 * Sidebar
 * Sidebar navigation component (optional, can be used for additional navigation)
 */
export function Sidebar({
  items = [],
  children,
  isOpen = true,
  onClose,
}: SidebarProps) {
  if (!isOpen) return null

  return (
    <aside
      className="flex h-full w-64 flex-col border-r border-slate-200 bg-white"
      aria-label="Sidebar navigation"
    >
      {onClose && (
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-semibold text-slate-900">Navigation</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close sidebar"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {items.length > 0 && (
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {items.map((item, index) => (
              <li key={index}>
                <a
                  href={item.href}
                  className={`flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    item.active
                      ? 'border border-blue-200 bg-blue-50 text-blue-800'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {children && <div className="border-t border-slate-200 p-4">{children}</div>}
    </aside>
  )
}
