import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { CoordinateTypes } from '../enum/coordinate-types.enum'

export type GeometryDocument = Geometry & Document

@Schema()
export class Geometry {
  @Prop({ required: true })
  type: CoordinateTypes

  @Prop({ required: true })
  coordinates: number[] | number[][] | number[][][] | number[][][][]
}

export const GeometrySchema = SchemaFactory.createForClass(Geometry)
