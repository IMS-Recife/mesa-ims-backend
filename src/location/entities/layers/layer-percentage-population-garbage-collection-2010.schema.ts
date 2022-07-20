import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { Location } from '../abstract-location/location.schema'

/// Percentage Households Wheelchair Ramp Surroundings 2010
export type LayerPercentagePopulationGarbageCollection2010Document =
  PercentagePopulationGarbageCollection2010 & Document

@Schema()
export class PercentagePopulationGarbageCollection2010 extends Location {}

export const PercentagePopulationGarbageCollection2010Schema = SchemaFactory.createForClass(
  PercentagePopulationGarbageCollection2010
)
