import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { Location } from '../abstract-location/location.schema'

export type LayerMetroStationDocument = LayerMetroStation & Document

@Schema()
// metro station MetroStation
export class LayerMetroStation extends Location {}

export const LayerMetroStationSchema = SchemaFactory.createForClass(LayerMetroStation)
