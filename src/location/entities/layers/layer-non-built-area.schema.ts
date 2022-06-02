import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { Location } from '../abstract-location/location.schema'

export type LayerNonBuiltAreaDocument = LayerNonBuiltArea & Document

@Schema()
export class LayerNonBuiltArea extends Location {}

export const LayerNonBuiltAreaSchema = SchemaFactory.createForClass(LayerNonBuiltArea)
