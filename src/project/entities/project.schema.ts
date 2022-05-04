import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose'

import { Document } from 'mongoose'

import { Area, AreaSchema } from './area.schema'

export type ProjectDocument = Project & Document

@Schema()
export class Project {
  @Prop()
  projectId?: string

  @Prop()
  name: string

  @Prop(raw({}))
  info?: Record<string, any>

  @Prop({ type: [AreaSchema] })
  areas?: Area[]

  @Prop()
  responsibleOrg?: string

  @Prop()
  location?: string

  @Prop()
  partners?: string[]

  @Prop()
  thematicGroups?: string[]

  @Prop()
  lastUpdate?: Date = new Date()
}

export const ProjectSchema = SchemaFactory.createForClass(Project)
