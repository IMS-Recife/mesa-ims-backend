import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { Location } from '../abstract-location/location.schema'

/// Percentage Households Wheelchair Ramp Surroundings 2010
export type LayerPercentagePopulationPiped2010Document = PercentagePopulationPiped2010 & Document

@Schema()
export class PercentagePopulationPiped2010 extends Location {}

export const PercentagePopulationPiped2010Schema = SchemaFactory.createForClass(
  PercentagePopulationPiped2010
)
