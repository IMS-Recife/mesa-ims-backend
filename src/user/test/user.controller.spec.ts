import { Test } from '@nestjs/testing'
import { INestApplication, UnauthorizedException } from '@nestjs/common'

import { Connection } from 'mongoose'
import * as request from 'supertest'

import { AppModule } from '../../app.module'
import { DatabaseService } from '../../database/database.service'
import { userStub } from './stubs/user.stub'
import { UserService } from '../user.service'
import { AuthService } from '../../auth/auth.service'
import { Role } from '../entities/role.enum'

const LOGIN_URL = '/v1/auth/login'
const USERS_URL = '/v1/users'

describe('User controller', () => {
  let app: INestApplication
  let dbConnection: Connection
  let httpServer: any
  let userService: UserService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()

    dbConnection = moduleRef.get<DatabaseService>(DatabaseService).getDbHandler()
    httpServer = app.getHttpServer()
    userService = moduleRef.get<UserService>(UserService)
  })

  afterAll(async () => {
    await dbConnection.collection('users').deleteMany({})
    await app.close()
  })

  describe('User creation', () => {
    it('should create and authenticate user if all required fields are correct', async () => {
      const userDto = userStub()
      const { status, body } = await request(httpServer).post(USERS_URL).send(userDto)
      expect(status).toBe(201)
      expect(body).toBeDefined()
      expect(body.token).toBeDefined()
      expect(body.token.accessToken).toBeDefined()

      const createdUser = await userService.findOneByEmail(userDto.email)
      expect(createdUser).toBeDefined()
      expect(createdUser.name).toBe(userDto.name)

      await createdUser.delete()
    })

    it('should fail if a user with informed e-mail already exists', async () => {
      const userDto = userStub()
      await userService.create(userDto)

      const { status, body } = await request(httpServer).post(USERS_URL).send(userDto)
      expect(status).toBe(422)
      expect(body.message).toBe('Já existe usuário cadastrado com o e-mail informado')
    })
  })

  describe('User creation with Google', () => {
    it('should create and authenticate user if all required fields are correct', async () => {
      const userDto = userStub()

      jest.spyOn(AuthService.prototype, 'verifyGoogleToken').mockImplementationOnce(async () => {
        return { email: userDto.email, name: userDto.name }
      })

      const { status, body } = await request(httpServer)
        .post(`${USERS_URL}/google`)
        .send({ credential: '123-abc', roles: [Role.CITIZEN] })

      expect(status).toBe(201)
      expect(body).toBeDefined()
      expect(body.token).toBeDefined()
      expect(body.token.accessToken).toBeDefined()

      const createdUser = await userService.findOneByEmail(userDto.email)
      expect(createdUser).toBeDefined()
      expect(createdUser.name).toBe(userDto.name)
      expect(createdUser.password).toBeNull()
      expect(createdUser.passwordResetInfo).toBeNull()

      await createdUser.delete()
    })

    it('should fail if a user with informed e-mail already exists', async () => {
      const userDto = userStub()
      await userService.create(userDto)

      jest.spyOn(AuthService.prototype, 'verifyGoogleToken').mockImplementationOnce(async () => {
        return { email: userDto.email, name: userDto.name }
      })

      const { status, body } = await request(httpServer)
        .post(`${USERS_URL}/google`)
        .send({ credential: '123-abc', roles: [Role.CITIZEN] })

      expect(status).toBe(422)
      expect(body.message).toBe('Já existe usuário cadastrado com o e-mail informado')
    })

    it('should fail if google token is invalid', async () => {
      jest.spyOn(AuthService.prototype, 'verifyGoogleToken').mockImplementationOnce(async () => {
        throw new UnauthorizedException()
      })

      const { status } = await request(httpServer)
        .post(`${USERS_URL}/google`)
        .send({ credential: '123-abc', roles: [Role.CITIZEN] })

      expect(status).toBe(401)
    })
  })

  describe('User creation with Facebook', () => {
    it('should create and authenticate user if all required fields are correct', async () => {
      const userDto = userStub()
      userDto.facebookId = '123456789'

      jest.spyOn(AuthService.prototype, 'getFacebookUserData').mockImplementationOnce(async () => {
        return { email: userDto.email, name: userDto.name, facebookId: userDto.facebookId }
      })

      const { status, body } = await request(httpServer)
        .post(`${USERS_URL}/facebook`)
        .send({ credential: '123-abc', roles: [Role.CITIZEN] })

      expect(status).toBe(201)
      expect(body).toBeDefined()
      expect(body.token).toBeDefined()
      expect(body.token.accessToken).toBeDefined()

      const createdUser = await userService.findOneByEmail(userDto.email)
      expect(createdUser).toBeDefined()
      expect(createdUser.name).toBe(userDto.name)
      expect(createdUser.password).toBeNull()
      expect(createdUser.passwordResetInfo).toBeNull()

      await createdUser.delete()
    })

    it('should fail if a user with informed e-mail already exists', async () => {
      const userDto = userStub()
      await userService.create(userDto)

      jest.spyOn(AuthService.prototype, 'getFacebookUserData').mockImplementationOnce(async () => {
        return { email: userDto.email, name: userDto.name, facebookId: '123456789' }
      })

      const { status, body } = await request(httpServer)
        .post(`${USERS_URL}/facebook`)
        .send({ credential: '123-abc', roles: [Role.CITIZEN] })

      expect(status).toBe(422)
      expect(body.message).toBe(
        'Já existe usuário cadastrado com o e-mail ou ID do Facebook informado'
      )
    })

    it('should fail if a user with informed facebook id already exists', async () => {
      const userDto = userStub()
      userDto.facebookId = '123456789'
      userDto.email = null
      await userService.create(userDto)

      jest.spyOn(AuthService.prototype, 'getFacebookUserData').mockImplementationOnce(async () => {
        return { email: userDto.email, name: userDto.name, facebookId: userDto.facebookId }
      })

      const { status, body } = await request(httpServer)
        .post(`${USERS_URL}/facebook`)
        .send({ credential: '123-abc', roles: [Role.CITIZEN] })

      expect(status).toBe(422)
      expect(body.message).toBe(
        'Já existe usuário cadastrado com o e-mail ou ID do Facebook informado'
      )
    })

    it('should fail if facebook token is invalid', async () => {
      jest.spyOn(AuthService.prototype, 'getFacebookUserData').mockImplementationOnce(async () => {
        throw new UnauthorizedException()
      })

      const { status } = await request(httpServer)
        .post(`${USERS_URL}/facebook`)
        .send({ credential: '123-abc', roles: [Role.CITIZEN] })

      expect(status).toBe(401)
    })
  })

  describe('Delete user', () => {
    it('should delete logged user', async () => {
      const user = await userService.create(userStub())

      const { status: loginStatus, body: loginBody } = await request(httpServer)
        .post(LOGIN_URL)
        .send({ email: user.email, password: '123123' })
      expect(loginStatus).toBe(200)
      const token = loginBody.token.accessToken

      const { status: deletedUserStatus } = await request(httpServer)
        .delete(`${USERS_URL}/logged-user`)
        .auth(token, { type: 'bearer' })
      expect(deletedUserStatus).toBe(204)
    })

    it('should fail if jwt token belonged to an already deleted user', async () => {
      const user = await userService.create(userStub())

      const { status: loginStatus, body: loginBody } = await request(httpServer)
        .post(LOGIN_URL)
        .send({ email: user.email, password: '123123' })
      expect(loginStatus).toBe(200)
      const token = loginBody.token.accessToken

      await user.delete()

      const { status: deletedUserStatus } = await request(httpServer)
        .delete(`${USERS_URL}/logged-user`)
        .auth(token, { type: 'bearer' })
      expect(deletedUserStatus).toBe(404)
    })
  })
})
