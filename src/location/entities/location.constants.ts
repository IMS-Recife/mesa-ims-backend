import { SoilCategories } from './enum/soil-categories.enum'

export const FEATURE = 'Feature'

export const SoilUsageTypes = {
  [SoilCategories.Habitacional]: [
    'CASA',
    'APARTAMENTO',
    'GARAGEM RESIDENCIAL',
    'EDIFÍCIO RESIDENCIAL',
    'MOCAMBO'
  ],
  [SoilCategories.Comercial]: [
    'CENTRO COMERCIAL/SERVIÇOS',
    'EDIFÍCIO COMERCIAL/SERVIÇOS',
    'GALPÃO',
    'GALPÃO FECHADO',
    'GARAGEM COMERCIAL',
    'HOTEL',
    'LOJA',
    'POSTO DE ABASTECIMENTO',
    'SALA'
  ],
  [SoilCategories.Misto]: ['EDIFÍCIO MISTO'],
  [SoilCategories.Industrial]: ['INDÚSTRIA', 'INDUSTRIA'],
  [SoilCategories.Especial]: ['EDIFICAÇÃO ESPECIAL'],
  [SoilCategories.Hospitalar]: ['HOSPITAL'],
  [SoilCategories.Educacional]: ['INSTITUIÇÃO EDUCACIONAL'],
  [SoilCategories.Institucional]: ['INSTITUIÇÃO FINANCEIRA'],
  [SoilCategories.Religioso]: ['TEMPLO RELIGIOSO'],
  [SoilCategories.Terreno]: ['TERRENO']
}
