import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { Location } from '../abstract-location/location.schema'

export type LayerCycleLaneMesh2022Document = LayerCycleLaneMesh2022 & Document

@Schema()
// CycleLaneMesh2022
export class LayerCycleLaneMesh2022 extends Location {}

export const LayerCycleLaneMesh2022Schema = SchemaFactory.createForClass(LayerCycleLaneMesh2022)
