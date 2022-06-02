import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'

import { Connection } from 'mongoose'
import * as request from 'supertest'

import { AppModule } from '../../app.module'
import { DatabaseService } from '../../database/database.service'

import { CoordinateTypes } from '../../location/entities/enum/coordinate-types.enum'
import { Layer } from '../../location/entities/enum/layer.enum'

import { userStub } from '../../user/test/stubs/user.stub'
import { UserService } from '../../user/user.service'
import { UserDocument } from '../entities/user.schema'

const LOGIN_URL = '/v1/auth/login'
const VISION_URL = '/v1/users/visions'

const defaultPoint = {
  type: CoordinateTypes.Point,
  coordinates: [0, 0]
}

const defaultPolygon = {
  type: CoordinateTypes.Polygon,
  coordinates: [
    [
      [1, -1],
      [1, 1],
      [-1, 1],
      [-1, -1],
      [1, -1]
    ]
  ]
}

describe('User controller - visions', () => {
  let app: INestApplication
  let httpServer: any
  let userService: UserService
  let dbConnection: Connection
  let user: UserDocument
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

    user = await userService.create(userStub())
    token = (
      await request(httpServer).post(LOGIN_URL).send({ email: user.email, password: '123123' })
    ).body.token.accessToken
  })

  afterAll(async () => {
    await dbConnection.collection('users').deleteMany({})
    await app.close()
  })

  describe('Vision creation', () => {
    it('should create user vision when user has no visions', async () => {
      const visionRequestBody = {
        layers: [{ name: Layer.URBAN_LICENSING }],
        searchAreas: [defaultPolygon],
        buffer: 0,
        name: 'My vision',
        mapType: 'dark'
      }

      const { status, body } = await request(httpServer)
        .post(VISION_URL)
        .send(visionRequestBody)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(201)
      expect(body).toBeDefined()
      expect(body._id).toBeDefined()
      expect(body.name).toBe(visionRequestBody.name)
      expect(body.mapType).toBe(visionRequestBody.mapType)
      expect(body.buffer).toBe(visionRequestBody.buffer)
      expect(body.layers[0].name).toBe(visionRequestBody.layers[0].name)
      expect(body.searchAreas.length).toBe(visionRequestBody.searchAreas.length)
      expect(body.searchAreas[0].type).toBe(visionRequestBody.searchAreas[0].type)
      expect(body.searchAreas[0].coordinates.length).toBe(
        visionRequestBody.searchAreas[0].coordinates.length
      )

      const userWithVisions = await userService.findOneById(user._id, ['visions'])
      expect(userWithVisions).toBeDefined()
      expect(userWithVisions.visions).toBeDefined()
      expect(userWithVisions.visions.length).toBe(1)
      expect(userWithVisions.visions[0]['_id'].toString()).toBe(body._id)
      expect(userWithVisions.visions[0].name).toBe(visionRequestBody.name)
      expect(userWithVisions.visions[0].mapType).toBe(visionRequestBody.mapType)
      expect(userWithVisions.visions[0].buffer).toBe(visionRequestBody.buffer)
      expect(userWithVisions.visions[0].layers[0].name).toBe(visionRequestBody.layers[0].name)
      expect(userWithVisions.visions[0].searchAreas.length).toBe(
        visionRequestBody.searchAreas.length
      )
      expect(userWithVisions.visions[0].searchAreas[0].type).toBe(
        visionRequestBody.searchAreas[0].type
      )
      expect(userWithVisions.visions[0].searchAreas[0].coordinates.length).toBe(
        visionRequestBody.searchAreas[0].coordinates.length
      )

      userWithVisions.visions = []
      await userWithVisions.save()
    })

    it('should create user vision when user already has visions', async () => {
      user.visions = []
      user.visions.push({
        layers: [{ name: Layer.URBAN_LICENSING }],
        searchAreas: [defaultPolygon as any],
        buffer: 0,
        name: 'My vision 1',
        mapType: 'dark'
      })

      await user.save()

      const visionRequestBody = {
        layers: [{ name: Layer.ENVIRONMENTAL_LICENSING }],
        searchAreas: [defaultPolygon],
        buffer: 10,
        name: 'My vision 2',
        mapType: 'light'
      }

      const { status, body } = await request(httpServer)
        .post(VISION_URL)
        .send(visionRequestBody)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(201)
      expect(body).toBeDefined()
      expect(body._id).toBeDefined()
      expect(body.name).toBe(visionRequestBody.name)
      expect(body.mapType).toBe(visionRequestBody.mapType)
      expect(body.buffer).toBe(visionRequestBody.buffer)
      expect(body.layers[0].name).toBe(visionRequestBody.layers[0].name)
      expect(body.searchAreas.length).toBe(visionRequestBody.searchAreas.length)
      expect(body.searchAreas[0].type).toBe(visionRequestBody.searchAreas[0].type)
      expect(body.searchAreas[0].coordinates.length).toBe(
        visionRequestBody.searchAreas[0].coordinates.length
      )

      const userWithVisions = await userService.findOneById(user._id, ['visions'])
      expect(userWithVisions).toBeDefined()
      expect(userWithVisions.visions).toBeDefined()
      expect(userWithVisions.visions.length).toBe(2)
      expect(userWithVisions.visions[0].name).toBe('My vision 1')
      expect(userWithVisions.visions[1]['_id'].toString()).toBe(body._id)
      expect(userWithVisions.visions[1].name).toBe(visionRequestBody.name)
      expect(userWithVisions.visions[1].mapType).toBe(visionRequestBody.mapType)
      expect(userWithVisions.visions[1].buffer).toBe(visionRequestBody.buffer)
      expect(userWithVisions.visions[1].layers[0].name).toBe(visionRequestBody.layers[0].name)
      expect(userWithVisions.visions[1].searchAreas.length).toBe(
        visionRequestBody.searchAreas.length
      )
      expect(userWithVisions.visions[1].searchAreas[0].type).toBe(
        visionRequestBody.searchAreas[0].type
      )
      expect(userWithVisions.visions[1].searchAreas[0].coordinates.length).toBe(
        visionRequestBody.searchAreas[0].coordinates.length
      )

      userWithVisions.visions = []
      await userWithVisions.save()
    })

    it('should create user vision with multiple layers', async () => {
      const visionRequestBody = {
        layers: [{ name: Layer.URBAN_LICENSING }, { name: Layer.ENVIRONMENTAL_LICENSING }],
        searchAreas: [defaultPolygon],
        buffer: 0,
        name: 'My vision',
        mapType: 'dark'
      }

      const { status, body } = await request(httpServer)
        .post(VISION_URL)
        .send(visionRequestBody)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(201)
      expect(body).toBeDefined()
      expect(body._id).toBeDefined()
      expect(body.layers.length).toBe(visionRequestBody.layers.length)
      expect(body.layers[0].name).toBe(visionRequestBody.layers[0].name)
      expect(body.layers[1].name).toBe(visionRequestBody.layers[1].name)

      const userWithVisions = await userService.findOneById(user._id, ['visions'])
      expect(userWithVisions).toBeDefined()
      expect(userWithVisions.visions).toBeDefined()
      expect(userWithVisions.visions.length).toBe(1)
      expect(userWithVisions.visions[0]['_id'].toString()).toBe(body._id)
      expect(userWithVisions.visions[0].layers.length).toBe(visionRequestBody.layers.length)
      expect(userWithVisions.visions[0].layers[0].name).toBe(visionRequestBody.layers[0].name)
      expect(userWithVisions.visions[0].layers[1].name).toBe(visionRequestBody.layers[1].name)

      userWithVisions.visions = []
      await userWithVisions.save()
    })

    it('should create user vision with multiple search areas', async () => {
      const visionRequestBody = {
        layers: [{ name: Layer.URBAN_LICENSING }],
        searchAreas: [defaultPolygon, defaultPoint],
        buffer: 10,
        name: 'My vision',
        mapType: 'dark'
      }

      const { status, body } = await request(httpServer)
        .post(VISION_URL)
        .send(visionRequestBody)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(201)
      expect(body).toBeDefined()
      expect(body._id).toBeDefined()
      expect(body.searchAreas.length).toBe(visionRequestBody.searchAreas.length)
      expect(body.searchAreas[0].type).toBe(visionRequestBody.searchAreas[0].type)
      expect(body.searchAreas[0].coordinates.length).toBe(
        visionRequestBody.searchAreas[0].coordinates.length
      )
      expect(body.searchAreas[1].type).toBe(visionRequestBody.searchAreas[1].type)
      expect(body.searchAreas[1].coordinates.length).toBe(
        visionRequestBody.searchAreas[1].coordinates.length
      )

      const userWithVisions = await userService.findOneById(user._id, ['visions'])
      expect(userWithVisions).toBeDefined()
      expect(userWithVisions.visions).toBeDefined()
      expect(userWithVisions.visions.length).toBe(1)
      expect(userWithVisions.visions[0]['_id'].toString()).toBe(body._id)
      expect(userWithVisions.visions[0].searchAreas.length).toBe(
        visionRequestBody.searchAreas.length
      )
      expect(userWithVisions.visions[0].searchAreas[0].type).toBe(
        visionRequestBody.searchAreas[0].type
      )
      expect(userWithVisions.visions[0].searchAreas[0].coordinates.length).toBe(
        visionRequestBody.searchAreas[0].coordinates.length
      )
      expect(userWithVisions.visions[0].searchAreas[1].type).toBe(
        visionRequestBody.searchAreas[1].type
      )
      expect(userWithVisions.visions[0].searchAreas[1].coordinates.length).toBe(
        visionRequestBody.searchAreas[1].coordinates.length
      )

      userWithVisions.visions = []
      await userWithVisions.save()
    })
  })

  describe('List visions', () => {
    it('should list user visions in alphabetical order', async () => {
      user.visions = []
      user.visions.push(
        {
          layers: [{ name: Layer.ENVIRONMENTAL_LICENSING }],
          searchAreas: [defaultPolygon as any],
          buffer: 10,
          name: 'My vision 2',
          mapType: 'light'
        },
        {
          layers: [{ name: Layer.URBAN_LICENSING }],
          searchAreas: [defaultPolygon as any],
          buffer: 0,
          name: 'My vision 1',
          mapType: 'dark'
        }
      )

      await user.save()

      const { status, body } = await request(httpServer)
        .get(VISION_URL)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)
      expect(body).toBeDefined()
      expect(body.length).toBe(2)
      expect(body[0].name).toBe('My vision 1')
      expect(body[0]._id).toBeDefined()
      expect(body[0].createdAt).toBeDefined()
      expect(body[1].name).toBe('My vision 2')
      expect(body[1]._id).toBeDefined()
      expect(body[1].createdAt).toBeDefined()

      user.visions = []
      await user.save()
    })

    it('should return empty list if user has no visions', async () => {
      const { status, body } = await request(httpServer)
        .get(VISION_URL)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)
      expect(body).toBeDefined()
      expect(body.length).toBe(0)
    })
  })

  describe('Get a user vision', () => {
    it('should get specified user vision', async () => {
      user.visions = []
      user.visions.push(
        {
          layers: [{ name: Layer.ENVIRONMENTAL_LICENSING }],
          searchAreas: [defaultPolygon as any],
          buffer: 10,
          name: 'My vision 2',
          mapType: 'light'
        },
        {
          layers: [{ name: Layer.URBAN_LICENSING }],
          searchAreas: [defaultPolygon as any],
          buffer: 0,
          name: 'My vision 1',
          mapType: 'dark'
        }
      )

      await user.save()

      const { status, body } = await request(httpServer)
        .get(`${VISION_URL}/${user.visions[0]['_id']}`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)
      expect(body).toBeDefined()
      expect(body._id).toBe(user.visions[0]['_id'].toString())
      expect(body.createdAt).toBeDefined()
      expect(body.updatedAt).toBeDefined()
      expect(body._id).toBe(user.visions[0]['_id'].toString())
      expect(body.name).toBe(user.visions[0].name)
      expect(body.mapType).toBe(user.visions[0].mapType)
      expect(body.buffer).toBe(user.visions[0].buffer)
      expect(body.searchAreas.length).toBe(user.visions[0].searchAreas.length)
      expect(body.searchAreas[0].type).toBe(user.visions[0].searchAreas[0].type)
      expect(body.searchAreas[0].coordinates.length).toBe(
        user.visions[0].searchAreas[0].coordinates.length
      )

      user.visions = []
      await user.save()
    })

    it('should return empty if specified user vision does not exist', async () => {
      user.visions = []
      user.visions.push({
        layers: [{ name: Layer.URBAN_LICENSING }],
        searchAreas: [defaultPolygon as any],
        buffer: 0,
        name: 'My vision 1',
        mapType: 'dark'
      })

      await user.save()

      const { status, body } = await request(httpServer)
        .get(`${VISION_URL}/507f191e810c19729de860ea`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)
      expect(body).toMatchObject({})

      user.visions = []
      await user.save()
    })

    it('should return empty if user has no visions', async () => {
      const { status, body } = await request(httpServer)
        .get(`${VISION_URL}/507f191e810c19729de860ea`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)
      expect(body).toMatchObject({})
    })
  })

  describe('Delete user vision', () => {
    it('should delete specified user vision', async () => {
      user.visions = []
      user.visions.push(
        {
          layers: [{ name: Layer.ENVIRONMENTAL_LICENSING }],
          searchAreas: [defaultPolygon as any],
          buffer: 10,
          name: 'My vision 2',
          mapType: 'light'
        },
        {
          layers: [{ name: Layer.URBAN_LICENSING }],
          searchAreas: [defaultPolygon as any],
          buffer: 0,
          name: 'My vision 1',
          mapType: 'dark'
        }
      )

      await user.save()

      const { status, body } = await request(httpServer)
        .delete(`${VISION_URL}/${user.visions[0]['_id']}`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(204)
      expect(body).toMatchObject({})

      const userDeletedVision = await userService.findOneById(user['_id'], ['visions._id'])
      expect(userDeletedVision.visions.length).toBe(1)
      expect(userDeletedVision.visions[0]['_id'].toString()).toBe(user.visions[1]['_id'].toString())

      user.visions = []
      await user.save()
    })

    it('should return empty if specified user vision does not exist', async () => {
      user.visions = []
      user.visions.push({
        layers: [{ name: Layer.URBAN_LICENSING }],
        searchAreas: [defaultPolygon as any],
        buffer: 0,
        name: 'My vision 1',
        mapType: 'dark'
      })

      await user.save()

      const { status, body } = await request(httpServer)
        .delete(`${VISION_URL}/507f191e810c19729de860ea`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(204)
      expect(body).toMatchObject({})

      const userNotDeletedVision = await userService.findOneById(user['_id'], ['visions._id'])
      expect(userNotDeletedVision.visions.length).toBe(1)
      expect(userNotDeletedVision.visions[0]['_id'].toString()).toBe(user.visions[0]['_id'].toString())

      user.visions = []
      await user.save()
    })

    it('should return empty if user has no visions', async () => {
      const { status, body } = await request(httpServer)
        .delete(`${VISION_URL}/507f191e810c19729de860ea`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(204)
      expect(body).toMatchObject({})
    })
  })
})
