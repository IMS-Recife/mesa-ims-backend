import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose'

import { Document } from 'mongoose'

import { Area, AreaSchema } from './area.schema'
import { Partner, PartnerSchema } from './partner.schema'
import { Relation, RelationSchema } from './relation.schema'

export type ProjectDocument = Project & Document

@Schema()
export class Project {
  @Prop()
  projectId?: string

  @Prop({ required: true })
  name: string

  @Prop(raw({}))
  info?: Record<string, any>

  @Prop({ type: [AreaSchema] })
  areas?: Area[]

  @Prop({ required: true })
  responsibleOrg?: string

  @Prop()
  referenceLink?: string

  @Prop({ required: false })
  startDate?: Date

  @Prop()
  createdAt?: Date

  @Prop()
  phase?: string

  @Prop({ required: true })
  currentState: string

  @Prop()
  measurementUnit: string

  @Prop()
  expectedQuantity: number

  @Prop()
  executedQuantity: number

  @Prop()
  projectValue: number

  @Prop()
  constructionWorkValue: number

  @Prop()
  infiltrationsSize: number

  @Prop()
  completedPercentage: number

  @Prop()
  location?: string

  // @Prop({ type: [PartnerSchema] })
  // partners?: Partner
  @Prop()
  partners: string
  @Prop({ type: [RelationSchema] })
  relations?: Relation

  // @Prop()
  // thematicGroups?: string[]
  @Prop()
  thematicGroups: string

  @Prop()
  lastUpdate?: Date = new Date()
}

export const ProjectSchema = SchemaFactory.createForClass(Project)
