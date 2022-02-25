import { Chance } from 'chance'

import { User } from '../../entities/user.schema'
import { Role } from '../../entities/role.enum'

export const userStub = (): User => {
  const chance = Chance()

  return {
    name: chance.name(),
    email: chance.email(),
    password: '123123',
    roles: [Role.CITIZEN],
    facebookId: null
  }
}
