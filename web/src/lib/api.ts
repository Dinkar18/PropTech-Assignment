import type { Balance, Bill, Home, Member } from '../types/models'

export async function fetchHomes(): Promise<Home[]> {
  const res = await fetch('/api/homes')
  if (!res.ok) {
    throw new Error(`Failed to load properties (HTTP ${res.status})`)
  }
  const data = (await res.json()) as { homes: Home[] }
  return data.homes || []
}

export async function fetchHomeData(homeId: string): Promise<{
  members: Member[]
  bills: Bill[]
  balances: Balance[]
}> {
  const [homeRes, billsRes, balancesRes] = await Promise.all([
    fetch(`/api/homes/${homeId}`),
    fetch(`/api/homes/${homeId}/bills`),
    fetch(`/api/homes/${homeId}/balances`),
  ])

  if (!homeRes.ok) {
    const errJson = (await homeRes.json().catch(() => null)) as { error?: string } | null
    throw new Error(errJson?.error || `Property error (HTTP ${homeRes.status})`)
  }

  const homeData = (await homeRes.json()) as { members?: Member[] }
  const billsData = billsRes.ok ? ((await billsRes.json()) as { bills: Bill[] })?.bills || [] : []
  const balancesData = balancesRes.ok
    ? ((await balancesRes.json()) as { balances: Balance[] })?.balances || []
    : []

  return {
    members: homeData.members || [],
    bills: billsData,
    balances: balancesData,
  }
}

export async function createHome(name: string): Promise<Home> {
  const res = await fetch('/api/homes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  const data = (await res.json().catch(() => null)) as {
    id?: string
    name?: string
    error?: string
  } | null
  if (!res.ok || !data?.id) {
    throw new Error(data?.error || `Failed to create property (HTTP ${res.status})`)
  }
  return { id: data.id, name: data.name || name }
}

export async function addMember(homeId: string, name: string): Promise<Member> {
  const res = await fetch(`/api/homes/${homeId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  const data = (await res.json().catch(() => null)) as {
    id?: string
    homeId?: string
    name?: string
    orderIdx?: number
    error?: string
  } | null
  if (!res.ok || !data?.id) {
    throw new Error(data?.error || `Failed to add roommate (HTTP ${res.status})`)
  }
  return {
    id: data.id,
    homeId: data.homeId || homeId,
    name: data.name || name,
    orderIdx: data.orderIdx || 0,
  }
}

export async function createBill(homeId: string, title: string, totalCents: number): Promise<Bill> {
  const res = await fetch(`/api/homes/${homeId}/bills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, totalCents }),
  })
  const data = (await res.json().catch(() => null)) as { id?: string; error?: string } | null
  if (!res.ok || !data?.id) {
    throw new Error(data?.error || `Failed to split bill (HTTP ${res.status})`)
  }
  return data as unknown as Bill
}

export async function payShare(
  billId: string,
  shareId: string,
  idempotencyKey: string,
): Promise<{ id: string; paidAt: string }> {
  const res = await fetch(`/api/bills/${billId}/shares/${shareId}/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
  })
  const data = (await res.json().catch(() => null)) as {
    id?: string
    paidAt?: string
    error?: string
  } | null

  if (!res.ok || !data?.paidAt) {
    throw new Error(data?.error || `Payment failed (HTTP ${res.status})`)
  }
  return { id: data.id || shareId, paidAt: data.paidAt }
}
