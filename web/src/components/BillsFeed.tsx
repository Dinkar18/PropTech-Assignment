import type { Bill } from '../types/models'
import { BillCard } from './BillCard'

type BillsFeedProps = {
  bills: Bill[]
  loadingData: boolean
  payingShareId: string | null
  paymentError: { shareId: string; message: string } | null
  onPayShare: (billId: string, shareId: string) => void
}

export function BillsFeed({
  bills,
  loadingData,
  payingShareId,
  paymentError,
  onPayShare,
}: BillsFeedProps) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 19, fontWeight: 700, margin: 0, color: '#0f172a' }}>
            Shared Bills
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>
            Review allocations and settle payments
          </p>
        </div>
        {loadingData && (
          <span
            style={{
              fontSize: 12,
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span
              className="spinner"
              style={{ borderColor: '#cbd5e1', borderTopColor: '#4f46e5' }}
            />
            Updating...
          </span>
        )}
      </div>

      {loadingData && bills.length === 0 ? (
        <div
          className="fintech-card"
          style={{ padding: '48px 24px', textAlign: 'center', color: '#94a3b8' }}
        >
          <div
            className="spinner"
            style={{
              width: 24,
              height: 24,
              borderColor: '#e2e8f0',
              borderTopColor: '#4f46e5',
              marginBottom: 12,
            }}
          />
          <div style={{ fontSize: 14 }}>Loading flat bills...</div>
        </div>
      ) : bills.length === 0 ? (
        <div
          className="fintech-card"
          style={{
            padding: '54px 24px',
            textAlign: 'center',
            color: '#64748b',
            borderRadius: 16,
            background: '#ffffff',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: '#eef2ff',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              fontSize: 26,
            }}
          >
            🧾
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
            No bills recorded yet
          </div>
          <p
            style={{
              margin: '4px auto 0',
              maxWidth: 320,
              fontSize: 13,
              color: '#64748b',
            }}
          >
            Split your first bill on the right to see how amounts divide evenly across roommates.
          </p>
        </div>
      ) : (
        bills.map((bill) => (
          <BillCard
            key={bill.id}
            bill={bill}
            payingShareId={payingShareId}
            paymentError={paymentError}
            onPayShare={onPayShare}
          />
        ))
      )}
    </section>
  )
}
