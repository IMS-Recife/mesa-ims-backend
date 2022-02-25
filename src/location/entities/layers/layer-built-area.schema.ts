import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { Location } from '../abstract-location/location.schema'

export type LayerBuiltAreaDocument = LayerBuiltArea & Document

@Schema()
export class LayerBuiltArea extends Location {}

export const LayerBuiltAreaSchema = SchemaFactory.createForClass(LayerBuiltArea)
