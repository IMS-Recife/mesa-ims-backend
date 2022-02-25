import { Type } from 'class-transformer'
import { ArrayNotEmpty, IsNumber, ValidateNested } from 'class-validator'

import { dtoValidationMessages } from '../../app.validation'
import { CoordinatesSearchDto } from './coordinates-search.dto'
import { LayerSearchDto } from './layer-search.dto'

export class GetLayersDto {
  @ValidateNested({ message: dtoValidationMessages.mandatoryLayers })
  @ArrayNotEmpty({ message: dtoValidationMessages.mandatoryLayers })
  @Type(() => LayerSearchDto)
  layers: LayerSearchDto[]

  @ValidateNested({ message: dtoValidationMessages.mandatorySearchArea })
  @ArrayNotEmpty({ message: dtoValidationMessages.mandatorySearchArea })
  @Type(() => CoordinatesSearchDto)
  searchAreas: CoordinatesSearchDto[]

  @IsNumber({}, { message: 'Buffer deve ser um número em metros' })
  buffer: number = 30
}
