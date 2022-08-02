import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { Location } from '../abstract-location/location.schema'

export type LayerTotalRecifeLineDocument = LayerTotalRecifeLine & Document

@Schema()
// TotalRecifeLine
export class LayerTotalRecifeLine extends Location {}

export const LayerTotalRecifeLineSchema = SchemaFactory.createForClass(LayerTotalRecifeLine)
