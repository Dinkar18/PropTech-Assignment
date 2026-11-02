import { Hono } from 'hono'
import { HttpError } from './domain/validation'
import { balancesRoute } from './routes/balances.route'
import { billsRoute } from './routes/bills.route'
import { homesRoute } from './routes/homes.route'
import { paymentsRoute } from './routes/payments.route'

const app = new Hono<{ Bindings: Env }>()

// Centralized error handling
app.onError((err, c) => {
  if (err instanceof HttpError) {
    return c.json({ error: err.message }, err.statusCode)
  }
  return c.json({ error: err.message || 'Internal server error' }, 500)
})

// Health probe
app.get('/api/health', (c) => c.json({ status: 'ok' }))

// Feature route modules
app.route('/api/homes', homesRoute)
app.route('/api/homes', billsRoute)
app.route('/api/homes', balancesRoute)
app.route('/api/bills', paymentsRoute)

export default app
