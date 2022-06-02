import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'

import { Connection, InsertManyResult } from 'mongoose'
import * as request from 'supertest'

import { AppModule } from '../../app.module'
import { DatabaseService } from '../../database/database.service'

import { userStub } from './stubs/user.stub'
import { UserService } from '../user.service'
import { UserDocument } from '../entities/user.schema'

const LOGIN_URL = '/v1/auth/login'
const FAVORITE_PROJECT_URL = '/v1/users/favorite-projects'
const PROJECT_NAMES = ['Parque Capibaribe', 'Calçada Legal']

describe('User controller - favorite projects', () => {
  let app: INestApplication
  let httpServer: any
  let userService: UserService
  let dbConnection: Connection
  let user: UserDocument
  let token: string
  let projectInfos: InsertManyResult

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()

    httpServer = app.getHttpServer()
    dbConnection = moduleRef.get<DatabaseService>(DatabaseService).getDbHandler()
    userService = moduleRef.get<UserService>(UserService)

    user = await userService.create(userStub())
    token = (
      await request(httpServer).post(LOGIN_URL).send({ email: user.email, password: '123123' })
    ).body.token.accessToken

    projectInfos = await dbConnection.collection('projects').insertMany([
      {
        name: PROJECT_NAMES[0],
        info: {
          lastUpdate: '2022-01-01T00:00:00.0'
        }
      },
      {
        name: PROJECT_NAMES[1],
        info: {
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

  describe('Add favorite project', () => {
    afterEach(async () => {
      await dbConnection.collection('users').updateMany({}, { $set: { favoriteProjects: [] } })
    })

    it('should add favorite project to user if user has no favorites', async () => {
      const { status, body } = await request(httpServer)
        .put(`${FAVORITE_PROJECT_URL}/${projectInfos.insertedIds[0]}`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(204)
      expect(body).toMatchObject({})

      user = await userService.findOneById(user._id, ['favoriteProjects'])
      expect(user).toBeDefined()
      expect(user.favoriteProjects).toBeDefined()
      expect(user.favoriteProjects.length).toBe(1)
      expect(user.favoriteProjects[0].toString()).toBe(
        projectInfos.insertedIds[0].toString()
      )
    })

    it('should add favorite project to user if user has favorites', async () => {
      user.favoriteProjects.push(projectInfos.insertedIds[0] as any)
      await user.save()

      const { status, body } = await request(httpServer)
        .put(`${FAVORITE_PROJECT_URL}/${projectInfos.insertedIds[1]}`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(204)
      expect(body).toMatchObject({})

      user = await userService.findOneById(user._id, ['favoriteProjects'])
      expect(user).toBeDefined()
      expect(user.favoriteProjects).toBeDefined()
      expect(user.favoriteProjects.length).toBe(2)
      expect(user.favoriteProjects[0].toString()).toBe(
        projectInfos.insertedIds[0].toString()
      )
      expect(user.favoriteProjects[1].toString()).toBe(
        projectInfos.insertedIds[1].toString()
      )
    })

    it('should fail if specified project is already a favorite of the user', async () => {
      user.favoriteProjects.push(projectInfos.insertedIds[0] as any)
      await user.save()

      const { status, body } = await request(httpServer)
        .put(`${FAVORITE_PROJECT_URL}/${projectInfos.insertedIds[0]}`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(422)
      expect(body.message).toBe('Projeto informado já é um favorito do usuário')
    })

    it('should fail if specified project does not exist', async () => {
      const { status, body } = await request(httpServer)
        .put(`${FAVORITE_PROJECT_URL}/61f04ae896cbff333872c333`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(404)
      expect(body.message).toBe('Projeto informado não existe')
    })
  })

  describe('List favorite projects', () => {
    it('should list all favorite projects of user in alphabetical order', async () => {
      user.favoriteProjects.push(
        projectInfos.insertedIds[0] as any,
        projectInfos.insertedIds[1] as any
      )
      await user.save()

      const { status, body } = await request(httpServer)
        .get(FAVORITE_PROJECT_URL)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)
      expect(body.length).toBe(2)
      expect(body[0]._id).toBe(projectInfos.insertedIds[1].toString())
      expect(body[0].name).toBe(PROJECT_NAMES[1])
      expect(body[0].info).toBeDefined()
      expect(body[0].info.lastUpdate).toBeDefined()
      expect(body[1]._id).toBe(projectInfos.insertedIds[0].toString())
      expect(body[1].name).toBe(PROJECT_NAMES[0])
      expect(body[1].info).toBeDefined()
      expect(body[1].info.lastUpdate).toBeDefined()

      user.favoriteProjects = []
      await user.save()
    })

    it('should return empty list if user has no favorite projects', async () => {
      const { status, body } = await request(httpServer)
        .get(FAVORITE_PROJECT_URL)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)
      expect(body.length).toBe(0)
    })
  })

  describe('Remove favorite project', () => {
    afterEach(async () => {
      await dbConnection.collection('users').updateMany({}, { $set: { favoriteProjects: [] } })
    })

    it('should remove specified favorite project of user', async () => {
      user.favoriteProjects.push(
        projectInfos.insertedIds[0] as any,
        projectInfos.insertedIds[1] as any
      )
      await user.save()

      const { status, body } = await request(httpServer)
        .delete(`${FAVORITE_PROJECT_URL}/${projectInfos.insertedIds[0]}`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(204)
      expect(body).toMatchObject({})

      user = await userService.findOneById(user._id, ['favoriteProjects'])
      expect(user.favoriteProjects).toBeDefined()
      expect(user.favoriteProjects.length).toBe(1)
      expect(user.favoriteProjects[0].toString()).toBe(projectInfos.insertedIds[1].toString())
    })

    it('should return empty if specified favorite project does not exist', async () => {
      user.favoriteProjects.push(projectInfos.insertedIds[0] as any)
      await user.save()

      const { status, body } = await request(httpServer)
        .delete(`${FAVORITE_PROJECT_URL}/507f191e810c19729de860ea`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(204)
      expect(body).toMatchObject({})

      user = await userService.findOneById(user._id, ['favoriteProjects'])
      expect(user.favoriteProjects).toBeDefined()
      expect(user.favoriteProjects.length).toBe(1)
      expect(user.favoriteProjects[0].toString()).toBe(projectInfos.insertedIds[0].toString())
    })

    it('should return empty if user has no favorite projects', async () => {
      const { status, body } = await request(httpServer)
        .delete(`${FAVORITE_PROJECT_URL}/61f04ae896cbff333872c333`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(204)
      expect(body).toMatchObject({})
    })
  })
})
