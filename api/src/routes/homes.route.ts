import { Hono } from 'hono'
import { HomeRepository } from '../repositories/home.repository'
import { HomeService } from '../services/home.service'

export const homesRoute = new Hono<{ Bindings: Env }>()

homesRoute.post('/', async (c) => {
  const body = (await c.req.json().catch(() => null)) as { name?: unknown } | null
  const homeRepo = new HomeRepository(c.env.DB)
  const homeService = new HomeService(homeRepo)

  const home = await homeService.createHome(body?.name)
  return c.json(home, 201)
})

homesRoute.get('/', async (c) => {
  const homeRepo = new HomeRepository(c.env.DB)
  const homeService = new HomeService(homeRepo)

  const homes = await homeService.listHomes()
  return c.json({ homes })
})

homesRoute.get('/:homeId', async (c) => {
  const homeId = c.req.param('homeId')
  const homeRepo = new HomeRepository(c.env.DB)
  const homeService = new HomeService(homeRepo)

  const home = await homeService.getHome(homeId)
  return c.json(home)
})

homesRoute.post('/:homeId/members', async (c) => {
  const homeId = c.req.param('homeId')
  const body = (await c.req.json().catch(() => null)) as { name?: unknown } | null
  const homeRepo = new HomeRepository(c.env.DB)
  const homeService = new HomeService(homeRepo)

  const member = await homeService.addMember(homeId, body?.name)
  return c.json(member, 201)
})
