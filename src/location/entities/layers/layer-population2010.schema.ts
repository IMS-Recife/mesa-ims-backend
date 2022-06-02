import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { Location } from '../abstract-location/location.schema'

export type LayerPopulation2010Document = LayerPopulation2010 & Document

@Schema()
export class LayerPopulation2010 extends Location {}

export const LayerPopulation2010Schema = SchemaFactory.createForClass(LayerPopulation2010)
