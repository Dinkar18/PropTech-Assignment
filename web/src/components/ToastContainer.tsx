import type { Toast } from '../types/models'

type ToastContainerProps = {
  toasts: Toast[]
}

export function ToastContainer({ toasts }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        zIndex: 50,
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-slide-up"
          style={{
            padding: '12px 18px',
            borderRadius: 12,
            background:
              toast.type === 'success' ? '#065f46' : toast.type === 'error' ? '#9f1239' : '#0f172a',
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 600,
            boxShadow: '0 10px 25px -4px rgba(15, 23, 42, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>{toast.type === 'success' ? '✓' : toast.type === 'error' ? '⚠' : 'ℹ'}</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  )
}
