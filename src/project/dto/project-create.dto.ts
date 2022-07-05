import { IsNotEmpty, IsOptional } from 'class-validator'
import { Area } from '../entities/area.schema'
import { Partner } from '../entities/partner.schema'
import { Relation } from '../entities/relation.schema'

export class ProjectDTO {
  projectId?: string

  @IsNotEmpty()
  name: string
  @IsNotEmpty()
  responsibleOrg: string
  @IsNotEmpty()
  currentState: string
  areas: Area[]
  location: string
  // thematicGroups?: string
  @IsOptional()
  thematicGroups: string
  lastUpdate: Date = new Date()
  referenceLink: string
  startDate: Date
  createdAt: Date
  phase?: string
  measurementUnit: string
  expectedQuantity: number
  executedQuantity: number
  projectValue: number
  infiltrationsSize: number
  constructionWorkValue: number
  // partners?: Partner[]
  @IsOptional()
  partners: string
  completedPercentage: number
  relations: Relation[]
}
