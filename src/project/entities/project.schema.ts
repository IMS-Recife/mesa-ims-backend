import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose'

import { Document } from 'mongoose'

import { Area, AreaSchema } from './area.schema'

export type ProjectDocument = Project & Document

@Schema()
export class Project {
  @Prop({ required: true })
  projectId: string

  @Prop({ required: true })
  name: string

  @Prop(raw({}))
  info: Record<string, any>

  @Prop({ type: [AreaSchema] })
  areas: Area[]

  @Prop({ required: true })
  responsible: string

  @Prop({ required: true })
  place: string

  @Prop()
  partners: string[]

  @Prop()
  thematicGroups: string[]
}

export const ProjectSchema = SchemaFactory.createForClass(Project)
