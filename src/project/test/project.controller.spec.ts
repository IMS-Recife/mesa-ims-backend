import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'

import { Connection } from 'mongoose'
import * as request from 'supertest'

import { AppModule } from '../../app.module'
import { DatabaseService } from '../../database/database.service'
import { userStub } from '../../user/test/stubs/user.stub'
import { UserService } from '../../user/user.service'

const LOGIN_URL = '/v1/auth/login'
const PROJECTS_URL = '/v1/projects'

describe('Project controller', () => {
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
    await dbConnection.collection('projects').deleteMany({})
  })

  afterAll(async () => {
    await dbConnection.collection('users').deleteMany({})
    await app.close()
  })

  describe('Get projects', () => {
    it('should get all projects', async () => {
      await dbConnection.collection('projects').insertMany([
        {
          name: 'Project 1',
          areas: [{ name: 'Area 1' }, { name: 'Area 2' }]
        },
        {
          name: 'Project 2'
        }
      ])

      const { status, body } = await request(httpServer)
        .get(PROJECTS_URL)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)

      expect(body.length).toBe(2)
      expect(body[0].name).toBe('Project 1')
      expect(body[0].areas.length).toBe(2)
      expect(body[1].name).toBe('Project 2')
      expect(body[1].areas).toBeUndefined()
    })

    it('should get a project that match all filters', async () => {
      const project = {
        name: 'Project 1',
        info: {
          location: 'Recife',
          responsibleOrg: 'URB',
          relatedOrg: ['INCITI/UFPE', 'CTTU', 'EMLURB', 'URB', 'Consórcio Beira Rio'],
          tematicGroup: ['Meio Ambiente']
        }
      }

      await dbConnection.collection('projects').insertMany([
        project,
        {
          name: 'Project 2'
        }
      ])

      const { status, body } = await request(httpServer)
        .get(PROJECTS_URL)
        .query({
          name: project.name,
          location: project.info.location,
          responsibleOrg: project.info.responsibleOrg,
          relatedOrd: project.info.relatedOrg[1],
          tematicGroup: project.info.tematicGroup[0]
        })
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)

      expect(body.length).toBe(1)
      expect(body[0].name).toBe(project.name)
    })

    it('should return empty if a project does not match all filters', async () => {
      const project = {
        name: 'Project 1',
        info: {
          location: 'Recife',
          responsibleOrg: 'URB',
          relatedOrg: ['INCITI/UFPE', 'CTTU', 'EMLURB', 'URB', 'Consórcio Beira Rio'],
          tematicGroup: ['Meio Ambiente']
        }
      }

      await dbConnection.collection('projects').insertMany([
        project,
        {
          name: 'Project 2'
        }
      ])

      const { status, body } = await request(httpServer)
        .get(PROJECTS_URL)
        .query({
          name: project.name,
          location: project.info.location,
          responsibleOrg: 'AnotherOrg',
          relatedOrd: project.info.relatedOrg[1],
          tematicGroup: project.info.tematicGroup[0]
        })
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)

      expect(body.length).toBe(0)
    })

    it('should return empty if there are no projects', async () => {
      const { status, body } = await request(httpServer)
        .get(PROJECTS_URL)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)
      expect(body.length).toBe(0)
    })
  })

  describe('Get project areas', () => {
    it('should get a project area', async () => {
      const selectedArea = 'Cool location'

      const insertResult = await dbConnection.collection('projects').insertOne({
        name: 'Project 1',
        areas: [{ name: 'Area 1' }, { name: selectedArea }]
      })

      const { status, body } = await request(httpServer)
        .get(`${PROJECTS_URL}/${insertResult.insertedId}/areas`)
        .query({ areaName: selectedArea })
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)

      expect(body.length).toBe(1)
      expect(body[0].locations.length).toBe(0)
      expect(body[0].name).toBe(selectedArea)
    })

    it('should get all project areas without filter', async () => {
      const insertResult = await dbConnection.collection('projects').insertOne({
        name: 'Project 1',
        areas: [{ name: 'Area 1' }, { name: 'Area 2' }]
      })

      const { status, body } = await request(httpServer)
        .get(`${PROJECTS_URL}/${insertResult.insertedId}/areas`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)

      expect(body.length).toBe(2)
    })

    it('should return empty if specified area does not exist in project', async () => {
      const selectedArea = 'Cool location'

      const insertResult = await dbConnection.collection('projects').insertOne({
        name: 'Project 1',
        areas: [{ name: 'Area 1' }]
      })

      const { status, body } = await request(httpServer)
        .get(`${PROJECTS_URL}/${insertResult.insertedId}/areas`)
        .query({ areaName: selectedArea })
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)
      expect(body.length).toBe(0)
    })

    it('should return empty if there are no projects', async () => {
      const { status, body } = await request(httpServer)
        .get(`${PROJECTS_URL}/507f191e810c19729de860ea/areas`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)
      expect(body.length).toBe(0)
    })
  })
})
