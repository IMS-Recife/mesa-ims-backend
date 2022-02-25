import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
  UnauthorizedException,
  UnprocessableEntityException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

import * as bcrypt from 'bcrypt'
import { OAuth2Client, TokenPayload } from 'google-auth-library'
import axios, { AxiosResponse } from 'axios'

import { ListUserDto } from '../user/dto/list-user.dto'
import { MailService } from '../mail/mail.service'
import { UserService } from '../user/user.service'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { UserDocument } from '../user/entities/user.schema'

@Injectable()
export class AuthService {
  private readonly googleClientId: string

  constructor(
    private jwtService: JwtService,
    private mailService: MailService,
    private userService: UserService,
    configService: ConfigService
  ) {
    this.googleClientId = configService.get<string>('GOOGLE_CLIENT_ID')
  }

  async login(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email)

    if (user && user.password) {
      const isMatch = await bcrypt.compare(pass, user.password)

      if (isMatch) {
        return this.signUser(user)
      }
    }

    throw new UnauthorizedException()
  }

  signUser(user: UserDocument) {
    const payload = { email: user.email, sub: user._id, roles: user.roles }
    const accessToken = this.jwtService.sign(payload)
    const decodedToken = this.jwtService.decode(accessToken)

    const userDto = new ListUserDto(user)

    return {
      user: {
        ...userDto
      },
      token: {
        accessToken: accessToken,
        iat: decodedToken['iat'],
        exp: decodedToken['exp']
      }
    }
  }

  async loginGoogle(credential: string): Promise<any> {
    const { email } = await this.verifyGoogleToken(credential)

    const user = await this.userService.findOneByEmail(email)

    if (!user) {
      throw new PreconditionFailedException(
        'Login via Google aceito, mas usuário deve informar um perfil antes de ter acesso ao sistema'
      )
    }

    return this.signUser(user)
  }

  async verifyGoogleToken(credential: string): Promise<{
    email: string
    name: string
  }> {
    const client = new OAuth2Client(this.googleClientId)

    let payload: TokenPayload

    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: this.googleClientId
      })

      payload = ticket.getPayload()
    } catch (error) {
      throw new UnauthorizedException()
    }

    return { email: payload.email, name: payload.name }
  }

  async loginFacebook(credential: string): Promise<any> {
    const userData = await this.getFacebookUserData(credential)

    const user = await this.userService.findOneFacebookUser(userData.facebookId, userData.email)

    if (!user) {
      throw new PreconditionFailedException(
        'Login via Facebook aceito, mas usuário deve informar um perfil antes de ter acesso ao sistema'
      )
    }

    return this.signUser(user)
  }

  async getFacebookUserData(token: string) {
    let userData: any

    try {
      const response: AxiosResponse<any, any> = await axios.get(
        `https://graph.facebook.com/me?fields=id,name,email&access_token=${token}`
      )
      if (response.status < 200 || response.status > 299) {
        throw new Error()
      }

      userData = {
        facebookId: response.data.id,
        name: response.data.name,
        email: response.data.email
      }
    } catch (error) {
      throw new UnauthorizedException()
    }

    return userData
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userService.findOneByEmail(email)

    if (user && user.password) {
      await this.userService.setUserResetPasswordInfo(user)

      this.mailService.sendPasswordResetMail(
        user.email,
        user.name,
        user.passwordResetInfo.resetToken
      )
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const user = await this.userService.findOneByEmail(resetPasswordDto.email)

    await this.validatePasswordReset(user, resetPasswordDto)

    user.passwordResetInfo.previousPassword = user.password

    const newHashedPassword = await bcrypt.hash(resetPasswordDto.password, 10)
    user.password = newHashedPassword

    user.passwordResetInfo.resetExpiration = null
    user.passwordResetInfo.resetToken = null

    await user.save()
  }

  private async validatePasswordReset(user: any, resetPasswordDto: ResetPasswordDto) {
    if (!user) {
      throw new NotFoundException('Usuário com e-mail informado não encontrado')
    }

    if (resetPasswordDto.password !== resetPasswordDto.passwordConfirmation) {
      throw new UnprocessableEntityException('Senha e confirmação de senha devem ser iguais')
    }

    if (
      !user.passwordResetInfo ||
      !user.passwordResetInfo.resetToken ||
      user.passwordResetInfo.resetToken !== resetPasswordDto.resetToken
    ) {
      throw new ForbiddenException('Usuário informado não solicitou troca de senha')
    }

    const now = new Date()
    if (now > user.passwordResetInfo.resetExpiration) {
      throw new ForbiddenException(
        'Tempo limite da alteração de senha expirado. Solicite nova troca e responda o e-mail em até 30 minutos'
      )
    }

    const isMatchPreviousPass = await bcrypt.compare(
      resetPasswordDto.password,
      user.passwordResetInfo.previousPassword
    )
    const isMatchCurrentPass = await bcrypt.compare(resetPasswordDto.password, user.password)
    if (isMatchPreviousPass || isMatchCurrentPass) {
      throw new UnprocessableEntityException('Nova senha deve ser diferente da senha anterior')
    }
  }
}
