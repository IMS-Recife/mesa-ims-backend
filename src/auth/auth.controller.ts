import { Body, Controller, HttpCode, Post } from '@nestjs/common'

import { AuthService } from './auth.service'
import { Public } from './constants'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { LoginUserLocalDto } from './dto/login-user-local.dto'
import { LoginUserSSODto } from './dto/login-user-sso.dto'

@Controller('v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('/login')
  @HttpCode(200)
  async login(@Body() loginUserDto: LoginUserLocalDto) {
    return this.authService.login(loginUserDto.email, loginUserDto.password)
  }

  @Public()
  @Post('/login/google')
  @HttpCode(200)
  async loginGoogle(@Body() loginUserDto: LoginUserSSODto) {
    return this.authService.loginGoogle(loginUserDto.credential)
  }

  @Public()
  @Post('/login/facebook')
  @HttpCode(200)
  async loginFacebook(@Body() loginUserDto: LoginUserSSODto) {
    return this.authService.loginFacebook(loginUserDto.credential)
  }

  @Public()
  @Post('/forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email)
  }

  @Public()
  @Post('/forgot-password/reset')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto)
  }
}
