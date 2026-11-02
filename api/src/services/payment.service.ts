import { HttpError, parseIdempotencyKey } from '../domain/validation'
import type { HomeRepository } from '../repositories/home.repository'
import type { PaymentRepository } from '../repositories/payment.repository'
import type { Balance } from '../types/models'

export class PaymentService {
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly homeRepo: HomeRepository,
  ) {}

  async payShare(
    billId: string,
    shareId: string,
    rawKey: string | undefined,
  ): Promise<{ id: string; memberId: string; amountCents: number; paidAt: string }> {
    const idempotencyKey = parseIdempotencyKey(rawKey)

    const bill = await this.paymentRepo.findBillById(billId)
    if (!bill) {
      throw new HttpError(404, 'Bill not found')
    }

    const share = await this.paymentRepo.findShareById(shareId)
    if (!share || share.bill_id !== billId) {
      throw new HttpError(404, 'Share not found')
    }

    // Already paid check (Idempotent response vs conflict)
    if (share.paid_at !== null) {
      if (share.idempotency_key === idempotencyKey) {
        return {
          id: share.id,
          memberId: share.member_id,
          amountCents: share.amount_cents,
          paidAt: share.paid_at,
        }
      }
      throw new HttpError(409, 'Share already paid with a different idempotency key')
    }

    // Atomic state transition
    const now = new Date().toISOString()
    try {
      const updated = await this.paymentRepo.payShareConditionally(shareId, idempotencyKey, now)
      if (updated) {
        return {
          id: share.id,
          memberId: share.member_id,
          amountCents: share.amount_cents,
          paidAt: now,
        }
      }

      // Concurrency reconciliation: another process paid first
      const fresh = await this.paymentRepo.findShareById(shareId)
      if (fresh?.paid_at && fresh.idempotency_key === idempotencyKey) {
        return {
          id: fresh.id,
          memberId: fresh.member_id,
          amountCents: fresh.amount_cents,
          paidAt: fresh.paid_at,
        }
      }

      throw new HttpError(409, 'Share already paid with a different idempotency key')
    } catch (err: unknown) {
      if (err instanceof HttpError) throw err
      throw new HttpError(409, 'Share already paid with a different idempotency key')
    }
  }

  async getBalances(homeId: string): Promise<Balance[]> {
    const home = await this.homeRepo.findById(homeId)
    if (!home) {
      throw new HttpError(404, 'Home not found')
    }
    return this.paymentRepo.getBalancesByHomeId(homeId)
  }
}
