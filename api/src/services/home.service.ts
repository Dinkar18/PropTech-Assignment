import { HttpError, parseRequiredString } from '../domain/validation'
import type { HomeRepository } from '../repositories/home.repository'
import type { Home, Member } from '../types/models'

export class HomeService {
  constructor(private readonly homeRepo: HomeRepository) {}

  async createHome(rawName: unknown): Promise<{ id: string; name: string }> {
    const name = parseRequiredString(rawName, 'Name')
    const id = crypto.randomUUID()
    return this.homeRepo.create(id, name)
  }

  async listHomes(): Promise<Home[]> {
    return this.homeRepo.listAll()
  }

  async getHome(homeId: string): Promise<Home & { members: Member[] }> {
    const home = await this.homeRepo.findById(homeId)
    if (!home) {
      throw new HttpError(404, 'Home not found')
    }
    const members = await this.homeRepo.getMembersByHomeId(homeId)
    return { ...home, members }
  }

  async addMember(
    homeId: string,
    rawName: unknown,
  ): Promise<{ id: string; homeId: string; name: string }> {
    const home = await this.homeRepo.findById(homeId)
    if (!home) {
      throw new HttpError(404, 'Home not found')
    }

    const name = parseRequiredString(rawName, 'Name')
    const id = crypto.randomUUID()
    const nextOrderIdx = await this.homeRepo.getNextMemberOrderIdx(homeId)

    const member = await this.homeRepo.addMember(id, homeId, name, nextOrderIdx)
    return { id: member.id, homeId: member.homeId, name: member.name }
  }
}
