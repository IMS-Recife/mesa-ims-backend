import { IsEnum, IsNotEmpty } from 'class-validator'

import { SearchCoordinateTypes } from '../entities/enum/search-coordinate-types.enum'

export class CoordinatesSearchDto {
  @IsNotEmpty({ message: 'Tipo de coordenada é obrigatória' })
  @IsEnum(SearchCoordinateTypes, { message: 'Tipo de coordenada deve ser ponto, linha ou polígono' })
  type: SearchCoordinateTypes

  @IsNotEmpty({ message: 'Coordenadas são obrigatórias' })
  coordinates: number[] | number[][] | number[][][]
}
