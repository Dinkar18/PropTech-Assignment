import type { Home } from '../types/models'

type HeaderProps = {
  homes: Home[]
  selectedHomeId: string
  onSelectHome: (id: string) => void
  showHomeModal: boolean
  onToggleHomeModal: (show: boolean) => void
  newHomeName: string
  onChangeNewHomeName: (name: string) => void
  onCreateHome: (e: React.FormEvent) => void
}

export function Header({
  homes,
  selectedHomeId,
  onSelectHome,
  showHomeModal,
  onToggleHomeModal,
  newHomeName,
  onChangeNewHomeName,
  onCreateHome,
}: HeaderProps) {
  return (
    <header
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
      }}
    >
      <div
        style={{
          maxWidth: 1160,
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {/* Logo & Hindi Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(79, 70, 229, 0.25)',
            }}
          >
            <svg
              role="img"
              aria-label="House logo"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>House logo</title>
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span
                className="font-brand"
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: '#0f172a',
                  letterSpacing: '0.01em',
                  lineHeight: 1,
                }}
              >
                हिसाब घर
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#6366f1',
                  background: '#eef2ff',
                  padding: '2px 8px',
                  borderRadius: 999,
                }}
              >
                Co-Living
              </span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#64748b', marginTop: 3 }}>
              Shared living expenses made simple
            </div>
          </div>
        </div>

        {/* Property Selector & New Flat Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {homes.length > 0 && (
            <div style={{ position: 'relative' }}>
              <select
                value={selectedHomeId}
                onChange={(e) => onSelectHome(e.target.value)}
                style={{
                  padding: '9px 36px 9px 14px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: 14,
                  fontWeight: 600,
                  appearance: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                }}
              >
                {homes.map((h) => (
                  <option key={h.id} value={h.id}>
                    🏠 {h.name}
                  </option>
                ))}
              </select>
              <div
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  fontSize: 10,
                  color: '#64748b',
                }}
              >
                ▼
              </div>
            </div>
          )}

          {showHomeModal ? (
            <form onSubmit={onCreateHome} style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="e.g. Flat 4B"
                value={newHomeName}
                onChange={(e) => onChangeNewHomeName(e.target.value)}
                className="fintech-input"
                style={{ padding: '8px 12px', fontSize: 13, width: 180 }}
              />
              <button
                type="submit"
                disabled={!newHomeName.trim()}
                className="fintech-btn-primary"
                style={{ padding: '8px 14px', fontSize: 13 }}
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => onToggleHomeModal(false)}
                className="fintech-btn-secondary"
                style={{ padding: '8px 12px', fontSize: 13 }}
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => onToggleHomeModal(true)}
              className="fintech-btn-secondary"
              style={{
                padding: '9px 14px',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>+</span> New Flat
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
