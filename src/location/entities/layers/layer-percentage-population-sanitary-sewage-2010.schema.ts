import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { Location } from '../abstract-location/location.schema'

/// Percentage Households Wheelchair Ramp Surroundings 2010
export type LayerPercentagePopulationSanitarySewage2010Document =
  PercentagePopulationSanitarySewage2010 & Document

@Schema()
export class PercentagePopulationSanitarySewage2010 extends Location {}

export const PercentagePopulationSanitarySewage2010Schema = SchemaFactory.createForClass(
  PercentagePopulationSanitarySewage2010
)
