import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { VisionLayer, VisionLayerSchema } from './vision-layer.schema'
import { VisionSearchArea, VisionSearchAreaSchema } from './vision-search-area.schema'

export type VisionDocument = Vision & Document

@Schema({ timestamps: true })
export class Vision {
  @Prop({ type: [VisionLayerSchema], required: true })
  layers: VisionLayer[]

  @Prop({ type: [VisionSearchAreaSchema], index: '2dsphere', required: true })
  searchAreas: VisionSearchArea[]

  @Prop({ required: true })
  buffer: number

  @Prop({ required: true })
  mapType: string

  @Prop({ required: true })
  name: string
}

export const VisionSchema = SchemaFactory.createForClass(Vision)
