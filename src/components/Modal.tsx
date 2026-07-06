import { useEffect } from 'react'
import type { ReactNode } from 'react'

interface Props {
  title?: string
  onClose?: () => void
  children: ReactNode
  wide?: boolean
}

export default function Modal({ title, onClose, children, wide }: Props) {
  useEffect(() => {
    if (!onClose) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (onClose && e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={`modal-card${wide ? ' modal-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {(title || onClose) && (
          <div className="modal-head">
            {title ? <h2>{title}</h2> : <span />}
            {onClose && (
              <button
                type="button"
                className="modal-close"
                aria-label="Schließen"
                onClick={onClose}
              >
                ×
              </button>
            )}
          </div>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
