import { calculateBillShares } from '../domain/splitter'
import { HttpError, parsePositiveIntegerCents } from '../domain/validation'
import type { BillRepository } from '../repositories/bill.repository'
import type { HomeRepository } from '../repositories/home.repository'
import type { Bill, Share } from '../types/models'

export class BillService {
  constructor(
    private readonly billRepo: BillRepository,
    private readonly homeRepo: HomeRepository,
  ) {}

  async createBill(
    homeId: string,
    rawTitle: unknown,
    rawTotalCents: unknown,
  ): Promise<{
    id: string
    homeId: string
    title: string
    totalCents: number
    shares: Share[]
  }> {
    const home = await this.homeRepo.findById(homeId)
    if (!home) {
      throw new HttpError(404, 'Home not found')
    }

    const totalCents = parsePositiveIntegerCents(rawTotalCents)
    if (typeof rawTitle !== 'string' || !rawTitle.trim()) {
      throw new HttpError(422, 'title is required')
    }
    const title = rawTitle.trim()

    const members = await this.homeRepo.getMembersByHomeId(homeId)
    if (members.length === 0) {
      throw new HttpError(422, 'Home has no members')
    }

    const calculatedShares = calculateBillShares(
      totalCents,
      members.map((m) => m.id),
    )

    const billId = crypto.randomUUID()
    const sharesToCreate: Array<{
      id: string
      memberId: string
      amountCents: number
      orderIdx: number
    }> = []
    const responseShares: Share[] = []

    calculatedShares.forEach((share, index) => {
      const shareId = crypto.randomUUID()
      sharesToCreate.push({
        id: shareId,
        memberId: share.memberId,
        amountCents: share.amountCents,
        orderIdx: index + 1,
      })
      responseShares.push({
        id: shareId,
        memberId: share.memberId,
        amountCents: share.amountCents,
        paidAt: null,
      })
    })

    await this.billRepo.createBillWithShares(
      { id: billId, homeId, title, totalCents },
      sharesToCreate,
    )

    return {
      id: billId,
      homeId,
      title,
      totalCents,
      shares: responseShares,
    }
  }

  async getBills(homeId: string): Promise<Bill[]> {
    const home = await this.homeRepo.findById(homeId)
    if (!home) {
      throw new HttpError(404, 'Home not found')
    }
    return this.billRepo.listBillsWithSharesByHomeId(homeId)
  }
}
