export type Share = {
  id: string
  memberId: string
  memberName: string
  amountCents: number
  paidAt: string | null
}

export type Bill = {
  id: string
  homeId: string
  title: string
  totalCents: number
  createdAt: string
  shares: Share[]
}

export type Member = {
  id: string
  homeId: string
  name: string
  orderIdx: number
}

export type Balance = {
  memberId: string
  name: string
  outstandingCents: number
}

export type Home = {
  id: string
  name: string
}

export type Toast = {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

export type PresetBill = {
  icon: string
  title: string
  amount: number
}
