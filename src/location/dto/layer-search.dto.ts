import { Type } from 'class-transformer'
import { IsEnum, IsNotEmpty, ValidateNested } from 'class-validator'

import { Layer } from '../entities/enum/layer.enum'
import { LayerFilterDto } from './layer-filter.dto'

export class LayerSearchDto {
  @IsNotEmpty({ message: 'Nome da camada é obrigatória' })
  @IsEnum(Layer, { message: `Nome da camada deve ser um dos valores: ${Object.values(Layer)}` })
  name: Layer

  @ValidateNested()
  @Type(() => LayerFilterDto)
  filter: LayerFilterDto
}
