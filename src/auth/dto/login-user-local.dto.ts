import { IsEmail, IsNotEmpty } from 'class-validator'
import { dtoValidationMessages } from '../../app.validation'

export class LoginUserLocalDto {
  @IsEmail({}, { message: dtoValidationMessages.mandatoryEmail })
  email: string

  @IsNotEmpty({ message: dtoValidationMessages.mandatoryPassword })
  password: string
}
