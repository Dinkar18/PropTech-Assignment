import type { Bill } from '../types/models'

export class BillRepository {
  constructor(private readonly db: D1Database) {}

  async createBillWithShares(
    bill: { id: string; homeId: string; title: string; totalCents: number },
    shares: Array<{ id: string; memberId: string; amountCents: number; orderIdx: number }>,
  ): Promise<void> {
    const statements: D1PreparedStatement[] = []

    statements.push(
      this.db
        .prepare('INSERT INTO bills (id, home_id, title, total_cents) VALUES (?, ?, ?, ?)')
        .bind(bill.id, bill.homeId, bill.title, bill.totalCents),
    )

    for (const share of shares) {
      statements.push(
        this.db
          .prepare(
            'INSERT INTO shares (id, bill_id, member_id, amount_cents, order_idx) VALUES (?, ?, ?, ?, ?)',
          )
          .bind(share.id, bill.id, share.memberId, share.amountCents, share.orderIdx),
      )
    }

    await this.db.batch(statements)
  }

  async listBillsWithSharesByHomeId(homeId: string): Promise<Bill[]> {
    const { results: bills } = await this.db
      .prepare(
        'SELECT id, home_id, title, total_cents, created_at FROM bills WHERE home_id = ? ORDER BY created_at DESC',
      )
      .bind(homeId)
      .all<{
        id: string
        home_id: string
        title: string
        total_cents: number
        created_at: string
      }>()

    if (!bills || bills.length === 0) return []

    const { results: allShares } = await this.db
      .prepare(`
        SELECT 
          s.id,
          s.bill_id,
          s.member_id,
          s.amount_cents,
          s.paid_at,
          m.name AS member_name
        FROM shares s
        JOIN members m ON m.id = s.member_id
        JOIN bills b ON b.id = s.bill_id
        WHERE b.home_id = ?
        ORDER BY s.order_idx ASC
      `)
      .bind(homeId)
      .all<{
        id: string
        bill_id: string
        member_id: string
        amount_cents: number
        paid_at: string | null
        member_name: string
      }>()

    const sharesByBill = new Map<
      string,
      Array<{
        id: string
        memberId: string
        memberName: string
        amountCents: number
        paidAt: string | null
      }>
    >()

    for (const s of allShares || []) {
      const list = sharesByBill.get(s.bill_id) || []
      list.push({
        id: s.id,
        memberId: s.member_id,
        memberName: s.member_name,
        amountCents: s.amount_cents,
        paidAt: s.paid_at,
      })
      sharesByBill.set(s.bill_id, list)
    }

    return bills.map((b) => ({
      id: b.id,
      homeId: b.home_id,
      title: b.title,
      totalCents: b.total_cents,
      createdAt: b.created_at,
      shares: sharesByBill.get(b.id) || [],
    }))
  }
}
