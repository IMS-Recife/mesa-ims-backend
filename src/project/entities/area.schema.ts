import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

import { Document } from 'mongoose'

import { Location, LocationSchema } from '../../location/entities/abstract-location/location.schema'

export type AreaDocument = Area & Document

@Schema()
export class Area {
  @Prop({ required: true })
  name: string

  @Prop({ type: [LocationSchema], required: true })
  locations: Location[]
}

export const AreaSchema = SchemaFactory.createForClass(Area)
