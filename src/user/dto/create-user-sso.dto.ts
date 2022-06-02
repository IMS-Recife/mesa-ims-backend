import { ArrayNotEmpty, IsEnum, IsNotEmpty } from 'class-validator'

import { dtoValidationMessages } from '../../app.validation'
import { Role } from '../entities/role.enum'

export class CreateUserSSODto {
  @IsNotEmpty({ message: dtoValidationMessages.mandatoryThirdPartyCredential })
  credential: string

  @IsEnum(Role, { each: true, message: 'Perfil selecionado deve ser Cidadão ou Investidor' })
  @ArrayNotEmpty({ message: 'Perfil é obrigatório' })
  roles: Role[]
}
