import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { Location } from '../abstract-location/location.schema'

/// Percentage Households Wheelchair Ramp Surroundings 2010
export type LayerPercentageHouseholdsWheelchairRampSurroundings2010Document =
  PercentageHouseholdsWheelchairRampSurroundings2010 & Document

@Schema()
export class PercentageHouseholdsWheelchairRampSurroundings2010 extends Location {}

export const PercentageHouseholdsWheelchairRampSurroundings2010Schema =
  SchemaFactory.createForClass(PercentageHouseholdsWheelchairRampSurroundings2010)
