/**
 * Pure domain logic for dividing a bill across home members.
 *
 * Rules:
 * 1. Total shares must sum exactly to totalCents.
 * 2. Un-even remainders are distributed 1 cent at a time to members
 *    in the exact order they joined the home.
 */
export type CalculatedShare = {
  memberId: string
  amountCents: number
}

export function calculateBillShares(totalCents: number, memberIds: string[]): CalculatedShare[] {
  if (memberIds.length === 0) {
    throw new Error('Cannot split a bill with zero members')
  }

  const memberCount = memberIds.length
  const baseShareCents = Math.floor(totalCents / memberCount)
  const remainderCents = totalCents % memberCount

  return memberIds.map((memberId, index) => {
    const extraCent = index < remainderCents ? 1 : 0
    return {
      memberId,
      amountCents: baseShareCents + extraCent,
    }
  })
}
