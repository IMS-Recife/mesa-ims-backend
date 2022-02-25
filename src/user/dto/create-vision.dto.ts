import { IsNotEmpty } from 'class-validator'

import { GetLayersDto } from '../../location/dto/get-layers.dto'

export class CreateVisionDto extends GetLayersDto {
  @IsNotEmpty({ message: 'Nome da visão é obrigatório' })
  name: string

  @IsNotEmpty({ message: 'Tipo de mapa é obrigatório' })
  mapType: string
}
