/**
 * Empty State Component
 * Displays empty state message with optional CTA
 */

import { ReactNode } from 'react'
import { Button, ButtonProps } from './Button'

export interface EmptyStateProps {
  title: string
  message?: string
  icon?: ReactNode
  action?: {
    label: string
    onClick: () => void
    variant?: ButtonProps['variant']
  }
  className?: string
}

export function EmptyState({
  title,
  message,
  icon,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      {icon && (
        <div className="mb-4 text-gray-400" aria-hidden="true">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>

      {message && (
        <p className="text-sm text-gray-500 max-w-sm mb-6">{message}</p>
      )}

      {action && (
        <Button
          variant={action.variant || 'primary'}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

/**
 * Default empty state icon (document)
 */
export function EmptyStateIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`h-12 w-12 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  )
}

/**
 * Empty state for no datasets
 */
export function EmptyDatasetsState({
  onUpload,
}: {
  onUpload: () => void
}) {
  return (
    <EmptyState
      title="No datasets yet"
      message="Get started by uploading your first CSV or Excel file"
      icon={<EmptyStateIcon />}
      action={{
        label: 'Upload Dataset',
        onClick: onUpload,
        variant: 'primary',
      }}
    />
  )
}

/**
 * Empty state for no records
 */
export function EmptyRecordsState({ message }: { message?: string }) {
  return (
    <EmptyState
      title="No records found"
      message={message || 'Try adjusting your search or filters'}
      icon={<EmptyStateIcon />}
    />
  )
}
