import { Hono } from 'hono'
import { HomeRepository } from '../repositories/home.repository'
import { PaymentRepository } from '../repositories/payment.repository'
import { PaymentService } from '../services/payment.service'

export const paymentsRoute = new Hono<{ Bindings: Env }>()

paymentsRoute.post('/:billId/shares/:shareId/pay', async (c) => {
  const billId = c.req.param('billId')
  const shareId = c.req.param('shareId')
  const idempotencyHeader = c.req.header('idempotency-key') || c.req.header('Idempotency-Key')

  const paymentRepo = new PaymentRepository(c.env.DB)
  const homeRepo = new HomeRepository(c.env.DB)
  const paymentService = new PaymentService(paymentRepo, homeRepo)

  const paidShare = await paymentService.payShare(billId, shareId, idempotencyHeader)
  return c.json(paidShare, 200)
})
