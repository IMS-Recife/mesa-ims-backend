import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'

import { Connection } from 'mongoose'
import * as request from 'supertest'

import { AppModule } from '../../app.module'
import { DatabaseService } from '../../database/database.service'
import { userStub } from '../../user/test/stubs/user.stub'
import { UserService } from '../../user/user.service'

const LOGIN_URL = '/v1/auth/login'
const FILTERS_URL = '/v1/filters'

describe('Filter controller', () => {
  let app: INestApplication
  let httpServer: any
  let dbConnection: Connection
  let token: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()

    httpServer = app.getHttpServer()
    dbConnection = moduleRef.get<DatabaseService>(DatabaseService).getDbHandler()
    const userService = moduleRef.get<UserService>(UserService)

    const user = await userService.create(userStub())
    token = (
      await request(httpServer).post(LOGIN_URL).send({ email: user.email, password: '123123' })
    ).body.token.accessToken
  })

  afterEach(async () => {
    await dbConnection.collection('filters').deleteMany({})
  })

  afterAll(async () => {
    await dbConnection.collection('users').deleteMany({})
    await app.close()
  })

  describe('Get filters', () => {
    it('should get all filter values with correct key', async () => {
      const projectFilter = {
        key: 'project',
        values: {
          name: ['Parque Capibaribe'],
          location: ['Recife']
        }
      }

      await dbConnection.collection('filters').insertMany([
        projectFilter,
        {
          key: 'another',
          values: {}
        }
      ])

      const { status, body } = await request(httpServer)
        .get(`${FILTERS_URL}/${projectFilter.key}`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)

      expect(body).toBeDefined()
      expect(body.name.length).toBe(1)
      expect(body.name[0]).toBe(projectFilter.values.name[0])
      expect(body.location.length).toBe(1)
      expect(body.location[0]).toBe(projectFilter.values.location[0])
    })

    it('should return empty if a specified key does not exist', async () => {
      await dbConnection.collection('filters').insertMany([
        {
          key: 'project',
          values: {
            name: ['Parque Capibaribe'],
            location: ['Recife']
          }
        }
      ])

      const { status, body } = await request(httpServer)
        .get(`${FILTERS_URL}/anyKey`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)
      expect(body).toMatchObject({})
    })

    it('should return empty if there are no filters', async () => {
      const { status, body } = await request(httpServer)
        .get(`${FILTERS_URL}/anyKey`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)
      expect(body).toMatchObject({})
    })
  })
})
