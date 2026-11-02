import type { Balance, ShareRecord } from '../types/models'

export class PaymentRepository {
  constructor(private readonly db: D1Database) {}

  async findBillById(billId: string): Promise<{ id: string } | null> {
    return this.db.prepare('SELECT id FROM bills WHERE id = ?').bind(billId).first<{ id: string }>()
  }

  async findShareById(shareId: string): Promise<ShareRecord | null> {
    return this.db
      .prepare(
        'SELECT id, bill_id, member_id, amount_cents, paid_at, idempotency_key FROM shares WHERE id = ?',
      )
      .bind(shareId)
      .first<ShareRecord>()
  }

  async payShareConditionally(
    shareId: string,
    idempotencyKey: string,
    paidAt: string,
  ): Promise<boolean> {
    const updateResult = await this.db
      .prepare(
        'UPDATE shares SET paid_at = ?, idempotency_key = ? WHERE id = ? AND paid_at IS NULL',
      )
      .bind(paidAt, idempotencyKey, shareId)
      .run()

    return updateResult.meta.changes > 0
  }

  async getBalancesByHomeId(homeId: string): Promise<Balance[]> {
    const { results } = await this.db
      .prepare(`
        SELECT 
          m.id AS memberId,
          m.name AS name,
          COALESCE(SUM(CASE WHEN s.paid_at IS NULL AND s.id IS NOT NULL THEN s.amount_cents ELSE 0 END), 0) AS outstandingCents
        FROM members m
        LEFT JOIN shares s ON s.member_id = m.id
        WHERE m.home_id = ?
        GROUP BY m.id, m.name, m.order_idx
        ORDER BY m.order_idx ASC
      `)
      .bind(homeId)
      .all<{ memberId: string; name: string; outstandingCents: number }>()

    return (results || []).map((r) => ({
      memberId: r.memberId,
      name: r.name,
      outstandingCents: r.outstandingCents,
    }))
  }
}
