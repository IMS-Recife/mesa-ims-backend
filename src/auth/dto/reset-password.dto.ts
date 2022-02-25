import { IsEmail, IsNotEmpty } from 'class-validator'
import { dtoValidationMessages } from '../../app.validation'

export class ResetPasswordDto {
  @IsEmail({}, { message: dtoValidationMessages.mandatoryEmail })
  email: string

  @IsNotEmpty({ message: 'Token de validação de alterar senha é obrigatório' })
  resetToken: string

  @IsNotEmpty({ message: dtoValidationMessages.mandatoryPassword })
  password: string

  @IsNotEmpty({ message: dtoValidationMessages.mandatoryPasswordConfirmation })
  passwordConfirmation: string
}
