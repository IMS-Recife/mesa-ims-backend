import { ArrayNotEmpty, IsEmail, IsEnum, IsNotEmpty } from 'class-validator'

import { dtoValidationMessages } from '../../app.validation'
import { Role } from '../entities/role.enum'

export class CreateUserDto {
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string

  @IsEmail({}, { message: dtoValidationMessages.mandatoryEmail })
  email?: string

  @IsNotEmpty({ message: dtoValidationMessages.mandatoryPassword })
  password: string

  @IsEnum(Role, { each: true, message: 'Perfil selecionado deve ser Cidadão ou Investidor' })
  @ArrayNotEmpty({ message: 'Perfil é obrigatório' },)
  roles: Role[]
}
