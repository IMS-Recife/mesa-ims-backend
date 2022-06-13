import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

import { Document } from 'mongoose'

export type RelationDocument = Relation & Document

@Schema()
export class Relation {
  @Prop()
  ODS: string

  @Prop()
  plans: string[]

  @Prop()
  thematicGroups: string[]

  @Prop()
  indicators: string[]
}

export const RelationSchema = SchemaFactory.createForClass(Relation)
