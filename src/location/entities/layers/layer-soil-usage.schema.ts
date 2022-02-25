import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { Location } from '../abstract-location/location.schema'

export type LayerSoilUsageDocument = LayerSoilUsage & Document

@Schema()
export class LayerSoilUsage extends Location {}

export const LayerSoilUsageSchema = SchemaFactory.createForClass(LayerSoilUsage)
