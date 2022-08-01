import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { Location } from '../abstract-location/location.schema'

export type LayerMetroLineDocument = LayerMetroLine & Document

@Schema()
// metro line MetroLine
export class LayerMetroLine extends Location {}

export const LayerMetroLineSchema = SchemaFactory.createForClass(LayerMetroLine)
