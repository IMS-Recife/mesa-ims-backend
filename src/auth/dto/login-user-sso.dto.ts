import { IsNotEmpty } from 'class-validator'
import { dtoValidationMessages } from '../../app.validation'

export class LoginUserSSODto {
  @IsNotEmpty({ message: dtoValidationMessages.mandatoryThirdPartyCredential })
  credential: string
}
