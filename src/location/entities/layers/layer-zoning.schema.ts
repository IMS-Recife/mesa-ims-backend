import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { Location } from '../abstract-location/location.schema'

export type LayerZoningDocument = LayerZoning & Document

@Schema()
// Zoning
export class LayerZoning extends Location {}

export const LayerZoningSchema = SchemaFactory.createForClass(LayerZoning)
