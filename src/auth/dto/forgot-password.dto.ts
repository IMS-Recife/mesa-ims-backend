import { IsEmail } from 'class-validator'
import { dtoValidationMessages } from '../../app.validation'

export class ForgotPasswordDto {
  @IsEmail({}, { message: dtoValidationMessages.mandatoryEmail })
  email: string
}
