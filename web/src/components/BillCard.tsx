import { formatMoney, getAvatarPalette, getInitials } from '../lib/formatters'
import type { Bill } from '../types/models'

type BillCardProps = {
  bill: Bill
  payingShareId: string | null
  paymentError: { shareId: string; message: string } | null
  onPayShare: (billId: string, shareId: string) => void
}

export function BillCard({ bill, payingShareId, paymentError, onPayShare }: BillCardProps) {
  const paidShares = bill.shares.filter((s) => s.paidAt !== null).length
  const progressPercent = Math.round((paidShares / bill.shares.length) * 100)
  const isAllPaid = progressPercent === 100

  return (
    <div
      className="fintech-card"
      style={{
        borderRadius: 16,
        overflow: 'hidden',
        background: '#ffffff',
      }}
    >
      {/* Bill Header */}
      <div
        style={{
          padding: '18px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{bill.title}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
            Added on {new Date(bill.createdAt).toLocaleDateString()} • {bill.shares.length} shares
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
              {formatMoney(bill.totalCents)}
            </div>
          </div>
          <span
            style={{
              background: isAllPaid ? '#ecfdf5' : '#eef2ff',
              color: isAllPaid ? '#065f46' : '#4338ca',
              border: `1px solid ${isAllPaid ? '#a7f3d0' : '#c7d2fe'}`,
              fontSize: 12,
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 999,
            }}
          >
            {isAllPaid ? '✓ Fully Settled' : `${progressPercent}% Settled`}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ height: 4, background: '#f1f5f9', width: '100%' }}>
        <div
          style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: isAllPaid ? '#10b981' : '#4f46e5',
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      {/* Shares List */}
      <div
        style={{
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {bill.shares.map((share, sIdx) => {
          const isPaid = share.paidAt !== null
          const isPaying = payingShareId === share.id
          const hasError = paymentError?.shareId === share.id
          const palette = getAvatarPalette(sIdx)

          return (
            <div key={share.id}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  background: isPaid ? '#f8fafc' : '#ffffff',
                  border: `1px solid ${isPaid ? '#f1f5f9' : '#e2e8f0'}`,
                  borderRadius: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: palette.bg,
                      color: palette.text,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {getInitials(share.memberName || 'M')}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>
                      {share.memberName || 'Roommate'}
                    </span>
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#334155',
                      }}
                    >
                      {formatMoney(share.amountCents)}
                    </span>
                  </div>
                </div>

                <div>
                  {isPaid ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        background: '#ecfdf5',
                        color: '#065f46',
                        border: '1px solid #a7f3d0',
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: 999,
                      }}
                    >
                      ✓ Paid
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={isPaying}
                      onClick={() => onPayShare(bill.id, share.id)}
                      className="fintech-btn-primary"
                      style={{
                        padding: '6px 14px',
                        fontSize: 13,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        borderRadius: 8,
                      }}
                    >
                      {isPaying && <span className="spinner" />}
                      {isPaying ? 'Paying...' : `Pay ${formatMoney(share.amountCents)}`}
                    </button>
                  )}
                </div>
              </div>

              {hasError && (
                <div
                  style={{
                    marginTop: 4,
                    padding: '8px 12px',
                    background: '#fff1f2',
                    border: '1px solid #fecdd3',
                    borderRadius: 8,
                    color: '#9f1239',
                    fontSize: 12,
                  }}
                >
                  Payment could not be processed: {paymentError.message}. Share remains unpaid.
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
