import { useNavigate } from 'react-router-dom'
import { Button } from '../common/Button'

export interface AuthBackButtonProps {
  fallbackTo: string
  label?: string
}

export function AuthBackButton({ fallbackTo, label = 'Back' }: AuthBackButtonProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate(fallbackTo, { replace: true })
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={handleBack} className="mb-4">
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M10.707 4.293a1 1 0 00-1.414 0l-5 5a1 1 0 000 1.414l5 5a1 1 0 001.414-1.414L7.414 11H16a1 1 0 100-2H7.414l3.293-3.293a1 1 0 000-1.414z"
          clipRule="evenodd"
        />
      </svg>
      {label}
    </Button>
  )
}

