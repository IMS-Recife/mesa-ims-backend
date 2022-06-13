import { Area } from '../entities/area.schema'
import { Partner } from '../entities/partner.schema'
import { Relation } from '../entities/relation.schema'

export interface ProjectPatchDTO {
  name: string
  responsibleOrg: string
  currentState: string
  areas: Area[]
  location: string
  thematicGroups: string
  lastUpdate: Date
  referenceLink: string
  startDate: Date
  createdAt: Date
  phase: string
  measurementUnit: string
  expectedQuantity: number
  executedQuantity: number
  projectValue: number
  infiltrationsSize: number
  constructionWorkValue: number
  completedPercentage: number
  partners: string
  Relations: Relation[]
}
