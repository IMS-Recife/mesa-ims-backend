import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { SoilCategories } from '../../../location/entities/enum/soil-categories.enum'

export type VisionFilterDocument = VisionFilter & Document

@Schema()
export class VisionFilter {
  @Prop({ type: [String], enum: SoilCategories, required: false })
  soilCategories?: SoilCategories[]
}

export const VisionFilterSchema = SchemaFactory.createForClass(VisionFilter)
