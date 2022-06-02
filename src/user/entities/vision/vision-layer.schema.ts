import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { Layer } from '../../../location/entities/enum/layer.enum'
import { VisionFilter, VisionFilterSchema } from './vision-filter.schema'

export type VisionLayerDocument = VisionLayer & Document

@Schema()
export class VisionLayer {
  @Prop({ enum: Layer, required: true })
  name: Layer

  @Prop({ type: VisionFilterSchema, required: false })
  filter?: VisionFilter
}

export const VisionLayerSchema = SchemaFactory.createForClass(VisionLayer)
