import { Hono } from 'hono'
import { HomeRepository } from '../repositories/home.repository'
import { PaymentRepository } from '../repositories/payment.repository'
import { PaymentService } from '../services/payment.service'

export const balancesRoute = new Hono<{ Bindings: Env }>()

balancesRoute.get('/:homeId/balances', async (c) => {
  const homeId = c.req.param('homeId')
  const paymentRepo = new PaymentRepository(c.env.DB)
  const homeRepo = new HomeRepository(c.env.DB)
  const paymentService = new PaymentService(paymentRepo, homeRepo)

  const balances = await paymentService.getBalances(homeId)
  return c.json({ balances }, 200)
})
