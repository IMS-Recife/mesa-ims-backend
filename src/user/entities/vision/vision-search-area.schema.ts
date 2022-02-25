import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { SearchCoordinateTypes } from '../../../location/entities/enum/search-coordinate-types.enum'

export type VisionSearchAreaDocument = VisionSearchArea & Document

@Schema()
export class VisionSearchArea {
  @Prop({ required: true })
  type: SearchCoordinateTypes

  @Prop({ required: true })
  coordinates: number[] | number[][] | number[][][]
}

export const VisionSearchAreaSchema = SchemaFactory.createForClass(VisionSearchArea)
