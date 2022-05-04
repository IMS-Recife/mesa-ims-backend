import { Area } from '../entities/area.schema'

export interface ProjectPatchDTO {
  projectId?: string
  name?: string
  responsibleOrg?: string
  areas?: Area[]
  location?: string
  partners?: string[]
  thematicGroups?: string[]
}
