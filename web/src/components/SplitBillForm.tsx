import { formatMoney, PRESET_BILLS } from '../lib/formatters'
import type { Member } from '../types/models'

type SplitBillFormProps = {
  members: Member[]
  newBillTitle: string
  onChangeTitle: (title: string) => void
  newBillAmount: string
  onChangeAmount: (amount: string) => void
  submittingBill: boolean
  billFormError: string | null
  onSubmit: (e: React.FormEvent) => void
}

export function SplitBillForm({
  members,
  newBillTitle,
  onChangeTitle,
  newBillAmount,
  onChangeAmount,
  submittingBill,
  billFormError,
  onSubmit,
}: SplitBillFormProps) {
  const parsedRupees = Number.parseFloat(newBillAmount)
  const parsedInputCents =
    Number.isFinite(parsedRupees) && parsedRupees > 0 ? Math.round(parsedRupees * 100) : 0
  const isValidAmount = parsedInputCents > 0
  const splitPreview =
    isValidAmount && members.length > 0
      ? {
          base: Math.floor(parsedInputCents / members.length),
          remainder: parsedInputCents % members.length,
        }
      : null

  return (
    <div
      className="fintech-card"
      style={{
        padding: 24,
        background: '#ffffff',
        borderRadius: 16,
      }}
    >
      <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>
        Split an Expense
      </h3>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>
        Splits expenses evenly in Rupees with deterministic remainder distribution
      </p>

      {/* Quick Preset Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {PRESET_BILLS.map((preset) => (
          <button
            key={preset.title}
            type="button"
            onClick={() => {
              onChangeTitle(preset.title)
              onChangeAmount(String(preset.amount))
            }}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: 12,
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            {preset.icon} {preset.title}
          </button>
        ))}
      </div>

      {billFormError && (
        <div
          style={{
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            color: '#9f1239',
            padding: '10px 12px',
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 14,
          }}
        >
          {billFormError}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label
            htmlFor="bill-title-field"
            style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 600,
              color: '#334155',
              marginBottom: 4,
            }}
          >
            Expense Description
          </label>
          <input
            id="bill-title-field"
            type="text"
            placeholder="e.g. WiFi Bill (March)"
            value={newBillTitle}
            onChange={(e) => onChangeTitle(e.target.value)}
            className="fintech-input"
          />
        </div>

        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 4,
            }}
          >
            <label
              htmlFor="bill-cents-field"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#334155',
              }}
            >
              Amount in Rupees (₹)
            </label>
            {isValidAmount && (
              <span style={{ fontSize: 13, fontWeight: 700, color: '#4f46e5' }}>
                = {formatMoney(parsedInputCents)}
              </span>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                fontWeight: 700,
                color: '#64748b',
                fontSize: 16,
                pointerEvents: 'none',
              }}
            >
              ₹
            </span>
            <input
              id="bill-cents-field"
              type="number"
              step="any"
              min="0.01"
              placeholder="e.g. 1500 for WiFi, or 197.50"
              value={newBillAmount}
              onChange={(e) => onChangeAmount(e.target.value)}
              className="fintech-input"
              style={{ paddingLeft: 34 }}
            />
          </div>
        </div>

        {/* Live Split Preview */}
        {splitPreview && (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 10,
              padding: '12px',
              fontSize: 13,
              color: '#166534',
            }}
          >
            <div style={{ fontWeight: 700 }}>
              ↳ Each roommate pays {formatMoney(splitPreview.base)}
            </div>
            <div style={{ fontSize: 12, marginTop: 2, color: '#15803d' }}>
              Total: {formatMoney(parsedInputCents)}
              {splitPreview.remainder > 0 &&
                ` • +1 paise remainder given to first ${splitPreview.remainder} roommate(s)`}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submittingBill || members.length === 0}
          className="fintech-btn-primary"
          style={{
            padding: '12px',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 4,
          }}
        >
          {submittingBill && <span className="spinner" />}
          {submittingBill
            ? 'Splitting Bill...'
            : isValidAmount
              ? `Split ${formatMoney(parsedInputCents)} Bill`
              : 'Split Bill'}
        </button>
      </form>
    </div>
  )
}
