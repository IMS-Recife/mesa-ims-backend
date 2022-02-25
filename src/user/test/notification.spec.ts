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
import { NotificationTag } from '../entities/notification/notification-tag.enum'

const LOGIN_URL = '/v1/auth/login'
const VISION_URL = '/v1/users/visions'
const NOTIFICATION_URL = '/v1/users/notifications'
const UNREAD_COUNT_SUFFIX = '/unread-count'
const MARK_AS_READ_SUFFIX = '/mark-as-read'
const MARK_ALL_AS_READ_SUFFIX = '/mark-all-as-read'

const VISION_NAMES = ['Minha visão 1', 'Minha visão 2', 'Minha visão 3']

describe('User controller - notifications', () => {
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

  describe('Notification creation', () => {
    it('should create new vision notification when a vision is created', async () => {
      const visionRequestBody = {
        layers: [{ name: Layer.URBAN_LICENSING }],
        searchAreas: [
          {
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
        ],
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

      const userWithNotifs = await userService.findOneById(user._id, ['notifications'])
      expect(userWithNotifs).toBeDefined()
      expect(userWithNotifs.notifications).toBeDefined()
      expect(userWithNotifs.notifications.length).toBe(1)
      expect(userWithNotifs.notifications[0]['_id']).toBeDefined()
      expect(userWithNotifs.notifications[0].tag).toBe(NotificationTag.NEW_VISION)
      expect(userWithNotifs.notifications[0].isRead).toBeFalsy()
      expect(userWithNotifs.notifications[0].details).toBeDefined()
      expect(userWithNotifs.notifications[0].details.visionName).toBe(visionRequestBody.name)
      expect(userWithNotifs.notifications[0]['createdAt']).toBeDefined()
      expect(userWithNotifs.notifications[0]['updatedAt']).toBeDefined()

      userWithNotifs.notifications = []
      await userWithNotifs.save()
    })
  })

  describe('List notifications', () => {
    it('should list all user notifications without limit in insertion order', async () => {
      user.notifications = []
      user.notifications.push(
        {
          tag: NotificationTag.NEW_VISION,
          isRead: false,
          details: { visionName: VISION_NAMES[0] }
        },
        {
          tag: NotificationTag.NEW_VISION,
          isRead: false,
          details: { visionName: VISION_NAMES[1] }
        },
        {
          tag: NotificationTag.NEW_VISION,
          isRead: false,
          details: { visionName: VISION_NAMES[2] }
        }
      )

      await user.save()

      const { status, body } = await request(httpServer)
        .get(NOTIFICATION_URL)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)
      expect(body).toBeDefined()
      expect(body.length).toBe(3)

      for (let i = 0; i < body.length; i++) {
        const notification = body[i]

        expect(notification._id).toBeDefined()
        expect(notification.tag).toBe(NotificationTag.NEW_VISION)
        expect(notification.isRead).toBeFalsy()
        expect(notification.details.visionName).toBe(VISION_NAMES[i])
        expect(notification.createdAt).toBeDefined()
        expect(notification.updatedAt).toBeDefined()
      }

      user.notifications = []
      await user.save()
    })

    it('should list user notifications limited by query param in insertion order', async () => {
      user.notifications = []
      user.notifications.push(
        {
          tag: NotificationTag.NEW_VISION,
          isRead: false,
          details: { visionName: VISION_NAMES[0] }
        },
        {
          tag: NotificationTag.NEW_VISION,
          isRead: false,
          details: { visionName: VISION_NAMES[1] }
        }
      )

      await user.save()

      const { status, body } = await request(httpServer)
        .get(NOTIFICATION_URL)
        .query({ limit: 1 })
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)
      expect(body).toBeDefined()
      expect(body.length).toBe(1)

      expect(body[0]._id).toBeDefined()
      expect(body[0].tag).toBe(NotificationTag.NEW_VISION)
      expect(body[0].isRead).toBeFalsy()
      expect(body[0].details.visionName).toBe(VISION_NAMES[0])
      expect(body[0].createdAt).toBeDefined()
      expect(body[0].updatedAt).toBeDefined()

      user.notifications = []
      await user.save()
    })

    it('should return empty if user has no notifications', async () => {
      const { status, body } = await request(httpServer)
        .get(NOTIFICATION_URL)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)
      expect(body).toBeDefined()
      expect(body.length).toBe(0)
    })
  })

  describe('Count unread notifications', () => {
    it('should correctly count unread notifications if all are unread', async () => {
      user.notifications = []
      user.notifications.push(
        {
          tag: NotificationTag.NEW_VISION,
          isRead: false,
          details: { visionName: VISION_NAMES[0] }
        },
        {
          tag: NotificationTag.NEW_VISION,
          isRead: false,
          details: { visionName: VISION_NAMES[1] }
        }
      )

      await user.save()

      const { status, body } = await request(httpServer)
        .get(`${NOTIFICATION_URL}${UNREAD_COUNT_SUFFIX}`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)
      expect(body).toBeDefined()
      expect(body.notificationsCount).toBe(2)

      user.notifications = []
      await user.save()
    })

    it('should correctly count unread notifications if some are unread', async () => {
      user.notifications = []
      user.notifications.push(
        {
          tag: NotificationTag.NEW_VISION,
          isRead: false,
          details: { visionName: VISION_NAMES[0] }
        },
        {
          tag: NotificationTag.NEW_VISION,
          isRead: true,
          details: { visionName: VISION_NAMES[1] }
        }
      )

      await user.save()

      const { status, body } = await request(httpServer)
        .get(`${NOTIFICATION_URL}${UNREAD_COUNT_SUFFIX}`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)
      expect(body).toBeDefined()
      expect(body.notificationsCount).toBe(1)

      user.notifications = []
      await user.save()
    })

    it('should return zero unread notifications if there are no notifications', async () => {
      const { status, body } = await request(httpServer)
        .get(`${NOTIFICATION_URL}${UNREAD_COUNT_SUFFIX}`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)
      expect(body).toBeDefined()
      expect(body.notificationsCount).toBe(0)
    })
  })

  describe('Mark notifications as read', () => {
    it('should mark notifications as read by all IDs', async () => {
      user.notifications = []
      user.notifications.push(
        {
          tag: NotificationTag.NEW_VISION,
          isRead: false,
          details: { visionName: VISION_NAMES[0] }
        },
        {
          tag: NotificationTag.NEW_VISION,
          isRead: false,
          details: { visionName: VISION_NAMES[1] }
        }
      )

      await user.save()

      const notificationIds = user.notifications.map((notification) =>
        notification['_id'].toString()
      )

      const { status } = await request(httpServer)
        .put(`${NOTIFICATION_URL}${MARK_AS_READ_SUFFIX}`)
        .send({ notificationIds })
        .auth(token, { type: 'bearer' })

      expect(status).toBe(204)

      user = await userService.findOneById(user._id, ['notifications'])
      for (const notification of user.notifications) {
        expect(notification.isRead).toBeTruthy()
      }

      user.notifications = []
      await user.save()
    })

    it('should mark notifications as read by some IDs', async () => {
      user.notifications = []
      user.notifications.push(
        {
          tag: NotificationTag.NEW_VISION,
          isRead: false,
          details: { visionName: VISION_NAMES[0] }
        },
        {
          tag: NotificationTag.NEW_VISION,
          isRead: false,
          details: { visionName: VISION_NAMES[1] }
        }
      )

      await user.save()

      const { status } = await request(httpServer)
        .put(`${NOTIFICATION_URL}${MARK_AS_READ_SUFFIX}`)
        .send({ notificationIds: [user.notifications[1]['_id'].toString()] })
        .auth(token, { type: 'bearer' })

      expect(status).toBe(204)

      user = await userService.findOneById(user._id, ['notifications'])
      expect(user.notifications[0].isRead).toBeFalsy()
      expect(user.notifications[1].isRead).toBeTruthy()

      user.notifications = []
      await user.save()
    })

    it('should mark all notifications as read without IDs', async () => {
      user.notifications = []
      user.notifications.push(
        {
          tag: NotificationTag.NEW_VISION,
          isRead: false,
          details: { visionName: VISION_NAMES[0] }
        },
        {
          tag: NotificationTag.NEW_VISION,
          isRead: false,
          details: { visionName: VISION_NAMES[1] }
        }
      )

      await user.save()

      const { status } = await request(httpServer)
        .put(`${NOTIFICATION_URL}${MARK_ALL_AS_READ_SUFFIX}`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(204)

      user = await userService.findOneById(user._id, ['notifications'])
      for (const notification of user.notifications) {
        expect(notification.isRead).toBeTruthy()
      }

      user.notifications = []
      await user.save()
    })
  })
})
