import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose'

import { Document } from 'mongoose'

export type FilterDocument = Filter & Document

@Schema()
export class Filter {
  @Prop({ required: true, unique: true })
  key: string

  @Prop(raw({}))
  values: Record<string, any>
}

export const FilterSchema = SchemaFactory.createForClass(Filter)
