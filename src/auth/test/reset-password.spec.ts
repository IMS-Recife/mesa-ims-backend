import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'

import * as request from 'supertest'
import * as bcrypt from 'bcrypt'

import { AppModule } from '../../app.module'
import { userStub } from '../../user/test/stubs/user.stub'
import { UserService } from '../../user/user.service'
import { ResetPasswordDto } from '../dto/reset-password.dto'
import { UserDocument } from '../../user/entities/user.schema'

const RESET_PASSOWRD_URL = '/v1/auth/forgot-password/reset'

describe('Reset password', () => {
  let app: INestApplication
  let httpServer: any
  let userService: UserService
  let user: UserDocument
  let resetPasswordPayload: ResetPasswordDto

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()

    httpServer = app.getHttpServer()
    userService = moduleRef.get<UserService>(UserService)

    user = await userService.create(userStub())
  })

  beforeEach(() => {
    resetPasswordPayload = {
      password: 'new_password',
      passwordConfirmation: 'new_password',
      email: user.email,
      resetToken: 'reset-token'
    }
  })

  afterAll(async () => {
    await user.delete()
    await app.close()
  })

  describe('Invalid payload', () => {
    it('should fail if user does not exist', async () => {
      resetPasswordPayload.email = 'not.exists@email.com'

      const { status, body } = await request(httpServer)
        .post(RESET_PASSOWRD_URL)
        .send(resetPasswordPayload)

      expect(status).toBe(404)
      expect(body.message).toBe('Usuário com e-mail informado não encontrado')
    })

    it('should fail if password and confirmation do not match', async () => {
      resetPasswordPayload.passwordConfirmation = 'incorrect_confirmation'

      const { status, body } = await request(httpServer)
        .post(RESET_PASSOWRD_URL)
        .send(resetPasswordPayload)

      expect(status).toBe(422)
      expect(body.message).toBe('Senha e confirmação de senha devem ser iguais')
    })
  })

  describe('Invalid reset token', () => {
    it('should fail if user does not have password reset info', async () => {
      user.passwordResetInfo = null
      await user.save()

      const { status, body } = await request(httpServer)
        .post(RESET_PASSOWRD_URL)
        .send(resetPasswordPayload)

      expect(status).toBe(403)
      expect(body.message).toBe('Usuário informado não solicitou troca de senha')
    })

    it('should fail if user does not have reset token', async () => {
      user.passwordResetInfo = {
        previousPassword: user.password
      }
      await user.save()

      const { status, body } = await request(httpServer)
        .post(RESET_PASSOWRD_URL)
        .send(resetPasswordPayload)

      expect(status).toBe(403)
      expect(body.message).toBe('Usuário informado não solicitou troca de senha')
    })

    it('should fail if user does not have reset token', async () => {
      user.passwordResetInfo = {
        previousPassword: user.password,
        resetToken: 'wrong-token'
      }
      await user.save()

      const { status, body } = await request(httpServer)
        .post(RESET_PASSOWRD_URL)
        .send(resetPasswordPayload)

      expect(status).toBe(403)
      expect(body.message).toBe('Usuário informado não solicitou troca de senha')
    })

    it('should fail if reset time has expired', async () => {
      const previousDate = new Date()
      previousDate.setTime(previousDate.getTime() - 31 * 60 * 1000)

      user.passwordResetInfo = {
        previousPassword: user.password,
        resetToken: resetPasswordPayload.resetToken,
        resetExpiration: previousDate
      }
      await user.save()

      const { status, body } = await request(httpServer)
        .post(RESET_PASSOWRD_URL)
        .send(resetPasswordPayload)

      expect(status).toBe(403)
      expect(body.message).toBe(
        'Tempo limite da alteração de senha expirado. Solicite nova troca e responda o e-mail em até 30 minutos'
      )
    })
  })

  describe('Invalid previous passwords', () => {
    it('should fail if new password is the same as the current one', async () => {
      const futureDate = new Date()
      futureDate.setTime(futureDate.getTime() + 30 * 60 * 1000)

      const previousPasswordHash = await bcrypt.hash('previous-password', 10)

      user.passwordResetInfo = {
        previousPassword: previousPasswordHash,
        resetToken: resetPasswordPayload.resetToken,
        resetExpiration: futureDate
      }
      await user.save()

      resetPasswordPayload.password = '123123'
      resetPasswordPayload.passwordConfirmation = '123123'

      const { status, body } = await request(httpServer)
        .post(RESET_PASSOWRD_URL)
        .send(resetPasswordPayload)

      expect(status).toBe(422)
      expect(body.message).toBe('Nova senha deve ser diferente da senha anterior')
    })

    it('should fail if new password is the same as the previous one', async () => {
      const futureDate = new Date()
      futureDate.setTime(futureDate.getTime() + 30 * 60 * 1000)

      const previousPasswordHash = await bcrypt.hash(resetPasswordPayload.password, 10)

      user.passwordResetInfo = {
        previousPassword: previousPasswordHash,
        resetToken: resetPasswordPayload.resetToken,
        resetExpiration: futureDate
      }
      await user.save()

      const { status, body } = await request(httpServer)
        .post(RESET_PASSOWRD_URL)
        .send(resetPasswordPayload)

      expect(status).toBe(422)
      expect(body.message).toBe('Nova senha deve ser diferente da senha anterior')
    })
  })

  describe('Valid password reset', () => {
    it('should reset if payload and reset info are correct', async () => {
      const futureDate = new Date()
      futureDate.setTime(futureDate.getTime() + 30 * 60 * 1000)

      user.passwordResetInfo = {
        previousPassword: user.password,
        resetToken: resetPasswordPayload.resetToken,
        resetExpiration: futureDate
      }
      await user.save()

      const { status } = await request(httpServer)
        .post(RESET_PASSOWRD_URL)
        .send(resetPasswordPayload)
      expect(status).toBe(201)

      const updatedUser = await userService.findOneByEmail(user.email)
      expect(updatedUser.passwordResetInfo.resetExpiration).toBeNull()
      expect(updatedUser.passwordResetInfo.resetToken).toBeNull()

      const isMatch = await bcrypt.compare(resetPasswordPayload.password, updatedUser.password)
      expect(isMatch).toBeTruthy()
    })
  })
})
