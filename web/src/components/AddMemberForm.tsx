import { getAvatarPalette, getInitials } from '../lib/formatters'
import type { Member } from '../types/models'

type AddMemberFormProps = {
  members: Member[]
  newMemberName: string
  onChangeName: (name: string) => void
  onSubmit: (e: React.FormEvent) => void
}

export function AddMemberForm({
  members,
  newMemberName,
  onChangeName,
  onSubmit,
}: AddMemberFormProps) {
  return (
    <div
      className="fintech-card"
      style={{
        padding: 24,
        background: '#ffffff',
        borderRadius: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0f172a' }}>
          Flatmates ({members.length})
        </h3>
        <span style={{ fontSize: 12, color: '#64748b' }}>Joined sequence</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
        {members.map((m, idx) => {
          const palette = getAvatarPalette(idx)
          return (
            <div
              key={m.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                background: '#f8fafc',
                borderRadius: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: palette.bg,
                    color: palette.text,
                    fontSize: 11,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {getInitials(m.name)}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{m.name}</span>
              </div>
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>#{idx + 1}</span>
            </div>
          )
        })}
      </div>

      <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder="Roommate name (e.g. Dev)"
          value={newMemberName}
          onChange={(e) => onChangeName(e.target.value)}
          className="fintech-input"
          style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}
        />
        <button
          type="submit"
          disabled={!newMemberName.trim()}
          className="fintech-btn-secondary"
          style={{ padding: '8px 14px', fontSize: 13 }}
        >
          Add
        </button>
      </form>
    </div>
  )
}
