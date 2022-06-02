import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { Location } from '../abstract-location/location.schema'

export type LayerTreeDocument = LayerTree & Document

@Schema()
export class LayerTree extends Location {}

export const LayerTreeSchema = SchemaFactory.createForClass(LayerTree)
