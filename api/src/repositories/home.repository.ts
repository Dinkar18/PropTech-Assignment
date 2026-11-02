import type { Home, Member } from '../types/models'

export class HomeRepository {
  constructor(private readonly db: D1Database) {}

  async findById(id: string): Promise<Home | null> {
    const row = await this.db
      .prepare('SELECT id, name, created_at FROM homes WHERE id = ?')
      .bind(id)
      .first<{ id: string; name: string; created_at: string }>()

    if (!row) return null
    return { id: row.id, name: row.name, createdAt: row.created_at }
  }

  async create(id: string, name: string): Promise<Home> {
    await this.db.prepare('INSERT INTO homes (id, name) VALUES (?, ?)').bind(id, name).run()
    return { id, name }
  }

  async listAll(): Promise<Home[]> {
    const { results } = await this.db
      .prepare('SELECT id, name, created_at FROM homes ORDER BY created_at DESC')
      .all<{ id: string; name: string; created_at: string }>()

    return (results || []).map((row) => ({
      id: row.id,
      name: row.name,
      createdAt: row.created_at,
    }))
  }

  async getMembersByHomeId(homeId: string): Promise<Member[]> {
    const { results } = await this.db
      .prepare(
        'SELECT id, home_id, name, order_idx, created_at FROM members WHERE home_id = ? ORDER BY order_idx ASC',
      )
      .bind(homeId)
      .all<{ id: string; home_id: string; name: string; order_idx: number; created_at: string }>()

    return (results || []).map((row) => ({
      id: row.id,
      homeId: row.home_id,
      name: row.name,
      orderIdx: row.order_idx,
      createdAt: row.created_at,
    }))
  }

  async getNextMemberOrderIdx(homeId: string): Promise<number> {
    const maxOrder = await this.db
      .prepare('SELECT COALESCE(MAX(order_idx), 0) AS maxIdx FROM members WHERE home_id = ?')
      .bind(homeId)
      .first<{ maxIdx: number }>()

    return (maxOrder?.maxIdx ?? 0) + 1
  }

  async addMember(id: string, homeId: string, name: string, orderIdx: number): Promise<Member> {
    await this.db
      .prepare('INSERT INTO members (id, home_id, name, order_idx) VALUES (?, ?, ?, ?)')
      .bind(id, homeId, name, orderIdx)
      .run()

    return { id, homeId, name, orderIdx }
  }
}
