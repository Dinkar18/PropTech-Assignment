import { formatMoney, getAvatarPalette, getInitials } from '../lib/formatters'
import type { Balance, Member } from '../types/models'

type HouseholdSummaryProps = {
  totalOutstandingCents: number
  members: Member[]
  settledBillsCount: number
  totalBillsCount: number
  balances: Balance[]
}

export function HouseholdSummary({
  totalOutstandingCents,
  members,
  settledBillsCount,
  totalBillsCount,
  balances,
}: HouseholdSummaryProps) {
  return (
    <section
      className="fintech-card"
      style={{
        padding: '24px 28px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 18,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 20,
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: 20,
          marginBottom: 20,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Household Settlement Overview
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 4 }}>
            <div
              style={{
                fontSize: 34,
                fontWeight: 800,
                color: totalOutstandingCents > 0 ? '#0f172a' : '#15803d',
                letterSpacing: '-0.03em',
              }}
            >
              {formatMoney(totalOutstandingCents)}
            </div>
            <span style={{ fontSize: 14, color: '#64748b' }}>total unpaid across flat</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>Roommates</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
              {members.length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>Settled Bills</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
              {settledBillsCount} of {totalBillsCount}
            </div>
          </div>
        </div>
      </div>

      {/* Roommate Balances Row */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 12 }}>
          Roommate Balances (Joined Order)
        </div>

        {members.length === 0 ? (
          <div
            style={{
              padding: '16px',
              background: '#f8fafc',
              borderRadius: 10,
              color: '#64748b',
              fontSize: 13,
            }}
          >
            No roommates added yet. Add a flatmate on the right to start tracking balances.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
            }}
          >
            {balances.map((b, idx) => {
              const palette = getAvatarPalette(idx)
              const isClear = b.outstandingCents === 0

              return (
                <div
                  key={b.memberId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: isClear ? '#f0fdf4' : '#ffffff',
                    border: `1px solid ${isClear ? '#bbf7d0' : '#e2e8f0'}`,
                    borderRadius: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: palette.bg,
                        color: palette.text,
                        border: `1px solid ${palette.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {getInitials(b.name)}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                        {b.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Flatmate #{idx + 1}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: isClear ? '#15803d' : '#92400e',
                      }}
                    >
                      {formatMoney(b.outstandingCents)}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: isClear ? '#15803d' : '#b45309',
                        fontWeight: 500,
                      }}
                    >
                      {isClear ? '✓ Clear' : 'due'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
