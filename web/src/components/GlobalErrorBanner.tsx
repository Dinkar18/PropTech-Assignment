type GlobalErrorBannerProps = {
  error: string
  onRetry: () => void
}

export function GlobalErrorBanner({ error, onRetry }: GlobalErrorBannerProps) {
  return (
    <div
      className="animate-slide-up"
      style={{
        background: '#fff1f2',
        border: '1px solid #fecdd3',
        borderRadius: 14,
        padding: '14px 18px',
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ color: '#9f1239', fontSize: 14, fontWeight: 500 }}>{error}</div>
      <button
        type="button"
        onClick={onRetry}
        style={{
          background: '#e11d48',
          color: '#ffffff',
          border: 'none',
          padding: '6px 14px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Retry
      </button>
    </div>
  )
}
