import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose'

import { Document } from 'mongoose'

import { Geometry, GeometrySchema } from './geometry.schema'

export type LocationDocument = Location & Document

@Schema()
export class Location {
  @Prop()
  type: string

  @Prop(raw({}))
  properties: Record<string, any>

  @Prop({ type: GeometrySchema, index: '2dsphere', required: true })
  geometry: Geometry
}

export const LocationSchema = SchemaFactory.createForClass(Location)
