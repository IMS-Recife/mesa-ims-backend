import { IsEnum, IsOptional } from 'class-validator'

import { SoilCategories } from '../entities/enum/soil-categories.enum'

export class LayerFilterDto {
  @IsOptional()
  @IsEnum(SoilCategories, { each: true, message: `Categoria do solo deve ser um dos valores: ${Object.values(SoilCategories)}` })
  soilCategories: SoilCategories[]
}
