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
      className="w-64 bg-white border-r border-gray-200 h-full flex flex-col"
      aria-label="Sidebar navigation"
    >
      {onClose && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1"
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
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
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

      {children && <div className="p-4 border-t border-gray-200">{children}</div>}
    </aside>
  )
}
