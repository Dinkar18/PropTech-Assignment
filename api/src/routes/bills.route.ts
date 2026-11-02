import { Hono } from 'hono'
import { BillRepository } from '../repositories/bill.repository'
import { HomeRepository } from '../repositories/home.repository'
import { BillService } from '../services/bill.service'

export const billsRoute = new Hono<{ Bindings: Env }>()

billsRoute.post('/:homeId/bills', async (c) => {
  const homeId = c.req.param('homeId')
  const body = (await c.req.json().catch(() => null)) as {
    title?: unknown
    totalCents?: unknown
  } | null

  const billRepo = new BillRepository(c.env.DB)
  const homeRepo = new HomeRepository(c.env.DB)
  const billService = new BillService(billRepo, homeRepo)

  const createdBill = await billService.createBill(homeId, body?.title, body?.totalCents)
  return c.json(createdBill, 201)
})

billsRoute.get('/:homeId/bills', async (c) => {
  const homeId = c.req.param('homeId')
  const billRepo = new BillRepository(c.env.DB)
  const homeRepo = new HomeRepository(c.env.DB)
  const billService = new BillService(billRepo, homeRepo)

  const bills = await billService.getBills(homeId)
  return c.json({ bills })
})
