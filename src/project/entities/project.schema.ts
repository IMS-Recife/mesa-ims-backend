import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose'

import { Document } from 'mongoose'

import { Area, AreaSchema } from './area.schema'

export type ProjectDocument = Project & Document

@Schema()
export class Project {
  @Prop({ required: true })
  name: string

  @Prop(raw({}))
  info: Record<string, any>

  @Prop({ type: [AreaSchema] })
  areas: Area[]
}

export const ProjectSchema = SchemaFactory.createForClass(Project)
