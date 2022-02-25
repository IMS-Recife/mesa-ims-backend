import { Test } from '@nestjs/testing'
import { INestApplication, UnauthorizedException } from '@nestjs/common'

import * as request from 'supertest'

import { AppModule } from '../../app.module'
import { userStub } from '../../user/test/stubs/user.stub'
import { AuthService } from '../auth.service'
import { UserService } from '../../user/user.service'
import { UserDocument } from '../../user/entities/user.schema'

const LOGIN_URL = '/v1/auth/login'
const LOGIN_GOOGLE_URL = '/v1/auth/login/google'
const LOGIN_FACEBOOK_URL = '/v1/auth/login/facebook'
const FORGOT_PASSOWRD_URL = '/v1/auth/forgot-password'

describe('User login', () => {
  let app: INestApplication
  let httpServer: any
  let userService: UserService
  let user: UserDocument
  let userNoPassword: UserDocument

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()

    httpServer = app.getHttpServer()
    userService = moduleRef.get<UserService>(UserService)

    const userStubOne = userStub()
    userStubOne.facebookId = '123456789'
    user = await userService.create(userStubOne)

    userNoPassword = await userService.create(userStub())
    userNoPassword.password = null
    userNoPassword.passwordResetInfo = null
    await userNoPassword.save()
  })

  afterAll(async () => {
    await user.delete()
    await userNoPassword.delete()
    await app.close()
  })

  describe('Valid login', () => {
    it('should login user', async () => {
      const { status: loginStatus, body: loginBody } = await request(httpServer)
        .post(LOGIN_URL)
        .send({ email: user.email, password: '123123' })

      expect(loginStatus).toBe(200)

      expect(loginBody.user).toBeDefined()
      expect(loginBody.user.email).toBe(user.email)
      expect(loginBody.user.name).toBe(user.name)
      expect(loginBody.user.roles.length).toBe(user.roles.length)
      expect(loginBody.user.roles[0]).toBe(user.roles[0])

      expect(loginBody.token).toBeDefined()
      expect(loginBody.token.accessToken).toBeDefined()
      expect(loginBody.token.iat).toBeDefined()
      expect(loginBody.token.exp).toBeDefined()
    })
  })

  describe('Invalid login', () => {
    it('should fail with incorrect password', async () => {
      const { status: loginStatus } = await request(httpServer)
        .post(LOGIN_URL)
        .send({ email: user.email, password: 'incorrect' })

      expect(loginStatus).toBe(401)
    })

    it('should fail with incorrect email', async () => {
      const { status: loginStatus } = await request(httpServer)
        .post(LOGIN_URL)
        .send({ email: 'incorrect@email.com', password: '123123' })

      expect(loginStatus).toBe(401)
    })

    it('should fail if user has no password (created with SSO)', async () => {
      const { status: loginStatus } = await request(httpServer)
        .post(LOGIN_URL)
        .send({ email: userNoPassword.email, password: '123123' })

      expect(loginStatus).toBe(401)
    })
  })

  describe('Google login', () => {
    it('should login if user exists', async () => {
      const result = { email: user.email, name: user.name }

      jest
        .spyOn(AuthService.prototype, 'verifyGoogleToken')
        .mockImplementationOnce(async () => result)

      const { status: loginStatus, body: loginBody } = await request(httpServer)
        .post(LOGIN_GOOGLE_URL)
        .send({ credentials: '123-abc' })

      expect(loginStatus).toBe(200)

      expect(loginBody.user).toBeDefined()
      expect(loginBody.user.email).toBe(user.email)
      expect(loginBody.user.name).toBe(user.name)
      expect(loginBody.user.roles.length).toBe(user.roles.length)
      expect(loginBody.user.roles[0]).toBe(user.roles[0])

      expect(loginBody.token).toBeDefined()
      expect(loginBody.token.accessToken).toBeDefined()
      expect(loginBody.token.iat).toBeDefined()
      expect(loginBody.token.exp).toBeDefined()
    })

    it('should fail if google token is incorrect', async () => {
      jest.spyOn(AuthService.prototype, 'verifyGoogleToken').mockImplementationOnce(async () => {
        throw new UnauthorizedException()
      })

      const { status: loginStatus } = await request(httpServer)
        .post(LOGIN_GOOGLE_URL)
        .send({ credentials: '123-abc' })

      expect(loginStatus).toBe(401)
    })

    it('should fail if user does not exist', async () => {
      jest.spyOn(AuthService.prototype, 'verifyGoogleToken').mockImplementationOnce(async () => {
        return { email: 'not-exists@email.com', name: 'John Doe' }
      })

      const { status: loginStatus } = await request(httpServer)
        .post(LOGIN_GOOGLE_URL)
        .send({ credentials: '123-abc' })

      expect(loginStatus).toBe(412)
    })
  })

  describe('Facebook login', () => {
    it('should login if user with existing email', async () => {
      jest.spyOn(AuthService.prototype, 'getFacebookUserData').mockImplementationOnce(async () => {
        return { email: user.email, name: user.name, facebookId: 'different-facebook-id' }
      })

      const { status: loginStatus, body: loginBody } = await request(httpServer)
        .post(LOGIN_FACEBOOK_URL)
        .send({ credentials: '123-abc' })

      expect(loginStatus).toBe(200)

      expect(loginBody.user).toBeDefined()
      expect(loginBody.user.email).toBe(user.email)
      expect(loginBody.user.name).toBe(user.name)
      expect(loginBody.user.roles.length).toBe(user.roles.length)
      expect(loginBody.user.roles[0]).toBe(user.roles[0])

      expect(loginBody.token).toBeDefined()
      expect(loginBody.token.accessToken).toBeDefined()
      expect(loginBody.token.iat).toBeDefined()
      expect(loginBody.token.exp).toBeDefined()
    })

    it('should login if user with existing facebook id', async () => {
      jest.spyOn(AuthService.prototype, 'getFacebookUserData').mockImplementationOnce(async () => {
        return { email: 'different@email.com', name: user.name, facebookId: user.facebookId }
      })

      const { status: loginStatus, body: loginBody } = await request(httpServer)
        .post(LOGIN_FACEBOOK_URL)
        .send({ credentials: '123-abc' })

      expect(loginStatus).toBe(200)

      expect(loginBody.user).toBeDefined()
      expect(loginBody.user.email).toBe(user.email)
      expect(loginBody.user.name).toBe(user.name)
      expect(loginBody.user.roles.length).toBe(user.roles.length)
      expect(loginBody.user.roles[0]).toBe(user.roles[0])

      expect(loginBody.token).toBeDefined()
      expect(loginBody.token.accessToken).toBeDefined()
      expect(loginBody.token.iat).toBeDefined()
      expect(loginBody.token.exp).toBeDefined()
    })

    it('should fail if facebook API does not return OK', async () => {
      jest.spyOn(AuthService.prototype, 'getFacebookUserData').mockImplementationOnce(async () => {
        throw new UnauthorizedException()
      })

      const { status: loginStatus } = await request(httpServer)
        .post(LOGIN_FACEBOOK_URL)
        .send({ credentials: '123-abc' })

      expect(loginStatus).toBe(401)
    })

    it('should fail if user does not exist', async () => {
      jest.spyOn(AuthService.prototype, 'getFacebookUserData').mockImplementationOnce(async () => {
        return {
          facebookId: 'not-existing-id',
          name: 'John Doe',
          email: 'not-existing-id@email.com'
        }
      })

      const { status: loginStatus } = await request(httpServer)
        .post(LOGIN_FACEBOOK_URL)
        .send({ credentials: '123-abc' })

      expect(loginStatus).toBe(412)
    })
  })

  describe('Forgot password', () => {
    it('should return ok and set forgot password info with correct email', async () => {
      const { status } = await request(httpServer)
        .post(FORGOT_PASSOWRD_URL)
        .send({ email: user.email })

      expect(status).toBe(200)

      const updatedUser = await userService.findOneByEmail(user.email)
      expect(updatedUser.passwordResetInfo).toBeDefined()
      expect(updatedUser.passwordResetInfo.resetExpiration).toBeDefined()
      expect(updatedUser.passwordResetInfo.resetToken).toBeDefined()
    })

    it('should return ok with incorrect email', async () => {
      const { status } = await request(httpServer)
        .post(FORGOT_PASSOWRD_URL)
        .send({ email: 'incorrect@email.com' })

      expect(status).toBe(200)
    })

    it('should return ok if user has no password (created with SSO)', async () => {
      const { status } = await request(httpServer)
        .post(FORGOT_PASSOWRD_URL)
        .send({ email: userNoPassword.email })

      expect(status).toBe(200)

      const updatedUser = await userService.findOneByEmail(userNoPassword.email)
      expect(updatedUser.passwordResetInfo).toBeNull()
    })
  })
})
