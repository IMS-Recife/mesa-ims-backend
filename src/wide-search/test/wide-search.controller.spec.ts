import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'

import { Connection } from 'mongoose'
import * as request from 'supertest'

import { AppModule } from '../../app.module'
import { DatabaseService } from '../../database/database.service'

import { userStub } from '../../user/test/stubs/user.stub'
import { UserService } from '../../user/user.service'

const LOGIN_URL = '/v1/auth/login'
const WIDE_SEARCH_URL = '/v1/wide-search'
const PROJECT_NAMES = ['Parque Capibaribe', 'Calçada Legal']

describe('Wide search controller', () => {
  let app: INestApplication
  let httpServer: any
  let userService: UserService
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
    userService = moduleRef.get<UserService>(UserService)

    const user = await userService.create(userStub())
    token = (
      await request(httpServer).post(LOGIN_URL).send({ email: user.email, password: '123123' })
    ).body.token.accessToken

    await dbConnection.collection('projects').insertMany([
      {
        name: PROJECT_NAMES[0],
        info: {
          location: 'Recife',
          lastUpdate: '2022-01-01T00:00:00.0'
        }
      },
      {
        name: PROJECT_NAMES[1],
        info: {
          location: 'Recife',
          lastUpdate: '2022-01-01T00:00:00.0'
        }
      }
    ])
  })

  afterAll(async () => {
    await dbConnection.collection('users').deleteMany({})
    await dbConnection.collection('projects').deleteMany({})
    await app.close()
  })

  describe('Search for project name', () => {
    it('should list projects matching exact name', async () => {
      const { status, body } = await request(httpServer)
        .get(`${WIDE_SEARCH_URL}/${PROJECT_NAMES[0]}`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)
      expect(body.projects).toBeDefined()
      expect(body.projects.length).toBe(1)
      expect(body.projects[0].name).toBe(PROJECT_NAMES[0])
      expect(body.projects[0].info).toBeDefined()
      expect(body.projects[0].info.location).toBeDefined()
      expect(body.projects[0].info.lastUpdate).toBeDefined()
    })

    it('should list projects matching exact lowercase name', async () => {
      const { status, body } = await request(httpServer)
        .get(`${WIDE_SEARCH_URL}/${PROJECT_NAMES[0].toLowerCase()}`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)
      expect(body.projects).toBeDefined()
      expect(body.projects.length).toBe(1)
      expect(body.projects[0].name).toBe(PROJECT_NAMES[0])
      expect(body.projects[0].info).toBeDefined()
      expect(body.projects[0].info.location).toBeDefined()
      expect(body.projects[0].info.lastUpdate).toBeDefined()
    })

    it('should list projects matching partial lowercase name', async () => {
      const { status, body } = await request(httpServer)
        .get(`${WIDE_SEARCH_URL}/${PROJECT_NAMES[0].split(' ')[0].toLowerCase()}`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)
      expect(body.projects).toBeDefined()
      expect(body.projects.length).toBe(1)
      expect(body.projects[0].name).toBe(PROJECT_NAMES[0])
      expect(body.projects[0].info).toBeDefined()
      expect(body.projects[0].info.location).toBeDefined()
      expect(body.projects[0].info.lastUpdate).toBeDefined()
    })

    it('should list all projects with generic term in alphabetical order', async () => {
      const { status, body } = await request(httpServer)
        .get(`${WIDE_SEARCH_URL}/a`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)
      expect(body.projects).toBeDefined()
      expect(body.projects.length).toBe(2)
      expect(body.projects[0].name).toBe(PROJECT_NAMES[1])
      expect(body.projects[1].name).toBe(PROJECT_NAMES[0])
    })

    it('should return empty if term does not match any project name', async () => {
      const { status, body } = await request(httpServer)
        .get(`${WIDE_SEARCH_URL}/Zoológico`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)
      expect(body.projects).toBeDefined()
      expect(body.projects.length).toBe(0)
    })
  })
})
