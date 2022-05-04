import { IsNotEmpty } from 'class-validator'
import { Area } from '../entities/area.schema'

export class ProjectDTO {
  projectId?: string

  @IsNotEmpty()
  name: string
  @IsNotEmpty()
  responsibleOrg: string
  areas?: Area[]
  location?: string
  partners?: string[]
  thematicGroups?: string[]
  lastUpdate?: Date = new Date()
}
